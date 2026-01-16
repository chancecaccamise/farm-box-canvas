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

    logStep("Starting weekly order generation");

    // Calculate current week dates (Monday to Sunday)
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7;
    
    // Get upcoming week's Monday
    const weekStart = new Date(now);
    weekStart.setUTCDate(now.getUTCDate() + daysUntilMonday);
    weekStart.setUTCHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
    
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    logStep("Calculated week dates", { weekStart: weekStartStr, weekEnd: weekEndStr });

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

        // Check if order already exists for this user and week
        const { data: existingOrder } = await supabase
          .from("orders")
          .select("id")
          .eq("user_id", subscription.user_id)
          .eq("week_start_date", weekStartStr)
          .maybeSingle();

        if (existingOrder) {
          logStep("Order already exists, skipping", { userId: subscription.user_id });
          results.skipped++;
          results.details.push({ userId: subscription.user_id, status: "skipped", reason: "order exists" });
          continue;
        }

        // Get most recent order for delivery preferences
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

        logStep("Calculated delivery date", { original: lastOrder.delivery_day_preference, new: deliveryDayPreference });

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

        // Create the new order
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
          // Copy delivery info from last order
          first_name: lastOrder.first_name,
          last_name: lastOrder.last_name,
          email: lastOrder.email,
          phone: lastOrder.phone,
          shipping_address: lastOrder.shipping_address,
          shipping_city: lastOrder.shipping_city,
          shipping_state: lastOrder.shipping_state,
          shipping_zip: lastOrder.shipping_zip,
          delivery_instructions: lastOrder.delivery_instructions,
          delivery_day_preference: deliveryDayPreference,
          delivery_time_preference: lastOrder.delivery_time_preference,
          delivery_fee: lastOrder.delivery_fee,
          // Link to Stripe
          stripe_subscription_id: subscription.stripe_subscription_id,
          stripe_customer_id: subscription.stripe_customer_id,
        };

        const { data: newOrder, error: insertError } = await supabase
          .from("orders")
          .insert(newOrderData)
          .select()
          .single();

        if (insertError) {
          logStep("Error creating order", { userId: subscription.user_id, error: insertError });
          results.errors++;
          results.details.push({ userId: subscription.user_id, status: "error", error: insertError.message });
          continue;
        }

        logStep("Created new order", { orderId: newOrder.id, userId: subscription.user_id });
        results.created++;
        results.details.push({ 
          userId: subscription.user_id, 
          status: "created", 
          orderId: newOrder.id,
          deliveryDay: deliveryDayPreference 
        });

      } catch (err) {
        logStep("Error processing subscriber", { userId: subscription.user_id, error: err });
        results.errors++;
        results.details.push({ userId: subscription.user_id, status: "error", error: String(err) });
      }
    }

    logStep("Completed weekly order generation", results);

    return new Response(JSON.stringify({
      success: true,
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
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
