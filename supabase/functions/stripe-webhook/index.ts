import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`[STRIPE-WEBHOOK] Event received: ${event.type}`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`[STRIPE-WEBHOOK] Processing session: ${session.id}`);

      // Create Supabase client with service role key
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      // Retrieve full session details with customer and shipping info
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['customer', 'shipping_details']
      });

      console.log(`[STRIPE-WEBHOOK] Full session retrieved for: ${fullSession.id}`);

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
        console.error(`[STRIPE-WEBHOOK] Error updating order:`, error);
        throw error;
      }

      console.log(`[STRIPE-WEBHOOK] Order updated successfully for session: ${session.id}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[STRIPE-WEBHOOK] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});