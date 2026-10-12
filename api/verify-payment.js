
const crypto = require("crypto");
const Razorpay = require("razorpay");

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

    if (!keyId || !keySecret) {
      return res.status(500).json({
        success: false,
        error: "Payment configuration missing"
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const actual = Buffer.from(
      razorpay_signature,
      "utf8"
    );

    const expected = Buffer.from(
      expectedSignature,
      "utf8"
    );

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
      payment.amount !== 89900 ||
      payment.currency !== "INR" ||
      order.amount !== 89900 ||
      order.currency !== "INR"
    ) {
      return res.status(409).json({
        success: false,
        error: "Payment not confirmed as captured"
      });
    }

    return res.status(200).json({
      success: true,
      verified: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id
    });

  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to verify payment"
    });
  }
};
