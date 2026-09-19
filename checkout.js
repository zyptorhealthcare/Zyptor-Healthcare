// ZYPTOR HEALTHCARE - RAZORPAY CHECKOUT

async function startCheckout(product) {
  try {
    const amountInRupees = Number(product.price || 899);

    // 1. Create secure Razorpay order from our Vercel backend
    const response = await fetch("/api/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: amountInRupees * 100,
        receipt: `zyptor_${Date.now()}`,
        notes: {
          product: product.name || "Zyptor Lumbo Sacral Support Belt"
        }
      })
    });

    const data = await response.json();

    if (!response.ok || !data.order) {
      console.error(data);
      alert("Unable to start payment. Please try again.");
      return;
    }

    // 2. Open Razorpay Checkout
    const options = {
      key: "rzp_test_TdksKpZAARyXYC",
      amount: data.order.amount,
      currency: data.order.currency,
      name: "Zyptor Healthcare",
      description:
        product.name || "Zyptor Lumbo Sacral Support Belt",
      order_id: data.order.id,

      handler: function (response) {
        console.log("Payment successful:", response);

        alert(
          "Payment successful! Thank you for ordering from Zyptor Healthcare."
        );
      },

      theme: {
        color: "#e50914"
      }
    };

    const razorpay = new Razorpay(options);

    razorpay.on("payment.failed", function (response) {
      console.error("Payment failed:", response.error);
      alert(
        "Payment failed. No worries — please try again."
      );
    });

    razorpay.open();

  } catch (error) {
    console.error("Checkout error:", error);
    alert("Something went wrong while starting payment.");
  }
}
