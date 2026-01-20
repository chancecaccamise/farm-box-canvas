import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-WEEKLY-ORDERS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for optional parameters
    const body = await req.json().catch(() => ({}));
    const backfillWeeks = body.backfillWeeks || 0;

    logStep("Starting weekly order generation", { backfillWeeks });

    // Helper function to get Monday of the UPCOMING week for order generation
    // When run on Sunday, we want NEXT Monday (the upcoming week's orders)
    // When run on any other day, we want THIS week's Monday
    const getUpcomingWeekMonday = (date: Date): Date => {
      const d = new Date(date);
      const dayOfWeek = d.getUTCDay();
      
      if (dayOfWeek === 0) {
        // Sunday: get NEXT Monday (add 1 day)
        d.setUTCDate(d.getUTCDate() + 1);
      } else {
        // Any other day: get THIS week's Monday
        const daysSinceMonday = dayOfWeek - 1;
        d.setUTCDate(d.getUTCDate() - daysSinceMonday);
      }
      d.setUTCHours(0, 0, 0, 0);
      return d;
    };

    // Calculate the target week for order generation
    const now = new Date();
    const currentWeekStart = getUpcomingWeekMonday(now);
    
    // Generate list of weeks to process (current week + backfill weeks)
    const weeksToProcess: { weekStart: Date; weekEnd: Date }[] = [];
    
    for (let i = backfillWeeks; i >= 0; i--) {
      const weekStart = new Date(currentWeekStart);
      weekStart.setUTCDate(currentWeekStart.getUTCDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
      weeksToProcess.push({ weekStart, weekEnd });
    }

    logStep("Weeks to process", weeksToProcess.map(w => ({
      start: w.weekStart.toISOString().split('T')[0],
      end: w.weekEnd.toISOString().split('T')[0]
    })));

    // Get all active subscribers
    const { data: activeSubscriptions, error: subError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("status", "active");

    if (subError) {
      logStep("Error fetching subscriptions", subError);
      throw subError;
    }

    logStep("Found active subscriptions", { count: activeSubscriptions?.length || 0 });

    const results = {
      created: 0,
      skipped: 0,
      errors: 0,
      details: [] as any[],
    };

    for (const subscription of activeSubscriptions || []) {
      try {
        logStep("Processing subscriber", { userId: subscription.user_id, subscriptionType: subscription.subscription_type });

        // Get most recent order for delivery preferences (do this once per subscriber)
        const { data: lastOrder } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", subscription.user_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        // If no previous order, fetch fallback data from delivery_addresses and profiles
        let orderSourceData = lastOrder;
        
        if (!lastOrder) {
          logStep("No previous order found, fetching fallback data", { userId: subscription.user_id });
          
          // Get delivery address
          const { data: deliveryAddress } = await supabase
            .from("delivery_addresses")
            .select("*")
            .eq("user_id", subscription.user_id)
            .eq("is_primary", true)
            .maybeSingle();
          
          if (!deliveryAddress) {
            logStep("No delivery address found, skipping", { userId: subscription.user_id });
            results.skipped++;
            results.details.push({ userId: subscription.user_id, status: "skipped", reason: "no delivery address" });
            continue;
          }
          
          // Get profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name, phone")
            .eq("user_id", subscription.user_id)
            .maybeSingle();
          
          // Get user email from auth
          const { data: userData } = await supabase.auth.admin.getUserById(subscription.user_id);
          const userEmail = userData?.user?.email || null;
          
          // Create synthetic order source data from delivery address and profile
          orderSourceData = {
            customer_name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || null,
            customer_email: userEmail,
            customer_phone: profile?.phone || null,
            shipping_address_street: deliveryAddress.street_address,
            shipping_address_apartment: deliveryAddress.apartment,
            shipping_address_city: deliveryAddress.city,
            shipping_address_state: deliveryAddress.state,
            shipping_address_zip: deliveryAddress.zip_code,
            delivery_instructions: deliveryAddress.delivery_instructions,
            delivery_day_preference: "Saturday", // Default to Saturday
            delivery_time_preference: null,
            delivery_fee: 9, // Default delivery fee
            box_size: subscription.subscription_type,
            box_price: null, // Will be calculated below
          };
          
          logStep("Using fallback data from delivery_addresses and profiles", { 
            userId: subscription.user_id,
            address: deliveryAddress.city
          });
        }

        // Process each week
        for (const { weekStart, weekEnd } of weeksToProcess) {
          const weekStartStr = weekStart.toISOString().split('T')[0];
          const weekEndStr = weekEnd.toISOString().split('T')[0];

          // Skip weeks before this subscription was created
          const subscriptionCreatedAt = new Date(subscription.created_at);
          const subscriptionStartWeekMonday = getUpcomingWeekMonday(subscriptionCreatedAt);
          
          if (weekStart < subscriptionStartWeekMonday) {
            logStep("Skipping week before subscription start", { 
              userId: subscription.user_id, 
              week: weekStartStr, 
              subscriptionCreated: subscription.created_at 
            });
            results.skipped++;
            results.details.push({ 
              userId: subscription.user_id, 
              status: "skipped", 
              reason: "before subscription start", 
              week: weekStartStr 
            });
            continue;
          }

          // Check if order already exists for this user and week
          const { data: existingOrder } = await supabase
            .from("orders")
            .select("id")
            .eq("user_id", subscription.user_id)
            .eq("week_start_date", weekStartStr)
            .maybeSingle();

          if (existingOrder) {
            logStep("Order already exists, skipping", { userId: subscription.user_id, week: weekStartStr });
            results.skipped++;
            results.details.push({ userId: subscription.user_id, status: "skipped", reason: "order exists", week: weekStartStr });
            continue;
          }

          // Calculate the new delivery date based on the day preference
          let deliveryDayPreference = orderSourceData.delivery_day_preference || "Saturday";
          const dayName = deliveryDayPreference.split(",")[0].trim();
          
          const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const targetDayIndex = dayNames.indexOf(dayName);
          
          if (targetDayIndex !== -1) {
            const deliveryDate = new Date(weekStart);
            const currentDayIndex = deliveryDate.getUTCDay();
            const daysToAdd = (targetDayIndex - currentDayIndex + 7) % 7;
            deliveryDate.setUTCDate(deliveryDate.getUTCDate() + daysToAdd);
            
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            deliveryDayPreference = `${dayName}, ${monthNames[deliveryDate.getUTCMonth()]} ${deliveryDate.getUTCDate()}`;
          }

          logStep("Calculated delivery date", { original: orderSourceData.delivery_day_preference, new: deliveryDayPreference, week: weekStartStr });

          // Get weekly bag with selections for this week
          const { data: weeklyBag } = await supabase
            .from("weekly_bags")
            .select("id, box_size, box_price, total_amount, user_full_farm_bag_protein, user_full_farm_bag_carb, user_protein_selections, user_carb_selections")
            .eq("user_id", subscription.user_id)
            .eq("week_start_date", weekStartStr)
            .maybeSingle();

          // Determine selections - use current week's bag, or fallback to last week's bag
          let proteinSelection = weeklyBag?.user_full_farm_bag_protein;
          let carbSelection = weeklyBag?.user_full_farm_bag_carb;
          let proteinSelections = weeklyBag?.user_protein_selections;
          let carbSelections = weeklyBag?.user_carb_selections;

          // If no selections in this week's bag, get from last week's bag
          if (!proteinSelection && !proteinSelections) {
            const { data: lastWeekBag } = await supabase
              .from("weekly_bags")
              .select("user_full_farm_bag_protein, user_full_farm_bag_carb, user_protein_selections, user_carb_selections")
              .eq("user_id", subscription.user_id)
              .lt("week_start_date", weekStartStr)
              .order("week_start_date", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (lastWeekBag) {
              logStep("Using last week's selections as fallback", { userId: subscription.user_id });
              proteinSelection = lastWeekBag.user_full_farm_bag_protein;
              carbSelection = lastWeekBag.user_full_farm_bag_carb;
              proteinSelections = lastWeekBag.user_protein_selections;
              carbSelections = lastWeekBag.user_carb_selections;
            }
          }

          // Use weekly bag data if available, otherwise use orderSourceData
          const boxSize = weeklyBag?.box_size || orderSourceData.box_size || subscription.subscription_type;
          
          // Get box price - use weekly bag's price, or orderSourceData's box_price, or default based on box size
          const getDefaultBoxPrice = (size: string): number => {
            const prices: Record<string, number> = {
              'veggie-bag': 25,
              'full_farm_bag': 50,
              'protein-pack': 40,
              'small': 25,
              'medium': 35,
              'large': 45
            };
            return prices[size] || 50;
          };
          
          const boxPrice = weeklyBag?.box_price || orderSourceData.box_price || getDefaultBoxPrice(boxSize);
          const deliveryFee = orderSourceData.delivery_fee || 9;
          
          // Calculate total as ONLY box_price + delivery_fee (no add-ons for subscription orders)
          const totalAmount = boxPrice + deliveryFee;

          logStep("Calculated pricing", { boxPrice, deliveryFee, totalAmount, week: weekStartStr });

          // Create the new order with CORRECT column names matching the orders table
          const newOrderData = {
            user_id: subscription.user_id,
            order_type: "subscription",
            box_size: boxSize,
            total_amount: totalAmount,
            box_price: boxPrice,
            status: "pending",
            payment_status: "pending",
            week_start_date: weekStartStr,
            week_end_date: weekEndStr,
            weekly_bag_id: weeklyBag?.id || null,
            has_active_subscription: true,
            // Copy delivery info using correct column names
            customer_name: orderSourceData.customer_name,
            customer_email: orderSourceData.customer_email,
            customer_phone: orderSourceData.customer_phone,
            shipping_address_street: orderSourceData.shipping_address_street,
            shipping_address_apartment: orderSourceData.shipping_address_apartment,
            shipping_address_city: orderSourceData.shipping_address_city,
            shipping_address_state: orderSourceData.shipping_address_state,
            shipping_address_zip: orderSourceData.shipping_address_zip,
            delivery_instructions: orderSourceData.delivery_instructions,
            delivery_day_preference: deliveryDayPreference,
            delivery_time_preference: orderSourceData.delivery_time_preference,
            delivery_fee: deliveryFee,
            addons_total: 0, // Reset addons for new week - subscriptions don't include add-ons
            // Customer selections (from current week bag, or fallback to last week)
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
            logStep("Error creating order", { userId: subscription.user_id, week: weekStartStr, error: insertError });
            results.errors++;
            results.details.push({ userId: subscription.user_id, status: "error", error: insertError.message, week: weekStartStr });
            continue;
          }

          logStep("Created new order", { orderId: newOrder.id, userId: subscription.user_id, week: weekStartStr });
          results.created++;
          results.details.push({ 
            userId: subscription.user_id, 
            status: "created", 
            orderId: newOrder.id,
            deliveryDay: deliveryDayPreference,
            week: weekStartStr
          });
        }

      } catch (err) {
        logStep("Error processing subscriber", { userId: subscription.user_id, error: err });
        results.errors++;
        results.details.push({ userId: subscription.user_id, status: "error", error: String(err) });
      }
    }

    logStep("Completed weekly order generation", results);

    return new Response(JSON.stringify({
      success: true,
      weeksProcessed: weeksToProcess.map(w => w.weekStart.toISOString().split('T')[0]),
      results,
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
