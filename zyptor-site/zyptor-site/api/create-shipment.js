module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      orderId,
      name,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      size,
      amount = 899
    } = req.body;

    // Check required customer details
    if (!orderId || !name || !phone || !address || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        error: "Missing required customer details"
      });
    }

    // 1. Login to Shiprocket
    const loginResponse = await fetch(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: process.env.SHIPROCKET_EMAIL,
          password: process.env.SHIPROCKET_PASSWORD
        })
      }
    );

    const loginData = await loginResponse.json();

    if (!loginResponse.ok || !loginData.token) {
      console.error("Shiprocket login failed:", loginData);

      return res.status(500).json({
        success: false,
        error: "Shiprocket authentication failed"
      });
    }

    const token = loginData.token;

    // 2. Create Shiprocket order
    const shipmentResponse = await fetch(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
          order_id: orderId,
          order_date: new Date()
            .toISOString()
            .slice(0, 19)
            .replace("T", " "),

          pickup_location: "Primary",

          billing_customer_name: name,
          billing_last_name: "",
          billing_address: address,
          billing_address_2: "",
          billing_city: city,
          billing_pincode: String(pincode),
          billing_state: state,
          billing_country: "India",
          billing_email: email || "",
          billing_phone: String(phone),

          shipping_is_billing: true,

          order_items: [
            {
              name: "Zyptor Lumbo Sacral Support Belt",
              sku: `ZYPTOR-LSSB-${size || "STD"}`,
              units: 1,
              selling_price: Number(amount),
              discount: 0,
              tax: 0,
              hsn: ""
            }
          ],

          payment_method: "Prepaid",
          sub_total: Number(amount),

          // TEMPORARY package values.
          // We'll replace these with your actual packed belt dimensions.
          length: 30,
          breadth: 20,
          height: 8,
          weight: 0.5
        })
      }
    );

    const shipmentData = await shipmentResponse.json();

    if (!shipmentResponse.ok) {
      console.error("Shiprocket order failed:", shipmentData);

      return res.status(500).json({
        success: false,
        error: "Unable to create Shiprocket order",
        details: shipmentData
      });
    }

    return res.status(200).json({
      success: true,
      shipment: shipmentData
    });

  } catch (error) {
    console.error("Shiprocket integration error:", error);

    return res.status(500).json({
      success: false,
      error: "Shiprocket integration failed"
    });
  }
};
