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

    // Use service role key to reliably fetch user info
    const supabaseAuthClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
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
    let stripeCancellationSucceeded = false;

    if (subscription) {
      logStep("Found active subscription in DB", { subscriptionId: subscription.id });

      // Cancel Stripe subscription if exists
      if (subscription.stripe_subscription_id) {
        // Handle case where stripe_subscription_id might be a full object or just an ID string
        let stripeSubId: string;
        try {
          if (typeof subscription.stripe_subscription_id === 'string') {
            // Try to parse as JSON in case it's a stringified object
            const parsed = JSON.parse(subscription.stripe_subscription_id);
            stripeSubId = parsed.id || subscription.stripe_subscription_id;
          } else if (typeof subscription.stripe_subscription_id === 'object' && subscription.stripe_subscription_id.id) {
            stripeSubId = subscription.stripe_subscription_id.id;
          } else {
            stripeSubId = String(subscription.stripe_subscription_id);
          }
        } catch {
          // If parsing fails, assume it's already a plain ID string
          stripeSubId = String(subscription.stripe_subscription_id);
        }
        
        try {
          logStep("Canceling Stripe subscription", { stripeSubId });
          // Add idempotency key to prevent duplicate cancellations
          await stripe.subscriptions.cancel(stripeSubId, {
            idempotencyKey: `cancel-${stripeSubId}-${user.id}-${Date.now()}`
          });
          stripeCancellationSucceeded = true;
          logStep("Stripe subscription canceled successfully");
          cancelledStripeSubId = stripeSubId;
        } catch (stripeError: any) {
          // If subscription is already canceled in Stripe, consider it a success
          if (stripeError.code === 'resource_missing' || stripeError.message?.includes('No such subscription')) {
            logStep("Subscription already canceled in Stripe", { stripeSubId });
            stripeCancellationSucceeded = true;
            cancelledStripeSubId = stripeSubId;
          } else {
            logStep("Error canceling Stripe subscription", { error: stripeError.message });
            throw new Error(`Failed to cancel Stripe subscription: ${stripeError.message}`);
          }
        }
      } else {
        // Fallback: try to find an active subscription at Stripe
        const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
        if (customers.data.length > 0) {
          const customerId = customers.data[0].id;
          const activeSubs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
          if (activeSubs.data.length > 0) {
            try {
              await stripe.subscriptions.cancel(activeSubs.data[0].id, {
                idempotencyKey: `cancel-${activeSubs.data[0].id}-${user.id}-${Date.now()}`
              });
              stripeCancellationSucceeded = true;
              cancelledStripeSubId = activeSubs.data[0].id;
              stripeCustomerId = customerId;
              logStep("Stripe subscription found and canceled by lookup", { stripeSubId: cancelledStripeSubId });
            } catch (stripeError: any) {
              logStep("Error canceling Stripe subscription via lookup", { error: stripeError.message });
              throw new Error(`Failed to cancel Stripe subscription: ${stripeError.message}`);
            }
          }
        }
      }

      // Only update database if Stripe cancellation succeeded
      if (stripeCancellationSucceeded) {
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
          logStep("CRITICAL: Stripe canceled but DB update failed", { error: updateError });
          // Note: We cannot rollback Stripe cancellation, but we log this critical issue
          // The webhook should eventually sync this state
          throw new Error(`Failed to update subscription in database: ${updateError.message}`);
        }

        logStep("Subscription cancelled successfully (from DB record)", { 
          hadReason: !!reason,
          stripeId: cancelledStripeSubId 
        });
      }
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
      try {
        await stripe.subscriptions.cancel(activeSub.id, {
          idempotencyKey: `cancel-${activeSub.id}-${user.id}-${Date.now()}`
        });
        cancelledStripeSubId = activeSub.id;
        logStep("Stripe subscription canceled (no local record)", { stripeSubId: cancelledStripeSubId });
      } catch (stripeError: any) {
        logStep("Error canceling Stripe subscription (no local record)", { error: stripeError.message });
        throw new Error(`Failed to cancel Stripe subscription: ${stripeError.message}`);
      }

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
