const header = document.querySelector("[data-header]");
const parallax = document.querySelector("[data-parallax]");
const softParallaxItems = document.querySelectorAll("[data-parallax-soft]");
const floatingStones = document.querySelectorAll("[data-float-stone]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const processingTypes = [
  {
    title: "Полнопиленая",
    tag: "Современная архитектура",
    description: "Ровная геометрия доломита для современных мощений, площадок и архитектурных линий.",
    image: "assets/site/full-sawn.jpeg",
    gallery: [
      "assets/site/gallery-full-sawn.jpg",
      "assets/site/gallery-dolomite-set-light.jpg",
      "assets/site/gallery-dolomite-set-dark.jpg",
    ],
    alt: "Светло-серый ровный квадратный камень с гладкой пиленой поверхностью",
  },
  {
    title: "Колото-пиленая",
    tag: "Натуральная фактура",
    description: "Выразительная поверхность доломита с точной пиленой базой для надежной укладки.",
    image: "assets/site/split-sawn-premium.jpg",
    gallery: [
      "assets/site/gallery-split-sawn.jpg",
      "assets/site/gallery-dolomite-set-light.jpg",
      "assets/site/gallery-dolomite-set-dark.jpg",
    ],
    alt: "Колото-пиленая плитка из темно-серого камня на светлом фоне",
  },
  {
    title: "Галтованная",
    tag: "Эффект старинной мостовой",
    description: "Смягченные ребра и фактура доломита с эффектом выдержанной брусчатки.",
    image: "assets/site/tumbled-premium.jpg",
    gallery: [
      "assets/site/gallery-tumbled.jpg",
      "assets/site/gallery-dolomite-cube.jpg",
      "assets/site/gallery-aura.jpg",
    ],
    alt: "Галтованная брусчатка со скругленными ребрами на светлом фоне",
  },
  {
    title: "Aura",
    tag: "Премиальный внешний вид",
    description: "Мягкие грани доломита, плотная форма и чистый внешний вид после обработки в вибролотке.",
    image: "assets/site/aura.jpeg",
    gallery: [
      "assets/site/gallery-aura.jpg",
      "assets/site/gallery-dolomite-cube.jpg",
      "assets/site/gallery-tumbled.jpg",
    ],
    alt: "Серый куб брусчатки Aura с мягкими гранями на светлом фоне",
  },
];

function renderProcessingTypes() {
  const grid = document.querySelector("[data-processing-grid]");
  if (!grid) return;

  grid.innerHTML = processingTypes
    .map(
      (item) => `
        <article class="product-card reveal" data-gallery="${(item.gallery || [item.image]).join("|")}" data-gallery-title="${item.title}">
          <figure class="product-media">
            <img class="product-photo" src="${item.image}" alt="${item.alt}" loading="lazy" decoding="async" />
          </figure>
          <div class="product-copy">
            <p>${item.tag}</p>
            <h3>${item.title}</h3>
            <span>${item.description}</span>
          </div>
        </article>
      `,
    )
    .join("");
}

renderProcessingTypes();

const galleryModal = document.querySelector("[data-gallery-modal]");
const galleryImage = galleryModal?.querySelector("[data-gallery-image]");
const galleryTitle = galleryModal?.querySelector("[data-gallery-title]");
const galleryThumbs = galleryModal?.querySelector("[data-gallery-thumbs]");
const galleryPrev = galleryModal?.querySelector("[data-gallery-prev]");
const galleryNext = galleryModal?.querySelector("[data-gallery-next]");
let galleryItems = [];
let galleryIndex = 0;
let galleryAlt = "";
let galleryLastFocus = null;

function renderGallery() {
  if (!galleryModal || !galleryImage || !galleryThumbs) return;

  const current = galleryItems[galleryIndex];
  galleryImage.src = current;
  galleryImage.alt = galleryAlt;
  galleryPrev.hidden = galleryItems.length < 2;
  galleryNext.hidden = galleryItems.length < 2;

  galleryThumbs.innerHTML = galleryItems
    .map(
      (item, index) => `
        <button class="gallery-modal__thumb${index === galleryIndex ? " is-active" : ""}" type="button" data-gallery-thumb="${index}" aria-label="Открыть фото ${index + 1}">
          <img src="${item}" alt="" loading="lazy" decoding="async" />
        </button>
      `,
    )
    .join("");
}

