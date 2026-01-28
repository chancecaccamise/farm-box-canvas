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

// Helper function to calculate Friday noon EST cutoff
const getFridayNoonCutoff = (): Date => {
  const now = new Date();
  const currentDay = now.getUTCDay(); // 0 = Sunday, 5 = Friday
  
  // Get current week's Friday
  const daysUntilFriday = (5 - currentDay + 7) % 7;
  const friday = new Date(now);
  friday.setUTCDate(now.getUTCDate() + daysUntilFriday);
  
  // Set to noon EST (17:00 UTC during EST, 16:00 UTC during EDT)
  // Using 17:00 UTC as a conservative estimate (noon EST)
  friday.setUTCHours(17, 0, 0, 0);
  
  return friday;
};

// Helper function to get next week's Monday
const getNextWeekMonday = (): string => {
  const now = new Date();
  const currentDay = now.getUTCDay();
  const daysUntilMonday = (8 - currentDay) % 7 || 7;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + daysUntilMonday);
  monday.setUTCHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
};

// Helper function to check if past Friday noon cutoff
const isPastFridayCutoff = (): boolean => {
  const now = new Date();
  const cutoff = getFridayNoonCutoff();
  return now > cutoff;
};

// Helper function to expand quantity map to array of IDs
const expandQuantitiesToArray = (quantities: Record<string, number> | string[]): string[] => {
  // Handle legacy array format
  if (Array.isArray(quantities)) {
    return quantities;
  }
  
  // Handle new Record format
  const result: string[] = [];
  for (const [id, qty] of Object.entries(quantities)) {
    for (let i = 0; i < qty; i++) {
      result.push(id);
    }
  }
  return result;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Use service role key for database operations (needed early for checkout pause check)
    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check if checkout is paused
    const { data: siteSettings, error: settingsError } = await supabaseServiceClient
      .from('site_settings')
      .select('checkout_paused, checkout_paused_message')
      .limit(1)
      .maybeSingle();

    if (settingsError) {
      logStep("Warning: Could not fetch site settings", { error: settingsError.message });
    }

    if (siteSettings?.checkout_paused) {
      logStep("Checkout is paused - rejecting request");
      return new Response(
        JSON.stringify({ 
          error: "Checkout is currently paused",
          message: siteSettings.checkout_paused_message || "We're taking a short break! Check back soon."
        }),
        { 
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get all Stripe Price IDs for the new box types
    const priceVeggieBagWeekly = Deno.env.get("STRIPE_PRICE_ID_VEGGIE_BAG_WEEKLY");
    const priceFullFarmBagWeekly = Deno.env.get("STRIPE_PRICE_ID_FULL_FARM_BAG_WEEKLY");
    const priceProteinPackWeekly = Deno.env.get("STRIPE_PRICE_ID_PROTEIN_PACK_WEEKLY");
    const priceVeggieBagOneTime = Deno.env.get("STRIPE_PRICE_ID_VEGGIE_BAG_ONETIME");
    const priceFullFarmBagOneTime = Deno.env.get("STRIPE_PRICE_ID_FULL_FARM_BAG_ONETIME");
    const priceProteinPackOneTime = Deno.env.get("STRIPE_PRICE_ID_PROTEIN_PACK_ONETIME");
    const priceDeliveryFeeWeekly = Deno.env.get("STRIPE_PRICE_ID_DELIVERY_FEE_WEEKLY");

    // Keep legacy support for old naming
    const priceSmall = Deno.env.get("STRIPE_PRICE_ID_SMALL_WEEKLY");
    const priceMedium = Deno.env.get("STRIPE_PRICE_ID_MEDIUM_WEEKLY");
    const priceLarge = Deno.env.get("STRIPE_PRICE_ID_LARGE_WEEKLY");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    logStep("Stripe key loaded");

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

    logStep("Request data parsed", { 
      hasWeeklyBag: !!weeklyBag,
      hasBagItems: !!bagItems,
      hasActiveSubscription,
      hasCheckoutState: !!checkoutState,
      isSubscription,
      requestedMode: isSubscription ? "subscription" : "payment"
    });

    // Validate required Price IDs for subscription mode
    if (isSubscription && (!priceVeggieBagWeekly || !priceFullFarmBagWeekly || !priceProteinPackWeekly)) {
      throw new Error("Missing Stripe price ID secrets for subscription mode");
    }

    if (!weeklyBag && !checkoutState) {
      throw new Error("Missing order data");
    }

    // Ensure we have a weekly bag for all purchases with checkout state
    let actualWeeklyBag = weeklyBag;
    if (!weeklyBag && checkoutState) {
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

    // Store user selections in the weekly bag if we have checkoutState
    if (actualWeeklyBag && checkoutState) {
      const updateData: any = {};
      
      // Store protein selections for protein pack (expand quantities to array)
      if (checkoutState.boxSize === 'protein-pack' && checkoutState.proteinSelections) {
        updateData.user_protein_selections = expandQuantitiesToArray(checkoutState.proteinSelections);
      }
      
      // Store full farm bag selections
      if (checkoutState.boxSize === 'full_farm_bag') {
        if (checkoutState.fullFarmBagSelections?.protein) {
          updateData.user_full_farm_bag_protein = checkoutState.fullFarmBagSelections.protein;
        }
        if (checkoutState.fullFarmBagSelections?.carb) {
          updateData.user_full_farm_bag_carb = checkoutState.fullFarmBagSelections.carb;
        }
      }

      // Update the weekly bag with user selections if we have any
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabaseServiceClient
          .from('weekly_bags')
          .update(updateData)
          .eq('id', actualWeeklyBag.id);
        
        if (updateError) {
          logStep("Error storing user selections", { error: updateError });
        } else {
          logStep("Stored user selections", updateData);
          
          // Repopulate the bag with user selections
          const { error: populateError } = await supabaseServiceClient
            .rpc('populate_weekly_bag_from_template', {
              bag_id: actualWeeklyBag.id,
              box_size_name: checkoutState.boxSize,
              week_start: actualWeeklyBag.week_start_date
            });
          
          if (populateError) {
            logStep("Error repopulating bag with user selections", { error: populateError });
          } else {
            logStep("Repopulated bag with user selections");
          }
        }
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
        // Get box pricing - fetch both base and subscriber prices
        const { data: boxSizeData } = await supabaseClient
          .from('box_sizes')
          .select('base_price, subscriber_price')
          .eq('name', checkoutState.boxSize)
          .single();
        
        // Use subscriber price for subscriptions, base price for one-time purchases
        boxPrice = isSubscription 
          ? (boxSizeData?.subscriber_price || boxSizeData?.base_price || 0)
          : (boxSizeData?.base_price || 0);
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

    // Apply delivery fee only for home delivery, not for pickups
    const deliveryFee = checkoutState?.deliveryMethod === 'delivery' ? 9.00 : 0.00;
    const totalAmount = boxPrice + addonsTotal + deliveryFee;

    logStep("Calculated totals", { boxPrice, addonsTotal, deliveryFee, totalAmount });

    if (totalAmount <= 0) {
      throw new Error("Order total must be greater than $0");
    }

    // Create line items for Stripe
    const lineItems = [];

    // For subscription mode, use Stripe Price IDs for the box
    if (isSubscription && boxPrice > 0) {
      // Map box types to subscription Price IDs
      const subscriptionPriceMap: Record<string, string | undefined> = {
        veggie_bag: priceVeggieBagWeekly,
        full_farm_bag: priceFullFarmBagWeekly,
        'protein-pack': priceProteinPackWeekly,
        'protein_pack': priceProteinPackWeekly, // Handle both naming conventions
        // Legacy support
        small: priceSmall || priceVeggieBagWeekly,
        medium: priceMedium || priceFullFarmBagWeekly,
        large: priceLarge || priceProteinPackWeekly,
      };

      const boxType = checkoutState?.boxSize || actualWeeklyBag?.box_size || 'full_farm_bag';
      const stripePriceId = subscriptionPriceMap[boxType];
      
      if (!stripePriceId) {
        throw new Error(`No subscription Price ID found for box type: ${boxType}`);
      }

      lineItems.push({
        price: stripePriceId,
        quantity: 1,
      });
      
      logStep("Added subscription box item", { boxType, stripePriceId });
    }
    // For one-time payments or non-subscribers, use price_data
    else if (!hasActiveSubscription && boxPrice > 0) {
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
      
      logStep("Added one-time box item", { boxName, boxPrice });
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

    // Add delivery fee
    if (deliveryFee > 0) {
      if (isSubscription && priceDeliveryFeeWeekly) {
        // For subscriptions, use recurring Price ID
        lineItems.push({
          price: priceDeliveryFeeWeekly,
          quantity: 1,
        });
        logStep("Added recurring delivery fee", { priceId: priceDeliveryFeeWeekly });
      } else {
        // For one-time payments, use price_data
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: { name: "Delivery Fee" },
            unit_amount: Math.round(deliveryFee * 100),
          },
          quantity: 1,
        });
        logStep("Added one-time delivery fee", { amount: deliveryFee });
      }
    }

    logStep("Created line items", { itemCount: lineItems.length });

    // Updated validation - subscription mode can have price_data for add-ons and delivery
    const hasOnlyPriceData = lineItems.every(item => item.price_data && !item.price);
    const hasOnlyPriceIds = lineItems.every(item => item.price && !item.price_data);
    const hasMixedItems = lineItems.some(item => item.price) && lineItems.some(item => item.price_data);
    
    if (isSubscription && hasOnlyPriceData) {
      logStep("ERROR: Subscription mode requires at least one recurring price");
      throw new Error("Subscription mode requires at least one recurring Stripe Price ID");
    }
    
    logStep("Validation passed", { 
      isSubscription, 
      hasOnlyPriceData, 
      hasOnlyPriceIds, 
      hasMixedItems 
    });

    // Get the correct origin URL for redirects
    const origin = req.headers.get("origin") || req.headers.get("referer")?.split('/').slice(0, 3).join('/') || "https://billysbotanicals.com";
    logStep("Using origin for redirects", { origin });

    const sessionMode = isSubscription ? "subscription" : "payment";
    logStep("Creating Stripe session", { 
      mode: sessionMode,
      lineItemsCount: lineItems.length,
      customerId: customerId || "new_customer"
    });

    // Create Stripe checkout session config
    const sessionConfig: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: sessionMode,
      success_url: `${origin}/?stripe_redirect=thank-you&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?stripe_redirect=my-bag&cancelled=true`,
      phone_number_collection: {
        enabled: true,
      },
      metadata: {
        user_id: user.id,
        weekly_bag_id: actualWeeklyBag?.id || 'checkout-only',
        has_active_subscription: hasActiveSubscription.toString(),
        box_size: checkoutState?.boxSize || actualWeeklyBag?.box_size || 'medium',
        is_subscription: isSubscription.toString(),
        delivery_method: checkoutState?.deliveryMethod || 'delivery',
      },
    };

    // Only collect shipping address for home delivery orders
    if (checkoutState?.deliveryMethod === 'delivery') {
      sessionConfig.shipping_address_collection = {
        allowed_countries: ['US'],
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    logStep("Stripe session created", { sessionId: session.id, url: session.url });

    // Create order record in database with enhanced data capture
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
      delivery_instructions: checkoutState?.deliveryInstructions || null,
      box_size: checkoutState?.boxSize || actualWeeklyBag?.box_size || 'medium',
      box_price: boxPrice,
      addons_total: addonsTotal,
      delivery_fee: deliveryFee,
      has_active_subscription: hasActiveSubscription,
      week_start_date: actualWeeklyBag?.week_start_date || (() => {
        // If past Friday noon cutoff, schedule for next week
        if (isPastFridayCutoff()) {
          return getNextWeekMonday();
        }
        const now = new Date();
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
        return monday.toISOString().split('T')[0];
      })(),
      week_end_date: actualWeeklyBag?.week_end_date || (() => {
        // If past Friday noon cutoff, schedule for next week
        if (isPastFridayCutoff()) {
          const nextMonday = new Date(getNextWeekMonday());
          const sunday = new Date(nextMonday);
          sunday.setDate(nextMonday.getDate() + 6);
          return sunday.toISOString().split('T')[0];
        }
        const now = new Date();
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        return sunday.toISOString().split('T')[0];
      })(),
      order_type: isSubscription ? 'subscription' : 'one_time',
      status: 'pending',
      // New enhanced fields
      delivery_day_preference: checkoutState?.deliveryDay || null,
      delivery_time_preference: checkoutState?.deliveryMethod || null,
      customer_notes: checkoutState?.comments || null,
      user_protein_selections: checkoutState?.proteinSelections ? expandQuantitiesToArray(checkoutState?.proteinSelections) : actualWeeklyBag?.user_protein_selections || null,
      user_carb_selections: checkoutState?.carbSelections || actualWeeklyBag?.user_carb_selections || null,
      user_full_farm_bag_protein: checkoutState?.fullFarmBagSelections?.protein || actualWeeklyBag?.user_full_farm_bag_protein || null,
      user_full_farm_bag_carb: checkoutState?.fullFarmBagSelections?.carb || actualWeeklyBag?.user_full_farm_bag_carb || null
    };

    const { data: order, error: orderError } = await supabaseServiceClient
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
      // Fetch the proper display name from box_sizes table
      const boxSizeName = actualWeeklyBag?.box_size || checkoutState.boxSize || 'medium';
      const { data: boxSizeData } = await supabaseServiceClient
        .from('box_sizes')
        .select('display_name')
        .eq('name', boxSizeName)
        .single();
      
      const boxName = boxSizeData?.display_name || 
        `${boxSizeName.charAt(0).toUpperCase() + boxSizeName.slice(1)} Farm Box`;
      
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
      const { error: itemsError } = await supabaseServiceClient
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