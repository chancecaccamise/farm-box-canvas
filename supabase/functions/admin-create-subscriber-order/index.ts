import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-CREATE-SUBSCRIBER-ORDER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: isAdmin } = await adminClient.rpc("is_current_user_admin");
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { user_id, week_start_date } = body;

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Creating order for subscriber", { user_id, week_start_date });

    // Calculate current week if not provided
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const currentWeekStart = new Date(now);
    currentWeekStart.setUTCDate(now.getUTCDate() - daysFromMonday);
    currentWeekStart.setUTCHours(0, 0, 0, 0);
    
    const weekStartStr = week_start_date || currentWeekStart.toISOString().split('T')[0];
    const weekEnd = new Date(weekStartStr);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    logStep("Week dates calculated", { weekStartStr, weekEndStr });

    // Check if order already exists
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", user_id)
      .eq("week_start_date", weekStartStr)
      .maybeSingle();

    if (existingOrder) {
      return new Response(JSON.stringify({ 
        error: "Order already exists for this week",
        orderId: existingOrder.id 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 409,
      });
    }

    // Get subscription
    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .eq("status", "active")
      .maybeSingle();

    if (subError || !subscription) {
      logStep("No active subscription found", { user_id, error: subError });
      return new Response(JSON.stringify({ error: "No active subscription found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    logStep("Found subscription", { subscription_type: subscription.subscription_type });

    // Get delivery address
    const { data: deliveryAddress, error: addrError } = await supabase
      .from("delivery_addresses")
      .select("*")
      .eq("user_id", user_id)
      .eq("is_primary", true)
      .maybeSingle();

    if (addrError || !deliveryAddress) {
      logStep("No delivery address found", { user_id, error: addrError });
      return new Response(JSON.stringify({ error: "No delivery address found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    logStep("Found delivery address", { city: deliveryAddress.city });

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, phone")
      .eq("user_id", user_id)
      .maybeSingle();

    // Get user email from auth
    const { data: userData } = await supabase.auth.admin.getUserById(user_id);
    const userEmail = userData?.user?.email || null;

    logStep("Got user info", { 
      name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
      email: userEmail
    });

    // Get or create weekly bag for this week
    let weeklyBag;
    const { data: existingBag } = await supabase
      .from("weekly_bags")
      .select("*")
      .eq("user_id", user_id)
      .eq("week_start_date", weekStartStr)
      .maybeSingle();

    if (existingBag) {
      weeklyBag = existingBag;
      logStep("Found existing weekly bag", { bag_id: weeklyBag.id, box_size: weeklyBag.box_size });
    } else {
      // Create a new weekly bag
      const boxSize = subscription.subscription_type;
      const { data: boxSizeData } = await supabase
        .from("box_sizes")
        .select("base_price")
        .eq("name", boxSize)
        .maybeSingle();

      const boxPrice = boxSizeData?.base_price || getDefaultBoxPrice(boxSize);

      // Get next cutoff time
      const { data: cutoffTime } = await supabase.rpc("get_next_cutoff_time", {
        input_date: weekStartStr,
      });

      const { data: newBag, error: bagError } = await supabase
        .from("weekly_bags")
        .insert({
          user_id,
          week_start_date: weekStartStr,
          week_end_date: weekEndStr,
          cutoff_time: cutoffTime,
          box_size: boxSize,
          box_price: boxPrice,
          delivery_fee: 9,
          total_amount: boxPrice + 9,
        })
        .select()
        .single();

      if (bagError) {
        logStep("Error creating weekly bag", { error: bagError });
        throw bagError;
      }

      weeklyBag = newBag;
      logStep("Created new weekly bag", { bag_id: weeklyBag.id });

      // Populate bag from template
      await supabase.rpc("populate_weekly_bag_from_template", {
        bag_id: weeklyBag.id,
        box_size_name: boxSize,
        week_start: weekStartStr,
      });
    }

    // Get previous order for fallback selections
    const { data: lastOrder } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Calculate delivery day preference
    let deliveryDayPreference = lastOrder?.delivery_day_preference || "Saturday";
    const dayName = deliveryDayPreference.split(",")[0].trim();
    
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const targetDayIndex = dayNames.indexOf(dayName);
    
    if (targetDayIndex !== -1) {
      const deliveryDate = new Date(weekStartStr);
      deliveryDate.setUTCDate(deliveryDate.getUTCDate() + ((targetDayIndex - 1 + 7) % 7));
      
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      deliveryDayPreference = `${dayName}, ${monthNames[deliveryDate.getUTCMonth()]} ${deliveryDate.getUTCDate()}`;
    }

    logStep("Calculated delivery preference", { deliveryDayPreference });

    // Get selections from weekly bag or last order
    const proteinSelection = weeklyBag.user_full_farm_bag_protein || lastOrder?.user_full_farm_bag_protein;
    const carbSelection = weeklyBag.user_full_farm_bag_carb || lastOrder?.user_full_farm_bag_carb;
    const proteinSelections = weeklyBag.user_protein_selections || lastOrder?.user_protein_selections;
    const carbSelections = weeklyBag.user_carb_selections || lastOrder?.user_carb_selections;

    const boxSize = weeklyBag.box_size || subscription.subscription_type;
    const boxPrice = weeklyBag.box_price || getDefaultBoxPrice(boxSize);
    const deliveryFee = weeklyBag.delivery_fee || 9;
    const totalAmount = boxPrice + deliveryFee;

    // Create the order
    const newOrderData = {
      user_id,
      order_type: "subscription",
      box_size: boxSize,
      total_amount: totalAmount,
      box_price: boxPrice,
      status: "pending",
      payment_status: "paid", // Subscriber is already paying via Stripe
      week_start_date: weekStartStr,
      week_end_date: weekEndStr,
      weekly_bag_id: weeklyBag.id,
      has_active_subscription: true,
      customer_name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || null,
      customer_email: userEmail,
      customer_phone: profile?.phone || null,
      shipping_address_street: deliveryAddress.street_address,
      shipping_address_apartment: deliveryAddress.apartment,
      shipping_address_city: deliveryAddress.city,
      shipping_address_state: deliveryAddress.state,
      shipping_address_zip: deliveryAddress.zip_code,
      delivery_instructions: deliveryAddress.delivery_instructions,
      delivery_day_preference: deliveryDayPreference,
      delivery_time_preference: lastOrder?.delivery_time_preference || null,
      delivery_fee: deliveryFee,
      addons_total: 0,
      user_full_farm_bag_protein: proteinSelection,
      user_full_farm_bag_carb: carbSelection,
      user_protein_selections: proteinSelections,
      user_carb_selections: carbSelections,
    };

    const { data: newOrder, error: insertError } = await supabase
      .from("orders")
      .insert(newOrderData)
      .select()
      .single();

    if (insertError) {
      logStep("Error creating order", { error: insertError });
      throw insertError;
    }

    logStep("Order created successfully", { orderId: newOrder.id });

    return new Response(JSON.stringify({
      success: true,
      order: newOrder,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    logStep("Fatal error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function getDefaultBoxPrice(size: string): number {
  const prices: Record<string, number> = {
    'veggie-bag': 25,
    'full_farm_bag': 50,
    'protein-pack': 40,
    'small': 25,
    'medium': 35,
    'large': 45
  };
  return prices[size] || 50;
}
