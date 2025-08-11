import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  // deno-lint-ignore no-console
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    // Use anon key for user authentication
    const supabaseAuthClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAuthClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { reason } = await req.json().catch(() => ({ reason: null }));

    // Use service role key for database operations
    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Try to locate active subscription locally first
    const { data: subscription, error: subError } = await supabaseServiceClient
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    let cancelledStripeSubId: string | null = null;
    let stripeCustomerId: string | null = null;

    if (subscription) {
      logStep("Found active subscription in DB", { subscriptionId: subscription.id });

      // Cancel Stripe subscription if exists
      if (subscription.stripe_subscription_id) {
        logStep("Canceling Stripe subscription", { stripeSubId: subscription.stripe_subscription_id });
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
        logStep("Stripe subscription canceled");
        cancelledStripeSubId = subscription.stripe_subscription_id;
      } else {
        // Fallback: try to find an active subscription at Stripe
        const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
        if (customers.data.length > 0) {
          const customerId = customers.data[0].id;
          const activeSubs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
          if (activeSubs.data.length > 0) {
            await stripe.subscriptions.cancel(activeSubs.data[0].id);
            cancelledStripeSubId = activeSubs.data[0].id;
            stripeCustomerId = customerId;
            logStep("Stripe subscription found and canceled by lookup", { stripeSubId: cancelledStripeSubId });
          }
        }
      }

      // Update local subscription record
      const { error: updateError } = await supabaseServiceClient
        .from("user_subscriptions")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason,
          updated_at: new Date().toISOString(),
          stripe_subscription_id: cancelledStripeSubId ?? subscription.stripe_subscription_id ?? null,
          stripe_customer_id: stripeCustomerId ?? subscription.stripe_customer_id ?? null,
        })
        .eq("id", subscription.id);

      if (updateError) {
        logStep("Error updating subscription", { error: updateError });
        throw new Error(`Failed to update subscription: ${updateError.message}`);
      }

      logStep("Subscription cancelled successfully (from DB record)");
    } else {
      // No local active record - attempt to find and cancel via Stripe
      logStep("No local active subscription found, searching Stripe");
      const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
      if (customers.data.length === 0) {
        throw new Error("No active subscription found");
      }

      stripeCustomerId = customers.data[0].id;
      const activeSubs = await stripe.subscriptions.list({ customer: stripeCustomerId, status: "active", limit: 1 });
      if (activeSubs.data.length === 0) {
        throw new Error("No active subscription found");
      }

      const activeSub = activeSubs.data[0];
      await stripe.subscriptions.cancel(activeSub.id);
      cancelledStripeSubId = activeSub.id;
      logStep("Stripe subscription canceled (no local record)", { stripeSubId: cancelledStripeSubId });

      // Upsert local record to reflect cancellation
      const { error: upsertError } = await supabaseServiceClient
        .from("user_subscriptions")
        .upsert({
          user_id: user.id,
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason,
          updated_at: new Date().toISOString(),
          stripe_subscription_id: cancelledStripeSubId,
          stripe_customer_id: stripeCustomerId,
          subscription_type: "weekly",
        }, { onConflict: "user_id" });

      if (upsertError) {
        logStep("Error upserting subscription", { error: upsertError });
        throw new Error(`Failed to update subscription: ${upsertError.message}`);
      }

      logStep("Subscription cancelled successfully (via Stripe lookup)");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in cancel-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
