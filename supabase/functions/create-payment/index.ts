import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
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

    // Use service role key for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const requestData = await req.json();
    const { 
      weeklyBag, 
      bagItems, 
      hasActiveSubscription, 
      deliveryData, 
      paymentData 
    } = requestData;

    if (!weeklyBag || !bagItems) {
      throw new Error("Missing order data");
    }

    logStep("Request data received", { 
      weeklyBagId: weeklyBag.id, 
      itemsCount: bagItems.length,
      hasActiveSubscription 
    });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    } else {
      logStep("No existing customer found");
    }

    // Calculate totals
    const boxPrice = hasActiveSubscription ? 0 : (weeklyBag.box_price || 0);
    const addonsTotal = bagItems.reduce((total: number, item: any) => 
      total + (item.quantity * item.price_at_time), 0
    );
    const deliveryFee = hasActiveSubscription ? 0 : 4.99;
    const totalAmount = boxPrice + addonsTotal + deliveryFee;

    logStep("Calculated totals", { boxPrice, addonsTotal, deliveryFee, totalAmount });

    if (totalAmount <= 0) {
      throw new Error("Order total must be greater than $0");
    }

    // Create line items for Stripe
    const lineItems = [];

    // Add box if not subscription
    if (!hasActiveSubscription && boxPrice > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { 
            name: `${weeklyBag.box_size || 'Medium'} Farm Box - Week of ${new Date(weeklyBag.week_start_date).toLocaleDateString()}` 
          },
          unit_amount: Math.round(boxPrice * 100),
        },
        quantity: 1,
      });
    }

    // Add add-ons
    for (const item of bagItems) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: item.products?.name || `Product ${item.product_id}` },
          unit_amount: Math.round(item.price_at_time * 100),
        },
        quantity: item.quantity,
      });
    }

    // Add delivery fee if not subscription
    if (!hasActiveSubscription && deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Delivery Fee" },
          unit_amount: Math.round(deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    logStep("Created line items", { itemCount: lineItems.length });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/checkout`,
      metadata: {
        user_id: user.id,
        weekly_bag_id: weeklyBag.id,
        has_active_subscription: hasActiveSubscription.toString(),
      },
    });

    logStep("Stripe session created", { sessionId: session.id, url: session.url });

    // Create order record in database
    const orderData = {
      user_id: user.id,
      stripe_session_id: session.id,
      total_amount: totalAmount,
      payment_status: 'pending',
      customer_email: user.email,
      customer_name: deliveryData?.firstName && deliveryData?.lastName 
        ? `${deliveryData.firstName} ${deliveryData.lastName}` 
        : null,
      customer_phone: deliveryData?.phone || null,
      shipping_address_street: deliveryData?.streetAddress || null,
      shipping_address_apartment: deliveryData?.apartment || null,
      shipping_address_city: deliveryData?.city || null,
      shipping_address_state: deliveryData?.state || null,
      shipping_address_zip: deliveryData?.zipCode || null,
      delivery_instructions: deliveryData?.deliveryInstructions || null,
      box_size: weeklyBag.box_size,
      box_price: boxPrice,
      addons_total: addonsTotal,
      delivery_fee: deliveryFee,
      has_active_subscription: hasActiveSubscription,
      week_start_date: weeklyBag.week_start_date,
      week_end_date: weeklyBag.week_end_date,
      order_type: 'subscription',
      status: 'pending'
    };

    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      logStep("Error creating order", { error: orderError });
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    logStep("Order created", { orderId: order.id });

    // Create order items
    const orderItems = [];

    // Add box item if not subscription
    if (!hasActiveSubscription && boxPrice > 0) {
      orderItems.push({
        order_id: order.id,
        product_id: null, // Box doesn't have a product ID
        product_name: `${weeklyBag.box_size || 'Medium'} Farm Box`,
        quantity: 1,
        price: boxPrice,
        item_type: 'box'
      });
    }

    // Add addon items
    for (const item of bagItems) {
      orderItems.push({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.products?.name || `Product ${item.product_id}`,
        quantity: item.quantity,
        price: item.price_at_time,
        item_type: 'addon'
      });
    }

    if (orderItems.length > 0) {
      const { error: itemsError } = await supabaseClient
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        logStep("Error creating order items", { error: itemsError });
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }
    }

    logStep("Order items created", { itemCount: orderItems.length });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});