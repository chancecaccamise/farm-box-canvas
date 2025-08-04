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
    logStep("Webhook received", { method: req.method, url: req.url });
    
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      logStep("ERROR: STRIPE_WEBHOOK_SECRET not configured");
      throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    }
    logStep("Webhook secret found");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    logStep("Stripe client initialized");

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      logStep("ERROR: No Stripe signature in headers");
      throw new Error("No Stripe signature found");
    }
    logStep("Stripe signature found");

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    logStep("Event verified and constructed", { type: event.type, id: event.id });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      logStep("Processing checkout session completed", { sessionId: session.id });

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

      // Retrieve full session details with customer and shipping info
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['customer', 'shipping_details']
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