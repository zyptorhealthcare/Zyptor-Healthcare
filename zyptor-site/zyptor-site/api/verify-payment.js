
const crypto = require("crypto");
const Razorpay = require("razorpay");

const EXPECTED_AMOUNT = 89900; // ₹899 in paise

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
      .update(
        razorpay_order_id + "|" + razorpay_payment_id
      )
      .digest("hex");

    if (
      !/^[a-f0-9]{64}$/i.test(razorpay_signature)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid payment signature"
      });
    }

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(razorpay_signature, "hex")
    );

    if (!isValid) {
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
      payment.amount !== EXPECTED_AMOUNT ||
      payment.currency !== "INR" ||
      order.amount !== EXPECTED_AMOUNT ||
      order.currency !== "INR" ||
      order.id !== razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        error: "Payment not captured or details mismatch"
      });
    }

    return res.status(200).json({
      success: true,
      verified: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      amount: payment.amount,
      currency: payment.currency
    });

  } catch (error) {
    console.error(
      "Payment verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Unable to verify payment"
    });
  }
};
