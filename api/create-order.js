
const Razorpay = require("razorpay");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    if (!process.env.RAZORPAY_KEY_ID ||
        !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        error: "Payment configuration missing"
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    // Fixed server-side price: Rs 899
    const amount = 89900;

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `zyptor_${Date.now()}`,
      notes: {
        product: "Zyptor Lumbo Sacral Support Belt"
      }
    });

    return res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error("Order creation failed:", error);
    return res.status(500).json({
      success: false,
      error: "Unable to create payment order"
    });
  }
};
