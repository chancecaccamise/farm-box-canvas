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
        error: err.message, 
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

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      logStep("Processing checkout session completed", { sessionId: session.id });
      
      // If this was a subscription checkout, create the subscription record
      if (session.mode === 'subscription' && session.subscription) {
        await handleSubscriptionCreated(session, supabase);
      }

      // Create Supabase client with service role key
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );
      logStep("Supabase client created");

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

      // Update the order with complete information
      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "confirmed",
          customer_name: fullSession.customer_details?.name || fullSession.shipping_details?.name,
          customer_email: fullSession.customer_details?.email,
          customer_phone: fullSession.customer_details?.phone,
          shipping_address_street: fullSession.shipping_details?.address?.line1,
          shipping_address_apartment: fullSession.shipping_details?.address?.line2,
          shipping_address_city: fullSession.shipping_details?.address?.city,
          shipping_address_state: fullSession.shipping_details?.address?.state,
          shipping_address_zip: fullSession.shipping_details?.address?.postal_code,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_session_id", session.id);

      if (error) {
        logStep("ERROR: Failed to update order", { error });
        throw error;
      }

      logStep("Order updated successfully", { sessionId: session.id, orderId: existingOrder.id });

      // Also confirm the weekly bag if this was an add-on purchase for a subscriber
      // Get weekly_bag_id from order record if not in metadata
      let weeklyBagId = fullSession.metadata?.weekly_bag_id;
      if (!weeklyBagId || weeklyBagId === 'checkout-only') {
        // Try to get from the order record we just updated
        const { data: orderRecord } = await supabase
          .from("orders")
          .select("weekly_bag_id")
          .eq("stripe_session_id", session.id)
          .single();
        weeklyBagId = orderRecord?.weekly_bag_id;
      }
      
      const hasActiveSubscription = fullSession.metadata?.has_active_subscription === 'true';
      
      if (weeklyBagId && weeklyBagId !== 'checkout-only' && hasActiveSubscription) {
        logStep("Confirming weekly bag for subscriber add-on purchase", { weeklyBagId });
        
        const { error: bagError } = await supabase
          .from("weekly_bags")
          .update({
            is_confirmed: true,
            confirmed_at: new Date().toISOString()
          })
          .eq("id", weeklyBagId);

        if (bagError) {
          logStep("WARNING: Failed to confirm weekly bag", { error: bagError, weeklyBagId });
        } else {
          logStep("Weekly bag confirmed successfully", { weeklyBagId });
        }

        // Mark add-on items as paid for this weekly bag
        const { error: updateItemsError } = await supabase
          .from("weekly_bag_items")
          .update({ is_paid: true })
          .eq("weekly_bag_id", weeklyBagId)
          .eq("item_type", "addon")
          .eq("is_paid", false); // Only update unpaid items

        if (updateItemsError) {
          logStep("WARNING: Failed to mark add-ons as paid", { error: updateItemsError, weeklyBagId });
        } else {
          logStep("Add-ons marked as paid successfully", { weeklyBagId });
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

    const updateData: any = {
      status: subscriptionStatus,
      updated_at: new Date().toISOString()
    };

    if (subscriptionStatus === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString();
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