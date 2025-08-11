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
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
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

    // Use service role key for DB writes (bypass RLS)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Find or create Stripe customer and check active subscription
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found; syncing cancelled state");
      await supabase.from("user_subscriptions").upsert({
        user_id: user.id,
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        stripe_customer_id: null,
        stripe_subscription_id: null,
        subscription_type: "weekly",
      }, { onConflict: "user_id" });

      return new Response(JSON.stringify({
        subscribed: false,
        status: "cancelled",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    const customerId = customers.data[0].id;
    const activeSubs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
    const hasActive = activeSubs.data.length > 0;

    if (hasActive) {
      const sub = activeSubs.data[0];
      const status = sub.status === "active" ? "active" : (sub.status === "paused" ? "paused" : "cancelled");
      const { error: upsertErr } = await supabase.from("user_subscriptions").upsert({
        user_id: user.id,
        status,
        updated_at: new Date().toISOString(),
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
        subscription_type: "weekly",
      }, { onConflict: "user_id" });
      if (upsertErr) throw upsertErr;

      logStep("Synced active subscription", { stripeSubscriptionId: sub.id });
      return new Response(JSON.stringify({
        subscribed: true,
        status,
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    // No active subs, check for most recent non-active to capture IDs
    const allSubs = await stripe.subscriptions.list({ customer: customerId, limit: 1 });
    const lastSub = allSubs.data[0];

    const { error: upsertErr } = await supabase.from("user_subscriptions").upsert({
      user_id: user.id,
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stripe_customer_id: customerId,
      stripe_subscription_id: lastSub?.id ?? null,
      subscription_type: "weekly",
    }, { onConflict: "user_id" });
    if (upsertErr) throw upsertErr;

    logStep("Synced cancelled state");
    return new Response(JSON.stringify({
      subscribed: false,
      status: "cancelled",
      stripe_customer_id: customerId,
      stripe_subscription_id: lastSub?.id ?? null,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
