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
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Payment verification started");
    
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error("Session ID is required");
    }
    
    logStep("Verifying session", { sessionId });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get Stripe session details
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Retrieved Stripe session", { 
      sessionId: session.id, 
      paymentStatus: session.payment_status,
      status: session.status 
    });

    // Check if payment was successful
    const isPaymentSuccessful = session.payment_status === 'paid' && session.status === 'complete';
    
    if (!isPaymentSuccessful) {
      logStep("Payment not successful", { paymentStatus: session.payment_status, status: session.status });
      return new Response(JSON.stringify({ 
        success: false, 
        paymentStatus: session.payment_status,
        status: session.status 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Find the order in our database
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();

    if (fetchError) {
      logStep("ERROR: Failed to fetch order", { error: fetchError });
      throw fetchError;
    }

    if (!order) {
      logStep("ERROR: Order not found", { sessionId });
      throw new Error("Order not found");
    }

    // If order is already confirmed, return success
    if (order.payment_status === 'paid') {
      logStep("Order already confirmed", { orderId: order.id });
      return new Response(JSON.stringify({ 
        success: true, 
        order: order,
        alreadyConfirmed: true 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Update order status
    const fullSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'shipping_details']
    });

    const { error: updateError } = await supabase
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
      .eq("id", order.id);

    if (updateError) {
      logStep("ERROR: Failed to update order", { error: updateError });
      throw updateError;
    }

    // Fetch updated order
    const { data: updatedOrder } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order.id)
      .single();

    logStep("Order updated successfully", { orderId: order.id });

    return new Response(JSON.stringify({ 
      success: true, 
      order: updatedOrder,
      verified: true 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in payment verification", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});