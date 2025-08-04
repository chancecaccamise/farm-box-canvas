import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    console.log(`Cleaning test data for user: ${user.email}`);

    // Delete pending orders for this user
    const { error: ordersError } = await supabase
      .from("orders")
      .delete()
      .eq("user_id", user.id)
      .eq("payment_status", "pending");

    if (ordersError) {
      console.error("Error deleting orders:", ordersError);
      throw ordersError;
    }

    // Delete order items for orders that no longer exist
    const { error: itemsError } = await supabase
      .from("order_items")
      .delete()
      .not("order_id", "in", 
        `(SELECT id FROM orders WHERE user_id = '${user.id}')`
      );

    if (itemsError) {
      console.error("Error deleting order items:", itemsError);
    }

    console.log("Test data cleaned successfully");

    return new Response(JSON.stringify({ 
      success: true,
      message: "Test data cleaned successfully" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error cleaning test data:", error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});