function openGallery(card, image) {
  if (!galleryModal || !galleryImage || !galleryTitle) return;

  const rawGallery = card.dataset.gallery || image.getAttribute("src") || "";
  galleryItems = rawGallery
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!galleryItems.length) return;

  galleryIndex = Math.max(0, galleryItems.indexOf(image.getAttribute("src")));
  galleryAlt = image.getAttribute("alt") || "";
  galleryTitle.textContent = card.dataset.galleryTitle || card.querySelector("h3")?.textContent || "Натуральный камень";
  galleryLastFocus = document.activeElement;

  renderGallery();
  galleryModal.hidden = false;
  document.body.classList.add("modal-open");
  galleryModal.querySelector("[data-gallery-close]")?.focus();
}

function closeGallery() {
  if (!galleryModal || galleryModal.hidden) return;

  galleryModal.hidden = true;
  document.body.classList.remove("modal-open");
  galleryImage?.removeAttribute("src");
  galleryLastFocus?.focus?.();
}

function shiftGallery(direction) {
  if (galleryItems.length < 2) return;

  galleryIndex = (galleryIndex + direction + galleryItems.length) % galleryItems.length;
  renderGallery();
}

document.addEventListener("click", (event) => {
  const media = event.target.closest?.(".product-media");
  if (media) {
    const card = media.closest(".product-card");
    const image = media.querySelector(".product-photo");
    if (card && image) openGallery(card, image);
    return;
  }

  if (event.target.closest?.("[data-gallery-close]")) closeGallery();
  if (event.target.closest?.("[data-gallery-prev]")) shiftGallery(-1);
  if (event.target.closest?.("[data-gallery-next]")) shiftGallery(1);

  const thumb = event.target.closest?.("[data-gallery-thumb]");
  if (thumb) {
    galleryIndex = Number(thumb.dataset.galleryThumb || 0);
    renderGallery();
  }
});

document.addEventListener("keydown", (event) => {
  if (!galleryModal || galleryModal.hidden) return;

  if (event.key === "Escape") closeGallery();
  if (event.key === "ArrowLeft") shiftGallery(-1);
  if (event.key === "ArrowRight") shiftGallery(1);
});

const revealItems = document.querySelectorAll(".reveal");

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
}

function updateParallax() {
  if (!parallax || reducedMotion.matches) return;
  const shift = Math.min(window.scrollY * 0.12, 90);
  parallax.style.setProperty("--parallax", `${shift}px`);
}

function updateSoftParallax() {
  if (reducedMotion.matches) return;

  softParallaxItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const viewport = window.innerHeight || 1;
    const progress = (rect.top - viewport) / (viewport + rect.height);
    const shift = Math.max(-70, Math.min(70, progress * -90));

    item.style.setProperty("--soft-parallax", `${shift}px`);
  });
}

function updateFloatingStones() {
  if (reducedMotion.matches) return;

  floatingStones.forEach((stone) => {
    const speed = Number(stone.dataset.speed || 0);
    const rotate = Number(stone.dataset.rotate || 0);
    const depth = Math.abs(speed) + 0.7;
    const shift = window.scrollY * speed * 1.35;
    const drift = Math.sin(window.scrollY * 0.006 * depth) * 18 * depth;
    const float = Math.cos(window.scrollY * 0.004 * depth) * 10 * depth;
    const angle = window.scrollY * rotate * 1.45;

    stone.style.setProperty("--stone-shift", `${shift}px`);
    stone.style.setProperty("--stone-drift", `${drift}px`);
    stone.style.setProperty("--stone-float", `${float}px`);
    stone.style.setProperty("--stone-rotate", `${angle}deg`);
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px",
  },
);

revealItems.forEach((item, index) => {
  item.style.setProperty("--delay", `${Math.min(index % 4, 3) * 90}ms`);
  revealObserver.observe(item);
});

let ticking = false;

function onScroll() {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(() => {
    updateHeader();
    updateParallax();
    updateSoftParallax();
    updateFloatingStones();
    ticking = false;
  });
}

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", () => {
  updateParallax();
  updateSoftParallax();
  updateFloatingStones();
});
updateHeader();
updateParallax();
updateSoftParallax();
updateFloatingStones();
