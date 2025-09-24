import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MANUAL-RECOVERY] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Manual recovery started");

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      logStep("Authentication failed", { error: authError });
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    logStep("User authenticated", { userId: user.id });

    // Find pending subscription orders for this user
    const { data: pendingOrders, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .eq("payment_status", "pending")
      .eq("order_type", "subscription");

    if (fetchError) {
      logStep("Error fetching pending orders", { error: fetchError });
      throw fetchError;
    }

    logStep("Found pending orders", { count: pendingOrders?.length || 0 });

    if (!pendingOrders || pendingOrders.length === 0) {
      return new Response(JSON.stringify({ message: "No pending subscription orders found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const recoveredOrders = [];

    for (const order of pendingOrders) {
      if (!order.stripe_session_id) {
        logStep("Skipping order without stripe session", { orderId: order.id });
        continue;
      }

      try {
        // Check session status in Stripe
        const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id, {
          expand: ['customer', 'subscription']
        });

        logStep("Retrieved Stripe session", { 
          sessionId: session.id, 
          paymentStatus: session.payment_status,
          subscriptionId: session.subscription
        });

        if (session.payment_status === 'paid' && session.subscription) {
          // Update order status
          const { error: updateError } = await supabase
            .from("orders")
            .update({
              payment_status: "paid",
              status: "confirmed",
              customer_name: session.customer_details?.name || session.shipping_details?.name,
              customer_email: session.customer_details?.email,
              customer_phone: session.customer_details?.phone,
              shipping_address_street: session.shipping_details?.address?.line1,
              shipping_address_apartment: session.shipping_details?.address?.line2,
              shipping_address_city: session.shipping_details?.address?.city,
              shipping_address_state: session.shipping_details?.address?.state,
              shipping_address_zip: session.shipping_details?.address?.postal_code,
              updated_at: new Date().toISOString()
            })
            .eq("id", order.id);

          if (updateError) {
            logStep("Error updating order", { error: updateError, orderId: order.id });
            continue;
          }

          // Create subscription record
          const { error: subError } = await supabase
            .from("user_subscriptions")
            .insert({
              user_id: user.id,
              stripe_subscription_id: session.subscription,
              stripe_customer_id: session.customer,
              status: 'active',
              subscription_type: 'weekly',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (subError) {
            logStep("Error creating subscription", { error: subError, orderId: order.id });
            // Continue anyway - order was updated
          }

          recoveredOrders.push({
            orderId: order.id,
            sessionId: session.id,
            subscriptionId: session.subscription
          });

          logStep("Successfully recovered order", { 
            orderId: order.id, 
            subscriptionId: session.subscription 
          });
        } else {
          logStep("Order not paid in Stripe", { 
            orderId: order.id, 
            paymentStatus: session.payment_status,
            hasSubscription: !!session.subscription
          });
        }
      } catch (stripeError) {
        logStep("Error checking Stripe session", { 
          error: stripeError instanceof Error ? stripeError.message : stripeError,
          orderId: order.id,
          sessionId: order.stripe_session_id
        });
      }
    }

    return new Response(JSON.stringify({ 
      message: "Recovery completed", 
      recoveredOrders,
      totalProcessed: pendingOrders.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("CRITICAL ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});