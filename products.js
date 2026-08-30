/**
 * PRODUCTS.JS
 * ------------------------------------------------------------------
 * This is the ONLY file you need to touch to add a new product,
 * change a price, or update sizing later. The homepage reads this
 * array and builds the product cards automatically — you never have
 * to edit index.html or write any HTML.
 *
 * TO ADD A NEW PRODUCT:
 *   1. Copy one of the objects below (from the opening { to closing },)
 *   2. Paste it as a new entry in the ZYPTOR_PRODUCTS array
 *   3. Change the id, name, price, description, image path and sizes
 *   4. Upload your product photo into the /images folder, and point
 *      "image" at it, e.g. "images/knee-cap-front.png"
 *   5. Save the file — that's it, the site updates automatically
 *
 * IMPORTANT — if checkout/payment is set up (see /zyptor-backend):
 *   The "priceINR" field here is for DISPLAY only. The actual amount
 *   charged comes from zyptor-backend/server.js's own PRODUCTS list,
 *   which the backend never trusts the browser for. If you add a new
 *   product or change a price, update BOTH this file and that one, or
 *   checkout will charge the old price. See /zyptor-backend/README.md.
 *
 * See README.md for exactly how to do this from github.com in your
 * browser, with no coding tools installed.
 * ------------------------------------------------------------------
 */

const ZYPTOR_PRODUCTS = [
  {
    id: "ls-belt",
    name: "Zyptor Lumbo Sacral Support Belt",
    tagline: "Ideal support for waist & back",
    price: "₹899",
    priceINR: 899,
    compareAtPrice: "₹1,499",
    image: "./model-male.png",
    gallery: ["./model-male.png", "./model-female.png", "./belt-3quarter.png", "./belt-front.png", "./infographic-benefits.jpg", "images/infographic-features.jpg"],
    imageAlt: "Model wearing the Zyptor Lumbo Sacral Support Belt, back view",
    badge: "Bestseller",
    description:
      "Firm, adjustable compression across the lumbar and sacral region — built to calm lower-back pain and take pressure off the sciatic nerve root, so you can sit, stand and move through your day without bracing against it.",
    features: [
      "Provides strong support to the lower back and lumbar region",
      "Helps relieve back pain, muscle strain and sprain",
      "Improves posture and body alignment",
      "Breathable, perforated panel for all-day comfort",
      "Double-lock adjustable straps for a customised fit",
      "Built for long hours of sitting or standing"
    ],
    indications: [
      "Lower back pain",
      "Muscle strain & sprain",
      "Poor posture",
      "Heavy lifting & long working hours"
    ],
    sizes: [
      { size: "S", waist: "28–32 in" },
      { size: "M", waist: "32–36 in" },
      { size: "L", waist: "36–40 in" },
      { size: "XL", waist: "40–44 in" },
      { size: "XXL", waist: "44–48 in" }
    ],
    sizeNote: "Measure around the navel to find your size.",
    inStock: true
  }

  // Next product goes here — copy the block above, paste below this line,
  // and remove this comment once you have more than one item.
];
