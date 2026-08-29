/**
 * SCRIPT.JS
 * Renders product cards + the size table from ZYPTOR_PRODUCTS (see
 * products.js), and runs the scroll-reveal animations. You shouldn't
 * need to edit this file to add products — edit products.js instead.
 */

const CHECK_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7" stroke="#E30310" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function renderProducts() {
  const list = document.getElementById("product-list");
  const sizeBody = document.getElementById("size-table-body");
  const sizeNote = document.getElementById("size-note");
  if (!list || typeof ZYPTOR_PRODUCTS === "undefined") return;

  list.innerHTML = ZYPTOR_PRODUCTS.map((p, i) => {
    const gallery = p.gallery && p.gallery.length ? p.gallery : [p.image];
    return `
    <article class="product-card reveal">
      <div class="product-media" data-carousel data-index="${i}">
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ""}

        <div class="carousel-track" id="carousel-track-${i}">
          ${gallery.map((src, gi) => `
            <div class="carousel-slide ${gi === 0 ? "is-active" : ""}" data-slide="${gi}">
              <img src="${src}" alt="${p.imageAlt || p.name}">
            </div>
          `).join("")}
        </div>

        ${gallery.length > 1 ? `
        <button type="button" class="carousel-arrow carousel-arrow-prev" data-carousel-prev="${i}" aria-label="Previous photo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button type="button" class="carousel-arrow carousel-arrow-next" data-carousel-next="${i}" aria-label="Next photo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="carousel-dots" data-carousel-dots="${i}">
          ${gallery.map((_, gi) => `<button type="button" class="carousel-dot ${gi === 0 ? "is-active" : ""}" data-carousel-goto="${i}" data-slide-index="${gi}" aria-label="Go to photo ${gi + 1}"></button>`).join("")}
        </div>
        <div class="product-thumbs">
          ${gallery.map((src, gi) => `
            <button type="button" class="product-thumb ${gi === 0 ? "is-active" : ""}" data-carousel-goto="${i}" data-slide-index="${gi}" aria-label="View photo ${gi + 1}">
              <img src="${src}" alt="">
            </button>
          `).join("")}
        </div>` : ""}
      </div>
      <div class="product-info">
        <p class="tagline">${p.tagline || ""}</p>
        <h3>${p.name}</h3>
        <p class="desc">${p.description}</p>
        <div class="price-row">
          <span class="price-now">${p.price}</span>
          ${p.compareAtPrice ? `<span class="price-was">MRP ${p.compareAtPrice}</span>` : ""}
        </div>
        <ul class="feature-list">
          ${p.features.map((f) => `<li>${CHECK_SVG}<span>${f}</span></li>`).join("")}
        </ul>
        <div class="product-actions">
          <button type="button" class="btn btn-primary" data-buy-now="${p.id}">Buy Now — ${p.price}</button>
          <a href="#sizing" class="btn btn-ghost">Check Sizing</a>
        </div>
      </div>
    </article>
  `;
  }).join("");

  initCarousels();

  // Size table + note comes from the first product that has sizes.
  const withSizes = ZYPTOR_PRODUCTS.find((p) => p.sizes);
  if (withSizes && sizeBody) {
    sizeBody.innerHTML = withSizes.sizes
      .map((s) => `<tr><td>${s.size}</td><td>${s.waist}</td></tr>`)
      .join("");
    if (sizeNote) sizeNote.textContent = withSizes.sizeNote || "";
  }

  // Re-observe newly injected .reveal elements.
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
}

const CAROUSEL_INTERVAL_MS = 3800;
const carouselTimers = {};

function goToSlide(mediaEl, index) {
  const track = mediaEl.querySelector(".carousel-track");
  const slides = track.querySelectorAll(".carousel-slide");
  const dots = mediaEl.querySelectorAll(".carousel-dot");
  const thumbs = mediaEl.querySelectorAll(".product-thumb");
  const total = slides.length;
  const safeIndex = ((index % total) + total) % total;

  slides.forEach((s, i) => s.classList.toggle("is-active", i === safeIndex));
  dots.forEach((d, i) => d.classList.toggle("is-active", i === safeIndex));
  thumbs.forEach((t, i) => t.classList.toggle("is-active", i === safeIndex));
  mediaEl.dataset.current = String(safeIndex);
}

function startAutoAdvance(mediaEl) {
  const carouselId = mediaEl.dataset.index;
  stopAutoAdvance(mediaEl);
  carouselTimers[carouselId] = setInterval(() => {
    const current = parseInt(mediaEl.dataset.current || "0", 10);
    goToSlide(mediaEl, current + 1);
  }, CAROUSEL_INTERVAL_MS);
}

function stopAutoAdvance(mediaEl) {
  const carouselId = mediaEl.dataset.index;
  if (carouselTimers[carouselId]) {
    clearInterval(carouselTimers[carouselId]);
    delete carouselTimers[carouselId];
  }
}

function initCarousels() {
  document.querySelectorAll("[data-carousel]").forEach((mediaEl) => {
    mediaEl.dataset.current = "0";
    const slideCount = mediaEl.querySelectorAll(".carousel-slide").length;
    if (slideCount <= 1) return;

    startAutoAdvance(mediaEl);
    mediaEl.addEventListener("mouseenter", () => stopAutoAdvance(mediaEl));
    mediaEl.addEventListener("mouseleave", () => startAutoAdvance(mediaEl));

    const prevBtn = mediaEl.querySelector("[data-carousel-prev]");
    const nextBtn = mediaEl.querySelector("[data-carousel-next]");
    if (prevBtn) prevBtn.addEventListener("click", () => {
      goToSlide(mediaEl, parseInt(mediaEl.dataset.current, 10) - 1);
      startAutoAdvance(mediaEl);
    });
    if (nextBtn) nextBtn.addEventListener("click", () => {
      goToSlide(mediaEl, parseInt(mediaEl.dataset.current, 10) + 1);
      startAutoAdvance(mediaEl);
    });

    mediaEl.querySelectorAll("[data-carousel-goto]").forEach((el) => {
      el.addEventListener("click", () => {
        goToSlide(mediaEl, parseInt(el.dataset.slideIndex, 10));
        startAutoAdvance(mediaEl);
      });
    });
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

function updateScrollProgress() {
  const bar = document.getElementById("scroll-progress");
  if (!bar) return;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  bar.style.width = pct + "%";
}

function animateCountUp(el) {
  const target = parseInt(el.getAttribute("data-count"), 10);
  if (Number.isNaN(target)) return;
  const duration = 700;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min(1, (now - start) / duration);
    const value = Math.round(progress * target);
    el.textContent = String(value).padStart(2, "0");
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCountUp(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.4 }
);

function init() {
  document.querySelectorAll(".reveal, .reveal-stagger").forEach((el) => revealObserver.observe(el));
  document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));
  renderProducts();
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  updateScrollProgress();
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// Scripts sit at the end of <body>, so the DOM is already parsed by the
// time this file runs — DOMContentLoaded has already fired. Run init()
// immediately instead of waiting for an event that's already passed.
init();
