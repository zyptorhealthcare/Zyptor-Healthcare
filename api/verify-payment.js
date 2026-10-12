
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { createClient } = require("@supabase/supabase-js");

const PRICE_PAISE = 89900;

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body || {};

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing payment details"
      });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    if (!keyId || !keySecret || !supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: "Server configuration missing"
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const actual = Buffer.from(razorpay_signature, "utf8");
    const expected = Buffer.from(expectedSignature, "utf8");

    if (
      actual.length !== expected.length ||
      !crypto.timingSafeEqual(actual, expected)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid payment signature"
      });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    const order = await razorpay.orders.fetch(
      razorpay_order_id
    );

    if (
      payment.order_id !== razorpay_order_id ||
      payment.status !== "captured" ||
      payment.amount !== PRICE_PAISE ||
      payment.currency !== "INR" ||
      order.id !== razorpay_order_id ||
      order.amount !== PRICE_PAISE ||
      order.currency !== "INR"
    ) {
      return res.status(409).json({
        success: false,
        error: "Payment not confirmed as captured"
      });
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    const { data: savedOrder, error: lookupError } =
      await supabase
        .from("zyptor_orders")
        .select("id, payment_status, razorpay_payment_id")
        .eq("razorpay_order_id", razorpay_order_id)
        .single();

    if (lookupError || !savedOrder) {
      return res.status(404).json({
        success: false,
        error: "Order not found in database"
      });
    }

    if (
      savedOrder.razorpay_payment_id &&
      savedOrder.razorpay_payment_id !== razorpay_payment_id
    ) {
      return res.status(409).json({
        success: false,
        error: "Order already linked to another payment"
      });
    }

    const { error: updateError } = await supabase
      .from("zyptor_orders")
      .update({
        razorpay_payment_id,
        payment_status: "captured",
        updated_at: new Date().toISOString()
      })
      .eq("id", savedOrder.id)
      .or(
        `razorpay_payment_id.is.null,razorpay_payment_id.eq.${razorpay_payment_id}`
      );

    if (updateError) {
      console.error("Order update failed:", updateError);

      return res.status(500).json({
        success: false,
        error: "Payment verified but order update failed"
      });
    }

    return res.status(200).json({
      success: true,
      verified: true,
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id
    });

  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to verify payment"
    });
  }
};
