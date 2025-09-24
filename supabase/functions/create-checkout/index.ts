import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: Record<string, unknown>) => {
  console.log(`[CREATE-CHECKOUT] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Function start");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Missing STRIPE_SECRET_KEY");

    // Get all Stripe Price IDs for the new box types
    const priceVeggieBagWeekly = Deno.env.get("STRIPE_PRICE_ID_VEGGIE_BAG_WEEKLY");
    const priceFullFarmBagWeekly = Deno.env.get("STRIPE_PRICE_ID_FULL_FARM_BAG_WEEKLY");
    const priceProteinPackWeekly = Deno.env.get("STRIPE_PRICE_ID_PROTEIN_PACK_WEEKLY");
    const priceVeggieBagOneTime = Deno.env.get("STRIPE_PRICE_ID_VEGGIE_BAG_ONETIME");
    const priceFullFarmBagOneTime = Deno.env.get("STRIPE_PRICE_ID_FULL_FARM_BAG_ONETIME");
    const priceProteinPackOneTime = Deno.env.get("STRIPE_PRICE_ID_PROTEIN_PACK_ONETIME");

    // Keep legacy support for old naming
    const priceSmall = Deno.env.get("STRIPE_PRICE_ID_SMALL_WEEKLY");
    const priceMedium = Deno.env.get("STRIPE_PRICE_ID_MEDIUM_WEEKLY");
    const priceLarge = Deno.env.get("STRIPE_PRICE_ID_LARGE_WEEKLY");

    if (!priceVeggieBagWeekly || !priceFullFarmBagWeekly || !priceProteinPackWeekly || 
        !priceVeggieBagOneTime || !priceFullFarmBagOneTime || !priceProteinPackOneTime) {
      throw new Error("Missing one or more Stripe price ID secrets for new box types");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");

    // Use service role key to reliably fetch user info from token
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { box_size, is_subscription = true } = await (async () => {
      try {
        const body = await req.json();
        return body || {};
      } catch {
        return {} as Record<string, unknown>;
      }
    })();

    const normalized = (String(box_size || 'full_farm_bag')).toLowerCase();
    
    // Support both new box types and legacy naming
    const supportedBoxTypes = [
      'veggie_bag', 'full_farm_bag', 'protein-pack', 'protein_pack',
      'small', 'medium', 'large'
    ];
    
    let selectedBoxType = supportedBoxTypes.includes(normalized) ? normalized : 'full_farm_bag';
    
    // Map legacy names to new names
    if (selectedBoxType === 'protein_pack') {
      selectedBoxType = 'protein-pack';
    }

    // Create comprehensive price mapping for both subscription and one-time
    const subscriptionPriceMap: Record<string, string> = {
      veggie_bag: priceVeggieBagWeekly,
      full_farm_bag: priceFullFarmBagWeekly,
      'protein-pack': priceProteinPackWeekly,
      // Legacy support
      small: priceSmall || priceVeggieBagWeekly,
      medium: priceMedium || priceFullFarmBagWeekly,
      large: priceLarge || priceProteinPackWeekly,
    };

    const oneTimePriceMap: Record<string, string> = {
      veggie_bag: priceVeggieBagOneTime,
      full_farm_bag: priceFullFarmBagOneTime,
      'protein-pack': priceProteinPackOneTime,
      // Legacy support - use one-time prices for old names too
      small: priceVeggieBagOneTime,
      medium: priceFullFarmBagOneTime,
      large: priceProteinPackOneTime,
    };

    const priceId = is_subscription ? 
      subscriptionPriceMap[selectedBoxType] : 
      oneTimePriceMap[selectedBoxType];
    
    if (!priceId) {
      throw new Error(`No price ID found for box type: ${selectedBoxType}, subscription: ${is_subscription}`);
    }

    const sessionMode = is_subscription ? "subscription" : "payment";
    
    log("Selected configuration", { 
      selectedBoxType, 
      isSubscription: is_subscription,
      sessionMode,
      priceId 
    });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Find (or not) an existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const origin = req.headers.get("origin") || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      mode: sessionMode,
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/my-plan`,
      cancel_url: `${origin}/my-plan`,
    });

    log("Session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
