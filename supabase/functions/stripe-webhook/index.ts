import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received", { 
      method: req.method, 
      url: req.url,
      headers: Object.fromEntries(req.headers.entries())
    });
    
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      logStep("ERROR: STRIPE_WEBHOOK_SECRET not configured");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    logStep("Webhook secret found");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    logStep("Stripe client initialized");

    // Get raw body as Uint8Array to preserve original signature
    const rawBody = new Uint8Array(await req.arrayBuffer());
    const signature = req.headers.get("stripe-signature");

    logStep("Request details", { 
      bodyLength: rawBody.length,
      bodyPreview: new TextDecoder().decode(rawBody.slice(0, 100)) + "...",
      hasSignature: !!signature,
      signatureStart: signature?.substring(0, 20) + "...",
      webhookSecretFormat: webhookSecret?.substring(0, 8) + "..."
    });

    if (!signature) {
      logStep("ERROR: No Stripe signature in headers", { availableHeaders: Object.keys(Object.fromEntries(req.headers.entries())) });
      return new Response(JSON.stringify({ error: "No Stripe signature found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Verify webhook signature using async method for Deno compatibility
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
      logStep("Event verified and constructed", { type: event.type, id: event.id });
    } catch (err) {
      logStep("ERROR: Webhook signature verification failed", { 
        error: err instanceof Error ? err.message : 'Unknown error', 
        bodyLength: rawBody.length,
        bodyType: typeof rawBody,
        signaturePresent: !!signature,
        webhookSecretPresent: !!webhookSecret
      });
      return new Response(JSON.stringify({ error: "Webhook signature verification failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Create Supabase client with service role key FIRST
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    logStep("Supabase client created");

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      logStep("Processing checkout session completed", { sessionId: session.id });
      
      // If this was a subscription checkout, create the subscription record
      if (session.mode === 'subscription' && session.subscription) {
        await handleSubscriptionCreated(session, supabase);
      }

      // First check if order exists
      const { data: existingOrder, error: fetchError } = await supabase
        .from("orders")
        .select("id, payment_status, status, created_at")
        .eq("stripe_session_id", session.id)
        .maybeSingle();

      if (fetchError) {
        logStep("ERROR: Failed to fetch existing order", { error: fetchError });
        throw fetchError;
      }

      if (!existingOrder) {
        logStep("WARNING: No order found for session", { sessionId: session.id });
        // Don't throw error, return success to avoid retries
        return new Response(JSON.stringify({ received: true, warning: "Order not found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      logStep("Found existing order", { orderId: existingOrder.id, currentStatus: existingOrder.payment_status });

      // Retrieve full session details with customer info
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['customer']
      });
      logStep("Retrieved full session details", { 
        customerId: fullSession.customer,
        hasShipping: !!fullSession.shipping_details 
      });

      // Update the order with complete information while preserving enhanced data
      const updateData: any = {
        payment_status: "paid",
        status: "confirmed",
        updated_at: new Date().toISOString(),
      };

      // Only update customer info if it's provided by Stripe
      if (fullSession.customer_details?.name || fullSession.shipping_details?.name) {
        updateData.customer_name = fullSession.customer_details?.name || fullSession.shipping_details?.name;
      }
      if (fullSession.customer_details?.email) {
        updateData.customer_email = fullSession.customer_details?.email;
      }
      if (fullSession.customer_details?.phone) {
        updateData.customer_phone = fullSession.customer_details?.phone;
      }
      if (fullSession.shipping_details?.address) {
        updateData.shipping_address_street = fullSession.shipping_details.address.line1;
        updateData.shipping_address_apartment = fullSession.shipping_details.address.line2;
        updateData.shipping_address_city = fullSession.shipping_details.address.city;
        updateData.shipping_address_state = fullSession.shipping_details.address.state;
        updateData.shipping_address_zip = fullSession.shipping_details.address.postal_code;
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("stripe_session_id", session.id);

      if (error) {
        logStep("ERROR: Failed to update order", { error });
        throw error;
      }

      logStep("Order updated successfully", { sessionId: session.id, orderId: existingOrder.id });

      // Get order details including user selections and weekly_bag_id
      const { data: orderRecord, error: orderFetchError } = await supabase
        .from("orders")
        .select("weekly_bag_id, box_size, week_start_date, user_protein_selections, user_carb_selections, user_full_farm_bag_protein, user_full_farm_bag_carb")
        .eq("stripe_session_id", session.id)
        .single();
      
      if (orderFetchError) {
        logStep("WARNING: Failed to fetch order for bag repopulation", { error: orderFetchError });
      }
      
      let weeklyBagId = orderRecord?.weekly_bag_id;
      const hasActiveSubscription = fullSession.metadata?.has_active_subscription === 'true';
      
      // If no bag exists, create one for this order
      if ((!weeklyBagId || weeklyBagId === 'checkout-only') && orderRecord) {
        logStep("Creating weekly bag for order without bag_id", { orderId: existingOrder.id });
        
        // Calculate current week
        const currentDate = new Date();
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // Sunday
        
        // Get cutoff time
        const { data: cutoffTime, error: cutoffError } = await supabase
          .rpc('get_next_cutoff_time', { input_date: weekStart.toISOString().split('T')[0] });
        
        if (cutoffError) {
          logStep("ERROR: Failed to get cutoff time", { error: cutoffError });
        }
        
        // Get box price
        const { data: boxData } = await supabase
          .from('box_sizes')
          .select('base_price')
          .eq('name', orderRecord.box_size)
          .single();
        
        // Create weekly bag
        const { data: newBag, error: bagCreateError } = await supabase
          .from('weekly_bags')
          .insert({
            user_id: fullSession.metadata?.user_id,
            week_start_date: weekStart.toISOString().split('T')[0],
            week_end_date: weekEnd.toISOString().split('T')[0],
            cutoff_time: cutoffTime || new Date(),
            box_size: orderRecord.box_size,
            box_price: boxData?.base_price || 0,
            user_protein_selections: orderRecord.user_protein_selections,
            user_full_farm_bag_protein: orderRecord.user_full_farm_bag_protein,
            user_full_farm_bag_carb: orderRecord.user_full_farm_bag_carb,
            is_confirmed: hasActiveSubscription
          })
          .select('id')
          .single();
        
        if (bagCreateError) {
          // Handle duplicate bag scenario - fetch existing bag instead
          if (bagCreateError.code === '23505') {
            logStep("Duplicate bag detected, fetching existing bag", { weekStart: weekStart.toISOString().split('T')[0] });
            
            const { data: existingBag, error: fetchBagError } = await supabase
              .from('weekly_bags')
              .select('id')
              .eq('user_id', fullSession.metadata?.user_id)
              .eq('week_start_date', weekStart.toISOString().split('T')[0])
              .single();
            
            if (fetchBagError) {
              logStep("ERROR: Failed to fetch existing bag", { error: fetchBagError });
            } else {
              weeklyBagId = existingBag.id;
              logStep("Found existing bag", { bagId: weeklyBagId });
              
              // Check if there's a newer order for this week/box
              const { data: newerOrders } = await supabase
                .from('orders')
                .select('id, created_at')
                .eq('user_id', fullSession.metadata?.user_id)
                .eq('weekly_bag_id', weeklyBagId)
                .gt('created_at', existingOrder.created_at)
                .limit(1);
              
              if (newerOrders && newerOrders.length > 0) {
                logStep("Skipping bag update - newer order exists", {
                  currentOrder: existingOrder.id,
                  newerOrder: newerOrders[0].id,
                  currentOrderTime: existingOrder.created_at,
                  newerOrderTime: newerOrders[0].created_at
                });
                
                // Still link this order to the bag, but don't update selections
                const { error: orderUpdateError } = await supabase
                  .from('orders')
                  .update({ weekly_bag_id: weeklyBagId })
                  .eq('id', existingOrder.id);
                
                if (orderUpdateError) {
                  logStep("ERROR: Failed to update order with existing bag_id", { error: orderUpdateError });
                }
              } else {
                // This is the most recent order - proceed with bag update
                logStep("Updating bag - this is the most recent order");
                
                // Update existing bag with user selections
                const bagUpdateData: any = {
                  box_size: orderRecord.box_size,
                  box_price: boxData?.base_price || 0
                };
                
                // Clear conflicting selection fields based on box type
                if (orderRecord.box_size === 'full_farm_bag') {
                  // For Full Farm Bag, set the protein/carb selections and clear old protein pack data
                  bagUpdateData.user_protein_selections = null;
                  bagUpdateData.user_carb_selections = null;
                  if (orderRecord.user_full_farm_bag_protein) {
                    bagUpdateData.user_full_farm_bag_protein = orderRecord.user_full_farm_bag_protein;
                  }
                  if (orderRecord.user_full_farm_bag_carb) {
                    bagUpdateData.user_full_farm_bag_carb = orderRecord.user_full_farm_bag_carb;
                  }
                } else if (orderRecord.box_size === 'protein-pack') {
                  // For Protein Pack, set the selections and clear old Full Farm Bag data
                  bagUpdateData.user_full_farm_bag_protein = null;
                  bagUpdateData.user_full_farm_bag_carb = null;
                  if (orderRecord.user_protein_selections) {
                    bagUpdateData.user_protein_selections = orderRecord.user_protein_selections;
                  }
                } else {
                  // For other box types, clear all selection fields
                  bagUpdateData.user_protein_selections = null;
                  bagUpdateData.user_carb_selections = null;
                  bagUpdateData.user_full_farm_bag_protein = null;
                  bagUpdateData.user_full_farm_bag_carb = null;
                }
                
                const { error: updateBagError } = await supabase
                  .from('weekly_bags')
                  .update(bagUpdateData)
                  .eq('id', weeklyBagId);
                
                if (updateBagError) {
                  logStep("ERROR: Failed to update existing bag", { error: updateBagError });
                } else {
                  logStep("Updated existing bag with selections", { bagId: weeklyBagId });
                }
                
                // Repopulate bag items with user selections
                const { error: repopError } = await supabase
                  .rpc('populate_weekly_bag_from_template', {
                    bag_id: weeklyBagId,
                    box_size_name: orderRecord.box_size,
                    week_start: weekStart.toISOString().split('T')[0]
                  });
                
                if (repopError) {
                  logStep("ERROR: Failed to repopulate existing bag", { error: repopError });
                } else {
                  logStep("Repopulated existing bag successfully", { bagId: weeklyBagId });
                }
                
                // Link order to existing bag
                const { error: orderUpdateError } = await supabase
                  .from('orders')
                  .update({ weekly_bag_id: weeklyBagId })
                  .eq('id', existingOrder.id);
                
                if (orderUpdateError) {
                  logStep("ERROR: Failed to update order with existing bag_id", { error: orderUpdateError });
                }
              }
            }
          } else {
            logStep("ERROR: Failed to create weekly bag", { error: bagCreateError });
          }
        } else {
          weeklyBagId = newBag.id;
          logStep("Created weekly bag", { bagId: weeklyBagId });
          
          // Update order with new bag_id
          const { error: orderUpdateError } = await supabase
            .from('orders')
            .update({ weekly_bag_id: weeklyBagId })
            .eq('id', existingOrder.id);
          
          if (orderUpdateError) {
            logStep("ERROR: Failed to update order with bag_id", { error: orderUpdateError });
          }
        }
      }
      
      // Repopulate bag with user selections for all new purchases (subscription or one-time)
      if (weeklyBagId && weeklyBagId !== 'checkout-only' && orderRecord) {
        logStep("Processing weekly bag after payment", { weeklyBagId, boxSize: orderRecord.box_size });
        
        // Update weekly bag with user selections from order
        const bagUpdateData: any = {};
        
        if (orderRecord.box_size === 'protein-pack' && orderRecord.user_protein_selections) {
          bagUpdateData.user_protein_selections = orderRecord.user_protein_selections;
        }
        
        if (orderRecord.box_size === 'full_farm_bag') {
          if (orderRecord.user_full_farm_bag_protein) {
            bagUpdateData.user_full_farm_bag_protein = orderRecord.user_full_farm_bag_protein;
          }
          if (orderRecord.user_full_farm_bag_carb) {
            bagUpdateData.user_full_farm_bag_carb = orderRecord.user_full_farm_bag_carb;
          }
        }
        
        // Check if there's a confirmed template for this week/box-size
        const { data: confirmedTemplate } = await supabase
          .from('box_templates')
          .select('id')
          .eq('week_start_date', orderRecord.week_start_date)
          .eq('box_size', orderRecord.box_size)
          .eq('is_confirmed', true)
          .limit(1)
          .maybeSingle();

        // Confirm bag if:
        // 1. User has active subscription OR
        // 2. A confirmed template exists for this week/box-size
        if (hasActiveSubscription || confirmedTemplate) {
          bagUpdateData.is_confirmed = true;
          bagUpdateData.confirmed_at = new Date().toISOString();
          logStep("Bag auto-confirmed", { 
            reason: hasActiveSubscription ? 'active_subscription' : 'confirmed_template_exists',
            weeklyBagId 
          });
        }
        
        // Update the bag with selections and confirmation status
        if (Object.keys(bagUpdateData).length > 0) {
          const { error: bagError } = await supabase
            .from("weekly_bags")
            .update(bagUpdateData)
            .eq("id", weeklyBagId);

          if (bagError) {
            logStep("WARNING: Failed to update weekly bag", { error: bagError, weeklyBagId });
          } else {
            logStep("Weekly bag updated with selections", { weeklyBagId, updates: bagUpdateData });
          }
        }
        
        // Repopulate bag items with user selections (resolve a valid week_start)
        // Determine a safe week_start to use
        let weekStartUsed = orderRecord.week_start_date as string | null;
        if (!weekStartUsed) {
          const { data: wb } = await supabase
            .from('weekly_bags')
            .select('week_start_date')
            .eq('id', weeklyBagId)
            .maybeSingle();
          weekStartUsed = wb?.week_start_date || null;
        }
        if (!weekStartUsed) {
          const now = new Date();
          const monday = new Date(now);
          // Set to Monday of the current week (Mon=1)
          monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
          weekStartUsed = monday.toISOString().split('T')[0];
        }
        logStep("Repopulating bag - resolved week_start", { weeklyBagId, weekStartUsed, boxSize: orderRecord.box_size });

        const { error: populateError } = await supabase
          .rpc('populate_weekly_bag_from_template', {
            bag_id: weeklyBagId,
            box_size_name: orderRecord.box_size,
            week_start: weekStartUsed
          });
        
        if (populateError) {
          logStep("WARNING: Failed to repopulate bag", { error: populateError, weeklyBagId, weekStartUsed });
        } else {
          logStep("Bag repopulated successfully with user selections", { weeklyBagId, weekStartUsed });
        }

        // Mark add-on items as paid for subscribers
        if (hasActiveSubscription) {
          const { error: updateItemsError } = await supabase
            .from("weekly_bag_items")
            .update({ is_paid: true })
            .eq("weekly_bag_id", weeklyBagId)
            .eq("item_type", "addon")
            .eq("is_paid", false);

          if (updateItemsError) {
            logStep("WARNING: Failed to mark add-ons as paid", { error: updateItemsError, weeklyBagId });
          } else {
            logStep("Add-ons marked as paid successfully", { weeklyBagId });
          }
        }
      }
    } else if (event.type === "customer.subscription.created") {
      const subscription = event.data.object as Stripe.Subscription;
      logStep("Processing subscription created", { subscriptionId: subscription.id });
      await handleSubscriptionUpdate(subscription, supabase, 'active');
    } else if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      logStep("Processing subscription updated", { subscriptionId: subscription.id, status: subscription.status });
      await handleSubscriptionUpdate(subscription, supabase, subscription.status);
    } else if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      logStep("Processing subscription deleted", { subscriptionId: subscription.id });
      await handleSubscriptionUpdate(subscription, supabase, 'cancelled');
    } else if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice;
      logStep("Processing invoice paid", { invoiceId: invoice.id, subscriptionId: invoice.subscription });
      
      // Only process subscription invoices (not one-time payments)
      // Skip the first invoice (billing_reason: 'subscription_create') as it's handled by checkout.session.completed
      if (invoice.subscription && invoice.billing_reason === 'subscription_cycle') {
        await handleRecurringPayment(invoice, supabase, stripe);
      } else {
        logStep("Skipping invoice - not a recurring subscription cycle", { 
          hasSubscription: !!invoice.subscription, 
          billingReason: invoice.billing_reason 
        });
      }
    } else {
      logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("CRITICAL ERROR", { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

// Helper function to handle subscription creation from checkout
async function handleSubscriptionCreated(session: Stripe.Checkout.Session, supabase: any) {
  try {
    const userId = session.metadata?.user_id;
    if (!userId) {
      logStep("WARNING: No user_id in session metadata");
      return;
    }

    // Create subscription record
    const { error } = await supabase
      .from("user_subscriptions")
      .insert({
        user_id: userId,
        stripe_subscription_id: session.subscription,
        stripe_customer_id: session.customer,
        status: 'active',
        subscription_type: 'weekly',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      logStep("ERROR: Failed to create subscription record", { error });
    } else {
      logStep("Subscription record created successfully", { userId, subscriptionId: session.subscription });
    }
  } catch (error) {
    logStep("ERROR in handleSubscriptionCreated", { error });
  }
}

// Helper function to handle subscription status updates
async function handleSubscriptionUpdate(subscription: Stripe.Subscription, supabase: any, status: string) {
  try {
    let subscriptionStatus = status;
    
    // Map Stripe statuses to our enum values
    if (status === 'active') subscriptionStatus = 'active';
    else if (status === 'canceled') subscriptionStatus = 'cancelled';
    else if (status === 'past_due') subscriptionStatus = 'paused';
    else if (status === 'incomplete') subscriptionStatus = 'paused';
    else if (status === 'unpaid') subscriptionStatus = 'paused';

    // Get existing subscription data to preserve user-provided cancellation details
    const { data: existingSub } = await supabase
      .from("user_subscriptions")
      .select("cancelled_at, cancellation_reason")
      .eq("stripe_subscription_id", subscription.id)
      .maybeSingle();

    const updateData: any = {
      status: subscriptionStatus,
      updated_at: new Date().toISOString()
    };

    if (subscriptionStatus === 'cancelled') {
      // Preserve existing cancellation data if it was set by the edge function
      // Only overwrite if not already set (webhook arrived first)
      if (!existingSub?.cancelled_at) {
        updateData.cancelled_at = new Date().toISOString();
      }
      // Preserve cancellation_reason if it exists (user-provided via cancel-subscription function)
      if (!existingSub?.cancellation_reason) {
        updateData.cancellation_reason = subscription.cancellation_details?.reason || null;
      }
      logStep("Preserving cancellation details", { 
        hasExistingReason: !!existingSub?.cancellation_reason,
        hasExistingTimestamp: !!existingSub?.cancelled_at
      });
    }

    const { error } = await supabase
      .from("user_subscriptions")
      .update(updateData)
      .eq("stripe_subscription_id", subscription.id);

    if (error) {
      logStep("ERROR: Failed to update subscription", { error, subscriptionId: subscription.id });
    } else {
      logStep("Subscription updated successfully", { subscriptionId: subscription.id, status: subscriptionStatus });
    }
  } catch (error) {
    logStep("ERROR in handleSubscriptionUpdate", { error });
  }
}

// Helper function to handle recurring subscription payments (invoice.paid for subscription_cycle)
async function handleRecurringPayment(invoice: Stripe.Invoice, supabase: any, stripe: Stripe) {
  try {
    const subscriptionId = invoice.subscription as string;
    logStep("Processing recurring payment", { subscriptionId, invoiceId: invoice.id });

    // Look up the user by stripe_subscription_id
    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .select("user_id, subscription_type")
      .eq("stripe_subscription_id", subscriptionId)
      .maybeSingle();

    if (subError || !subscription) {
      logStep("ERROR: Could not find subscription record", { subscriptionId, error: subError });
      return;
    }

    const userId = subscription.user_id;
    logStep("Found user for subscription", { userId, subscriptionId });

    // Get the most recent paid order for this user to copy delivery preferences
    const { data: lastOrder, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .eq("order_type", "subscription")
      .eq("payment_status", "paid")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (orderError) {
      logStep("WARNING: Error fetching last order", { error: orderError });
    }

    if (!lastOrder) {
      logStep("WARNING: No previous order found for subscriber", { userId });
      return;
    }

    logStep("Found previous order for reference", { 
      lastOrderId: lastOrder.id, 
      boxSize: lastOrder.box_size,
      deliveryDay: lastOrder.delivery_day_preference 
    });

    // Calculate current week (Monday to Sunday)
    const now = new Date();
    const currentWeekStart = new Date(now);
    // Set to Monday of current week
    currentWeekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    currentWeekStart.setHours(0, 0, 0, 0);
    
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);

    const weekStartStr = currentWeekStart.toISOString().split('T')[0];
    const weekEndStr = currentWeekEnd.toISOString().split('T')[0];

    logStep("Calculated week dates", { weekStart: weekStartStr, weekEnd: weekEndStr });

    // Check if an order already exists for this user + week + subscription
    const { data: existingOrder, error: checkError } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", userId)
      .eq("week_start_date", weekStartStr)
      .eq("order_type", "subscription")
      .maybeSingle();

    if (checkError) {
      logStep("ERROR: Failed to check for existing order", { error: checkError });
    }

    if (existingOrder) {
      logStep("Order already exists for this week, skipping", { existingOrderId: existingOrder.id, weekStart: weekStartStr });
      return;
    }

    // Calculate delivery date based on delivery_day_preference
    const deliveryDayPreference = lastOrder.delivery_day_preference || 'Saturday';
    const deliveryDate = calculateDeliveryDate(currentWeekStart, deliveryDayPreference);
    
    logStep("Calculated delivery date", { deliveryDayPreference, deliveryDate });

    // Find or create weekly bag for current week
    const { data: existingBag, error: bagFetchError } = await supabase
      .from("weekly_bags")
      .select("id, box_size, box_price")
      .eq("user_id", userId)
      .eq("week_start_date", weekStartStr)
      .maybeSingle();

    let weeklyBagId = existingBag?.id;
    let boxSize = existingBag?.box_size || lastOrder.box_size;
    let boxPrice = existingBag?.box_price || lastOrder.box_price;

    if (bagFetchError) {
      logStep("ERROR: Failed to fetch weekly bag", { error: bagFetchError });
    }

    // Create weekly bag if it doesn't exist
    if (!weeklyBagId) {
      const { data: cutoffTime } = await supabase
        .rpc('get_next_cutoff_time', { input_date: weekStartStr });

      const { data: boxData } = await supabase
        .from('box_sizes')
        .select('base_price')
        .eq('name', lastOrder.box_size)
        .single();

      const { data: newBag, error: createBagError } = await supabase
        .from("weekly_bags")
        .insert({
          user_id: userId,
          week_start_date: weekStartStr,
          week_end_date: weekEndStr,
          cutoff_time: cutoffTime || new Date(),
          box_size: lastOrder.box_size,
          box_price: boxData?.base_price || lastOrder.box_price || 0,
          user_protein_selections: lastOrder.user_protein_selections,
          user_full_farm_bag_protein: lastOrder.user_full_farm_bag_protein,
          user_full_farm_bag_carb: lastOrder.user_full_farm_bag_carb,
          is_confirmed: true
        })
        .select("id, box_size, box_price")
        .single();

      if (createBagError) {
        logStep("ERROR: Failed to create weekly bag", { error: createBagError });
        return;
      }

      weeklyBagId = newBag.id;
      boxSize = newBag.box_size;
      boxPrice = newBag.box_price;
      logStep("Created new weekly bag", { weeklyBagId, boxSize });

      // Populate bag from template
      const { error: populateError } = await supabase
        .rpc('populate_weekly_bag_from_template', {
          bag_id: weeklyBagId,
          box_size_name: boxSize,
          week_start: weekStartStr
        });

      if (populateError) {
        logStep("WARNING: Failed to populate weekly bag", { error: populateError });
      } else {
        logStep("Populated weekly bag from template", { weeklyBagId });
      }
    }

    // Calculate total amount (box price + delivery fee)
    const deliveryFee = lastOrder.delivery_fee || 9.00;
    const addonsTotal = lastOrder.addons_total || 0;
    const totalAmount = (boxPrice || 0) + deliveryFee + addonsTotal;

    // Create new order record for this week
    const { data: newOrder, error: createOrderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        weekly_bag_id: weeklyBagId,
        order_type: "subscription",
        box_size: boxSize,
        box_price: boxPrice,
        delivery_fee: deliveryFee,
        addons_total: addonsTotal,
        total_amount: totalAmount,
        payment_status: "paid",
        status: "confirmed",
        week_start_date: weekStartStr,
        week_end_date: weekEndStr,
        delivery_date: deliveryDate,
        delivery_day_preference: deliveryDayPreference,
        delivery_time_preference: lastOrder.delivery_time_preference,
        customer_name: lastOrder.customer_name,
        customer_email: lastOrder.customer_email,
        customer_phone: lastOrder.customer_phone,
        shipping_address_street: lastOrder.shipping_address_street,
        shipping_address_apartment: lastOrder.shipping_address_apartment,
        shipping_address_city: lastOrder.shipping_address_city,
        shipping_address_state: lastOrder.shipping_address_state,
        shipping_address_zip: lastOrder.shipping_address_zip,
        delivery_notes: lastOrder.delivery_notes,
        stripe_invoice_id: invoice.id,
        user_protein_selections: lastOrder.user_protein_selections,
        user_full_farm_bag_protein: lastOrder.user_full_farm_bag_protein,
        user_full_farm_bag_carb: lastOrder.user_full_farm_bag_carb
      })
      .select("id, order_confirmation_number")
      .single();

    if (createOrderError) {
      logStep("ERROR: Failed to create recurring order", { error: createOrderError });
      return;
    }

    logStep("Successfully created recurring order", { 
      orderId: newOrder.id, 
      confirmationNumber: newOrder.order_confirmation_number,
      weekStart: weekStartStr,
      deliveryDate 
    });

  } catch (error) {
    logStep("ERROR in handleRecurringPayment", { error });
  }
}

// Helper function to calculate delivery date based on preference and week start
function calculateDeliveryDate(weekStart: Date, deliveryDayPreference: string): string {
  const dayMap: { [key: string]: number } = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
  };

  const targetDay = dayMap[deliveryDayPreference] ?? 6; // Default to Saturday
  const deliveryDate = new Date(weekStart);
  
  // weekStart is Monday (day 1), so calculate offset to target day
  // If target is Sunday (0), we need to go to the end of the week (+6 days from Monday)
  const mondayDay = 1;
  let daysToAdd = targetDay - mondayDay;
  if (daysToAdd < 0) {
    daysToAdd += 7; // Wrap to next week for Sunday
  }
  
  deliveryDate.setDate(weekStart.getDate() + daysToAdd);
  return deliveryDate.toISOString().split('T')[0];
}