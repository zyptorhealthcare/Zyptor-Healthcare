/**
 * CHECKOUT.JS
 * Opens the checkout form for a product, collects shipping details, asks
 * the backend (zyptor-backend) to create a real Razorpay order, then opens
 * the Razorpay payment popup. After payment, it asks the backend to verify
 * the payment is genuine before showing the success screen.
 *
 * You shouldn't need to edit this file. If checkout isn't working, the
 * usual cause is js/config.js not pointing at your deployed backend yet.
 */

let CHECKOUT_PRODUCT = null;

function money(rupees) {
  return "₹" + Number(rupees).toLocaleString("en-IN");
}

function openCheckout(productId) {
  const products = typeof ZYPTOR_PRODUCTS !== "undefined" ? ZYPTOR_PRODUCTS : [];
  const product = products.find((p) => p.id === productId);
  if (!product) return;
  CHECKOUT_PRODUCT = product;

  const modal = document.getElementById("checkout-modal");
  const title = document.getElementById("checkout-product-name");
  const sizeSelect = document.getElementById("checkout-size");
  const qtyInput = document.getElementById("checkout-qty");
  const totalEl = document.getElementById("checkout-total");
  const form = document.getElementById("checkout-form");
  const errorBox = document.getElementById("checkout-error");
  const successBox = document.getElementById("checkout-success");

  form.hidden = false;
  successBox.hidden = true;
  errorBox.hidden = true;
  errorBox.textContent = "";
  form.reset();

  title.textContent = product.name;

  sizeSelect.innerHTML = (product.sizes || [])
    .map((s) => `<option value="${s.size}">${s.size} — waist ${s.waist}</option>`)
    .join("");

  qtyInput.value = 1;
  updateCheckoutTotal();

  modal.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function closeCheckout() {
  const modal = document.getElementById("checkout-modal");
  modal.classList.remove("is-open");
  document.body.style.overflow = "";
}

function updateCheckoutTotal() {
  if (!CHECKOUT_PRODUCT) return;
  const qty = Math.max(1, parseInt(document.getElementById("checkout-qty").value, 10) || 1);
  document.getElementById("checkout-total").textContent = money(CHECKOUT_PRODUCT.priceINR * qty);
}

function showCheckoutError(message) {
  const errorBox = document.getElementById("checkout-error");
  errorBox.textContent = message;
  errorBox.hidden = false;
}

async function submitCheckout(event) {
  event.preventDefault();
  const errorBox = document.getElementById("checkout-error");
  const form = document.getElementById("checkout-form");
  const submitBtn = document.getElementById("checkout-submit");
  errorBox.hidden = true;

  if (typeof ZYPTOR_CONFIG === "undefined" || !ZYPTOR_CONFIG.API_BASE_URL) {
    showCheckoutError(
      "Checkout isn't connected to a payment backend yet. Deploy zyptor-backend and set API_BASE_URL in js/config.js — see the README."
    );
    return;
  }

  const customer = {
    name: document.getElementById("checkout-name").value.trim(),
    phone: document.getElementById("checkout-phone").value.trim(),
    email: document.getElementById("checkout-email").value.trim(),
    address: document.getElementById("checkout-address").value.trim(),
    city: document.getElementById("checkout-city").value.trim(),
    state: document.getElementById("checkout-state").value.trim(),
    pincode: document.getElementById("checkout-pincode").value.trim(),
  };
  const size = document.getElementById("checkout-size").value;
  const quantity = parseInt(document.getElementById("checkout-qty").value, 10) || 1;

  if (!customer.name || !customer.phone || !customer.address || !customer.pincode) {
    showCheckoutError("Please fill in name, phone, address and pincode.");
    return;
  }
  if (typeof Razorpay === "undefined") {
    showCheckoutError("Payment widget failed to load — check your internet connection and try again.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Preparing payment…";

  try {
    const res = await fetch(`${ZYPTOR_CONFIG.API_BASE_URL}/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: CHECKOUT_PRODUCT.id, size, quantity, customer }),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Could not start checkout.");
    }

    const rzp = new Razorpay({
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      order_id: data.orderId,
      name: "Zyptor Healthcare",
      description: `${CHECKOUT_PRODUCT.name} — Size ${size} × ${quantity}`,
      prefill: { name: customer.name, email: customer.email, contact: customer.phone },
      theme: { color: "#E30310" },
      handler: async function (response) {
        await handlePaymentSuccess(response);
      },
      modal: {
        ondismiss: function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Proceed to Payment";
        },
      },
    });

    rzp.on("payment.failed", function () {
      showCheckoutError("Payment failed or was cancelled. No amount was charged — please try again.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Proceed to Payment";
    });

    rzp.open();
  } catch (err) {
    console.error(err);
    showCheckoutError(err.message || "Something went wrong starting checkout. Please try again.");
    submitBtn.disabled = false;
    submitBtn.textContent = "Proceed to Payment";
  }
}

async function handlePaymentSuccess(response) {
  const form = document.getElementById("checkout-form");
  const successBox = document.getElementById("checkout-success");
  const successOrderId = document.getElementById("checkout-success-order-id");

  try {
    const res = await fetch(`${ZYPTOR_CONFIG.API_BASE_URL}/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      }),
    });
    const data = await res.json();

    if (data.verified) {
      form.hidden = true;
      successBox.hidden = false;
      successOrderId.textContent = response.razorpay_payment_id;
    } else {
      showCheckoutError(
        "Payment could not be verified. If money was deducted, please contact us with your payment ID: " +
          response.razorpay_payment_id
      );
    }
  } catch (err) {
    console.error(err);
    showCheckoutError(
      "Payment went through but we couldn't confirm it automatically. Please contact us with your payment ID: " +
        response.razorpay_payment_id
    );
  }
}

document.addEventListener("click", (e) => {
  if (e.target.matches("[data-buy-now]")) {
    openCheckout(e.target.getAttribute("data-buy-now"));
  }
  if (e.target.matches("[data-checkout-close]") || e.target.id === "checkout-modal") {
    closeCheckout();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCheckout();
});

// Scripts load at the end of <body>, after the DOM has already parsed —
// DOMContentLoaded has already fired by the time this runs, so wire up
// immediately rather than waiting for an event that's already passed
// (see the same fix and explanation in js/script.js).
(function initCheckoutListeners() {
  const form = document.getElementById("checkout-form");
  const qtyInput = document.getElementById("checkout-qty");
  if (form) form.addEventListener("submit", submitCheckout);
  if (qtyInput) qtyInput.addEventListener("input", updateCheckoutTotal);
})();
