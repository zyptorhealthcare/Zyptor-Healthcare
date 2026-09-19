const Razorpay = require("razorpay");

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { amount, receipt, notes } = req.body || {};

    // Validate amount
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        error: "Valid amount is required"
      });
    }

    // Razorpay instance
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount)), // amount must be in paise
      currency: "INR",
      receipt: receipt || `zyptor_${Date.now()}`,
      notes: notes || {
        brand: "Zyptor Healthcare"
      }
    });

    return res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error("Razorpay order creation failed:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to create Razorpay order"
    });
  }
};
