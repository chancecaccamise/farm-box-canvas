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
        .select("id, payment_status, status")
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
      
      const weeklyBagId = orderRecord?.weekly_bag_id;
      const hasActiveSubscription = fullSession.metadata?.has_active_subscription === 'true';
      
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
        
        // Confirm bag for subscribers
        if (hasActiveSubscription) {
          bagUpdateData.is_confirmed = true;
          bagUpdateData.confirmed_at = new Date().toISOString();
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
        
        // Repopulate bag items with user selections
        const { error: populateError } = await supabase
          .rpc('populate_weekly_bag_from_template', {
            bag_id: weeklyBagId,
            box_size_name: orderRecord.box_size,
            week_start: orderRecord.week_start_date
          });
        
        if (populateError) {
          logStep("WARNING: Failed to repopulate bag", { error: populateError, weeklyBagId });
        } else {
          logStep("Bag repopulated successfully with user selections", { weeklyBagId });
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