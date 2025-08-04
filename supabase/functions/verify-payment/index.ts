import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Session ID is required");
    logStep("Session ID received", { sessionId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get Stripe session details
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'shipping_details']
    });
    logStep("Retrieved Stripe session", { 
      sessionId: session.id, 
      paymentStatus: session.payment_status,
      customerEmail: session.customer_details?.email 
    });

    if (session.payment_status !== 'paid') {
      logStep("Payment not completed", { paymentStatus: session.payment_status });
      return new Response(JSON.stringify({ 
        success: false, 
        payment_status: session.payment_status 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Update order in database if payment is confirmed
    const { data: order, error: updateError } = await supabaseClient
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
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_session_id", sessionId)
      .select(`
        *,
        order_items (
          id,
          product_name,
          quantity,
          price,
          item_type
        )
      `)
      .single();

    if (updateError) {
      logStep("Error updating order", { error: updateError });
      throw updateError;
    }

    logStep("Order updated successfully", { orderId: order.id });

    // Also handle weekly bag confirmation for subscribers
    if (order.weekly_bag_id && order.has_active_subscription) {
      logStep("Confirming weekly bag for subscriber", { weeklyBagId: order.weekly_bag_id });
      
      const { error: bagError } = await supabaseClient
        .from("weekly_bags")
        .update({
          is_confirmed: true,
          confirmed_at: new Date().toISOString()
        })
        .eq("id", order.weekly_bag_id);

      if (bagError) {
        logStep("WARNING: Failed to confirm weekly bag", { error: bagError });
      } else {
        logStep("Weekly bag confirmed successfully");
      }

      // Mark add-on items as paid
      const { error: updateItemsError } = await supabaseClient
        .from("weekly_bag_items")
        .update({ is_paid: true })
        .eq("weekly_bag_id", order.weekly_bag_id)
        .eq("item_type", "addon")
        .eq("is_paid", false);

      if (updateItemsError) {
        logStep("WARNING: Failed to mark add-ons as paid", { error: updateItemsError });
      } else {
        logStep("Add-ons marked as paid successfully");
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      order: order 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-payment", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});