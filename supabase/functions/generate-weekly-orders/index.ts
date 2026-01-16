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

    // Helper function to get Monday of a given week
    const getMondayOfWeek = (date: Date): Date => {
      const d = new Date(date);
      const dayOfWeek = d.getUTCDay();
      const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      d.setUTCDate(d.getUTCDate() - daysSinceMonday);
      d.setUTCHours(0, 0, 0, 0);
      return d;
    };

    // Calculate CURRENT week dates (Monday to Sunday)
    const now = new Date();
    const currentWeekStart = getMondayOfWeek(now);
    
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

        if (!lastOrder) {
          logStep("No previous order found, skipping", { userId: subscription.user_id });
          results.skipped++;
          results.details.push({ userId: subscription.user_id, status: "skipped", reason: "no previous order" });
          continue;
        }

        // Process each week
        for (const { weekStart, weekEnd } of weeksToProcess) {
          const weekStartStr = weekStart.toISOString().split('T')[0];
          const weekEndStr = weekEnd.toISOString().split('T')[0];

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
          let deliveryDayPreference = lastOrder.delivery_day_preference || "Saturday";
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

          logStep("Calculated delivery date", { original: lastOrder.delivery_day_preference, new: deliveryDayPreference, week: weekStartStr });

          // Get or create weekly bag for this week
          const { data: weeklyBag } = await supabase
            .from("weekly_bags")
            .select("id, box_size, box_price, total_amount")
            .eq("user_id", subscription.user_id)
            .eq("week_start_date", weekStartStr)
            .maybeSingle();

          // Use weekly bag data if available, otherwise use last order data
          const boxSize = weeklyBag?.box_size || lastOrder.box_size || subscription.subscription_type;
          const totalAmount = weeklyBag?.total_amount || lastOrder.total_amount;

          // Create the new order with CORRECT column names matching the orders table
          const newOrderData = {
            user_id: subscription.user_id,
            order_type: "subscription",
            box_size: boxSize,
            total_amount: totalAmount,
            status: "pending",
            payment_status: "pending",
            week_start_date: weekStartStr,
            week_end_date: weekEndStr,
            weekly_bag_id: weeklyBag?.id || null,
            has_active_subscription: true,
            // Copy delivery info using correct column names
            customer_name: lastOrder.customer_name,
            customer_email: lastOrder.customer_email,
            customer_phone: lastOrder.customer_phone,
            shipping_address_street: lastOrder.shipping_address_street,
            shipping_address_apartment: lastOrder.shipping_address_apartment,
            shipping_address_city: lastOrder.shipping_address_city,
            shipping_address_state: lastOrder.shipping_address_state,
            shipping_address_zip: lastOrder.shipping_address_zip,
            delivery_instructions: lastOrder.delivery_instructions,
            delivery_day_preference: deliveryDayPreference,
            delivery_time_preference: lastOrder.delivery_time_preference,
            delivery_fee: lastOrder.delivery_fee,
            box_price: lastOrder.box_price,
            addons_total: 0, // Reset addons for new week
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
