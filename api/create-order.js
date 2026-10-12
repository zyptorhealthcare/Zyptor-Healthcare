
const Razorpay = require("razorpay");
const { createClient } = require("@supabase/supabase-js");

const PRICE_PAISE = 89900;
const VALID_SIZES = ["S", "M", "L", "XL", "XXL"];

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const {
      productId,
      size,
      name,
      phone,
      email,
      address,
      city,
      state,
      pincode
    } = req.body || {};

    if (
      !name || !address || !city || !state ||
      !/^[0-9]{10}$/.test(String(phone || "")) ||
      !/^[0-9]{6}$/.test(String(pincode || "")) ||
      !VALID_SIZES.includes(size)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid customer or delivery details"
      });
    }

    if (
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET ||
      !process.env.SUPABASE_URL ||
      !process.env.SUPABASE_SECRET_KEY
    ) {
      return res.status(500).json({
        success: false,
        error: "Server configuration missing"
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    const order = await razorpay.orders.create({
      amount: PRICE_PAISE,
      currency: "INR",
      receipt: `zyptor_${Date.now()}`,
      notes: {
        product: "Zyptor Lumbo Sacral Support Belt",
        size
      }
    });

    const { error } = await supabase
      .from("zyptor_orders")
      .insert({
        razorpay_order_id: order.id,
        customer_name: name.trim(),
        customer_phone: String(phone),
        customer_email: email || null,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: String(pincode),
        product_sku: `ZYPTOR-LSSB-${size}`,
        product_size: size,
        amount_paise: PRICE_PAISE,
        currency: "INR",
        payment_status: "pending",
        shipment_status: "pending"
      });

    if (error) {
      console.error("Database order save failed:", error);
      return res.status(500).json({
        success: false,
        error: "Unable to save order"
      });
    }

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
