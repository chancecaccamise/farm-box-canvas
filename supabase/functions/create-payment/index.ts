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
    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Use anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
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
      checkoutState, // New checkout state with add-ons
      isSubscription = false // New flag for subscription vs one-time payment
    } = requestData;

    if (!weeklyBag && !checkoutState) {
      throw new Error("Missing order data");
    }

    // For subscribers, ensure we have a weekly bag if we don't have one
    let actualWeeklyBag = weeklyBag;
    if (hasActiveSubscription && !weeklyBag) {
      logStep("Fetching current week bag for subscriber");
      const { data: currentBag, error: bagError } = await supabaseClient
        .rpc('get_or_create_current_week_bag_with_size', {
          user_uuid: user.id,
          box_size_name: checkoutState?.boxSize || 'medium'
        });
      
      if (bagError) {
        logStep("Error getting current week bag", { error: bagError });
        throw new Error(`Failed to get weekly bag: ${bagError.message}`);
      }

      if (currentBag) {
        // Fetch the full bag details
        const { data: bagDetails } = await supabaseClient
          .from('weekly_bags')
          .select('*')
          .eq('id', currentBag)
          .single();
        
        actualWeeklyBag = bagDetails;
        logStep("Retrieved current week bag for subscriber", { bagId: currentBag });
      }
    }

    logStep("Request data received", { 
      weeklyBagId: actualWeeklyBag?.id || 'checkout-only', 
      itemsCount: bagItems?.length || 0,
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

    // Calculate totals - support both bag and checkout flows
    let boxPrice = 0;
    let addonsTotal = 0;
    let addOnProducts = [];

    if (actualWeeklyBag && bagItems) {
      // Existing bag-based flow
      boxPrice = hasActiveSubscription ? 0 : (actualWeeklyBag.box_price || 0);
      // For subscribers, we only process add-on items for payment
      addonsTotal = bagItems.reduce((total: number, item: any) => 
        total + (item.quantity * item.price_at_time), 0
      );
    } else if (checkoutState) {
      // New checkout flow with add-ons
      // Fetch box price from database
      if (checkoutState.boxSize && !hasActiveSubscription) {
        const { data: boxSizeData } = await supabaseClient
          .from('box_sizes')
          .select('base_price')
          .eq('name', checkoutState.boxSize)
          .single();
        boxPrice = boxSizeData?.base_price || 0;
      }

      // Fetch add-on product details and calculate total
      if (checkoutState.addOns && Object.keys(checkoutState.addOns).length > 0) {
        const addOnIds = Object.keys(checkoutState.addOns);
        const { data: products } = await supabaseClient
          .from('products')
          .select('*')
          .in('id', addOnIds);

        addOnProducts = products || [];
        addonsTotal = addOnProducts.reduce((total, product) => {
          const quantity = checkoutState.addOns[product.id] || 0;
          return total + (product.price * quantity);
        }, 0);
      }
    }

    const deliveryFee = 0; // No delivery fee for any orders
    const totalAmount = boxPrice + addonsTotal + deliveryFee;

    logStep("Calculated totals", { boxPrice, addonsTotal, deliveryFee, totalAmount });

    if (totalAmount <= 0) {
      throw new Error("Order total must be greater than $0");
    }

    // Create line items for Stripe
    const lineItems = [];

    // Add box if not subscription
    if (!hasActiveSubscription && boxPrice > 0) {
      const boxName = actualWeeklyBag ? 
        `${actualWeeklyBag.box_size || 'Medium'} Farm Box - Week of ${new Date(actualWeeklyBag.week_start_date).toLocaleDateString()}` :
        `${checkoutState.boxSize?.charAt(0).toUpperCase() + checkoutState.boxSize?.slice(1) || 'Medium'} Farm Box`;
      
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: boxName },
          unit_amount: Math.round(boxPrice * 100),
        },
        quantity: 1,
      });
    }

    // Add add-ons (support both flows)
    if (bagItems && bagItems.length > 0) {
      // Existing bag flow
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
    } else if (addOnProducts.length > 0) {
      // New checkout flow
      for (const product of addOnProducts) {
        const quantity = checkoutState.addOns[product.id];
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: { name: product.name },
            unit_amount: Math.round(product.price * 100),
          },
          quantity: quantity,
        });
      }
    }

    // No delivery fee for any orders
    // Removed delivery fee line item

    logStep("Created line items", { itemCount: lineItems.length });

    // Get the correct origin URL for redirects
    const origin = req.headers.get("origin") || req.headers.get("referer")?.split('/').slice(0, 3).join('/') || "https://f78f5142-250a-4339-adfa-6897bce152ea.lovableproject.com";
    logStep("Using origin for redirects", { origin });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: isSubscription ? "subscription" : "payment",
      success_url: `${origin}/?stripe_redirect=thank-you&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?stripe_redirect=my-bag&cancelled=true`,
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      phone_number_collection: {
        enabled: true,
      },
      metadata: {
        user_id: user.id,
        weekly_bag_id: actualWeeklyBag?.id || 'checkout-only',
        has_active_subscription: hasActiveSubscription.toString(),
        box_size: checkoutState?.boxSize || actualWeeklyBag?.box_size || 'medium',
        is_subscription: isSubscription.toString(),
      },
    });

    logStep("Stripe session created", { sessionId: session.id, url: session.url });

    // Create order record in database
    const orderData = {
      user_id: user.id,
      stripe_session_id: session.id,
      weekly_bag_id: actualWeeklyBag?.id || null, // Include weekly_bag_id for webhook processing
      total_amount: totalAmount,
      payment_status: 'pending',
      customer_email: user.email,
      customer_name: null, // Will be filled from Stripe checkout
      customer_phone: null, // Will be filled from Stripe checkout
      shipping_address_street: null, // Will be filled from Stripe checkout
      shipping_address_apartment: null, // Will be filled from Stripe checkout
      shipping_address_city: null, // Will be filled from Stripe checkout
      shipping_address_state: null, // Will be filled from Stripe checkout
      shipping_address_zip: null, // Will be filled from Stripe checkout
      delivery_instructions: null, // Will be filled from Stripe checkout
      box_size: checkoutState?.boxSize || actualWeeklyBag?.box_size || 'medium',
      box_price: boxPrice,
      addons_total: addonsTotal,
      delivery_fee: deliveryFee,
      has_active_subscription: hasActiveSubscription,
      week_start_date: actualWeeklyBag?.week_start_date || null,
      week_end_date: actualWeeklyBag?.week_end_date || null,
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
      const boxName = actualWeeklyBag ? 
        `${actualWeeklyBag.box_size || 'Medium'} Farm Box` :
        `${checkoutState.boxSize?.charAt(0).toUpperCase() + checkoutState.boxSize?.slice(1) || 'Medium'} Farm Box`;
      
      orderItems.push({
        order_id: order.id,
        product_id: null, // Box doesn't have a product ID
        product_name: boxName,
        quantity: 1,
        price: boxPrice,
        item_type: 'box'
      });
    }

    // Add addon items (support both flows)
    if (bagItems && bagItems.length > 0) {
      // Existing bag flow
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
    } else if (addOnProducts.length > 0) {
      // New checkout flow
      for (const product of addOnProducts) {
        const quantity = checkoutState.addOns[product.id];
        orderItems.push({
          order_id: order.id,
          product_id: product.id,
          product_name: product.name,
          quantity: quantity,
          price: product.price,
          item_type: 'addon'
        });
      }
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