
/* ZYPTOR HEALTHCARE - DELIVERY + RAZORPAY TEST CHECKOUT */

const ZYPTOR_TEST_KEY = "rzp_test_TdksKpZAARyXYC";

function getDeliveryDetails() {
  return {
    name: document.getElementById("customer-name").value.trim(),
    phone: document.getElementById("customer-phone").value.trim(),
    email: document.getElementById("customer-email").value.trim(),
    address: document.getElementById("customer-address").value.trim(),
    city: document.getElementById("customer-city").value.trim(),
    state: document.getElementById("customer-state").value.trim(),
    pincode: document.getElementById("customer-pincode").value.trim(),
    size: document.getElementById("customer-size").value
  };
}

document.getElementById("delivery-form")?.addEventListener(
  "submit",
  async function (event) {
    event.preventDefault();

    const customer = getDeliveryDetails();

    if (!/^[0-9]{10}$/.test(customer.phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!/^[0-9]{6}$/.test(customer.pincode)) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    if (!selectedCheckoutProduct) {
      alert("Please select a product first.");
      return;
    }

    const payButton = this.querySelector(
      'button[type="submit"]'
    );

    payButton.disabled = true;
    payButton.textContent = "Preparing secure payment...";

    try {
      const orderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
    
body: JSON.stringify({
  productId: selectedCheckoutProduct.id,
  size: customer.size,
  name: customer.name,
  phone: customer.phone,
  email: customer.email,
  address: customer.address,
  city: customer.city,
  state: customer.state,
  pincode: customer.pincode
})

      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.order) {
        throw new Error("Unable to create payment order");
      }

      if (typeof Razorpay !== "function") {
        throw new Error("Razorpay checkout is unavailable");
      }

      const options = {
        key: ZYPTOR_TEST_KEY,
        amount: orderData.order.amount,
        currency: "INR",
        name: "Zyptor Healthcare",
        description: selectedCheckoutProduct.name,
        order_id: orderData.order.id,

        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone
        },

        theme: {
          color: "#c8102e"
        },

        handler: async function (payment) {
          try {
            const verifyResponse = await fetch(
              "/api/verify-payment",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  razorpay_order_id: payment.razorpay_order_id,
                  razorpay_payment_id: payment.razorpay_payment_id,
                  razorpay_signature: payment.razorpay_signature
                })
              }
            );

            const verification = await verifyResponse.json();

            if (!verifyResponse.ok || !verification.success) {
              throw new Error("Payment verification failed");
            }

            alert(
              "Test payment verified successfully! " +
              "No shipment has been created."
            );

            document.getElementById("delivery-modal")
              ?.classList.remove("is-open");

            document.body.style.overflow = "";

          } catch (error) {
            console.error("Verification error:", error);

            alert(
              "Payment status needs confirmation. " +
              "Please contact support before trying again."
            );
          }
        },

        modal: {
          ondismiss: function () {
            payButton.disabled = false;
            payButton.textContent =
              "Continue to Secure Payment →";
          }
        }
      };

      const razorpay = new Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);

        payButton.disabled = false;
        payButton.textContent =
          "Continue to Secure Payment →";

        alert("Test payment failed. Please try again.");
      });

      razorpay.open();

    } catch (error) {
      console.error("Checkout error:", error);

      alert("Unable to start payment. Please try again.");

    } finally {
      payButton.disabled = false;
      payButton.textContent =
        "Continue to Secure Payment →";
    }
  }
);
