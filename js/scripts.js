document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const menuClose = document.querySelector(".menu-close");
  const menuBackdrop = document.querySelector(".menu-backdrop");
  const mobileMenu = document.querySelector(".mobile-menu");
  const mobileLinks = document.querySelectorAll(".mobile-menu a");

  function setMenuOpen(isOpen) {
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle?.setAttribute("aria-expanded", String(isOpen));
    mobileMenu?.setAttribute("aria-hidden", String(!isOpen));
  }

  menuToggle?.addEventListener("click", () => setMenuOpen(true));
  menuClose?.addEventListener("click", () => setMenuOpen(false));
  menuBackdrop?.addEventListener("click", () => setMenuOpen(false));

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });

  initScrollEffects();
  initHeaderAndNav();
  initCarousel();
  initLightbox();
  initInterestForm();
});

function initHeaderAndNav() {
  const header = document.querySelector(".site-header");
  const backToTop = document.querySelector(".back-to-top");
  const links = [...document.querySelectorAll(".main-nav a, .mobile-menu nav a")];
  const sections = [...document.querySelectorAll("main > section[id], footer[id]")];
  let ticking = false;

  function update() {
    ticking = false;
    const y = window.scrollY;
    header?.classList.toggle("is-scrolled", y > 40);
    backToTop?.classList.toggle("is-visible", y > 700);

    const atBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 4;
    const line = window.innerHeight * 0.4;
    let current = null;
    let covering = null;
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= line) current = section;
      if (rect.top <= line && rect.bottom > line) covering = section;
    });
    current = covering ?? current;
    if (atBottom) current = sections[sections.length - 1];

    links.forEach((link) => {
      if (current && link.getAttribute("href") === `#${current.id}`) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  function request() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  update();

  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function initCarousel() {
  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const track = carousel.querySelector(".carousel-track");
    const prev = carousel.querySelector('[data-dir="-1"]');
    const next = carousel.querySelector('[data-dir="1"]');
    if (!track) return;

    function updateButtons() {
      const max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    }

    [prev, next].forEach((button) => {
      button?.addEventListener("click", () => {
        track.scrollBy({ left: Number(button.dataset.dir) * track.clientWidth * 0.85, behavior: "smooth" });
      });
    });

    track.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    updateButtons();
  });
}

function initLightbox() {
  const dialog = document.querySelector(".lightbox");
  if (!dialog || typeof dialog.showModal !== "function") return;

  const image = dialog.querySelector(".lightbox-image");
  const prev = dialog.querySelector(".lightbox-prev");
  const next = dialog.querySelector(".lightbox-next");
  let items = [];
  let index = 0;

  function show(i) {
    index = (i + items.length) % items.length;
    const trigger = items[index];
    image.src = trigger.dataset.full;
    image.alt = trigger.querySelector("img")?.alt ?? "";
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(".zoomable");
    if (!trigger) return;
    const group = trigger.closest("[data-lightbox-group]") ?? document;
    items = [...group.querySelectorAll(".zoomable")];
    prev.hidden = next.hidden = items.length < 2;
    show(items.indexOf(trigger));
    dialog.showModal();
  });

  dialog.querySelector(".lightbox-close").addEventListener("click", () => dialog.close());
  prev.addEventListener("click", () => show(index - 1));
  next.addEventListener("click", () => show(index + 1));

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      dialog.close();
    }
    if (event.key === "ArrowLeft") show(index - 1);
    if (event.key === "ArrowRight") show(index + 1);
  });

  dialog.addEventListener("close", () => {
    image.removeAttribute("src");
  });
}

function initInterestForm() {
  const form = document.getElementById("interestForm");
  if (!form) return;
  const error = form.querySelector(".form-error");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const nome = String(data.get("nome") ?? "").trim();
    const telefone = String(data.get("telefone") ?? "").trim();
    const serie = String(data.get("serie") ?? "").trim();
    const validPhone = telefone.replace(/\D/g, "").length >= 10;

    form.querySelectorAll("input, select").forEach((field) => {
      const invalid =
        !field.value.trim() || (field.name === "telefone" && !validPhone);
      field.setAttribute("aria-invalid", String(invalid));
    });

    if (!nome || !serie || !validPhone) {
      error.hidden = false;
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    error.hidden = true;
    const message =
      `Olá! Meu nome é ${nome}. Gostaria de informações sobre as matrículas 2027 ` +
      `para o ${serie}. Meu telefone para contato: ${telefone}.`;
    window.open(`https://wa.me/5565999364922?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  });
}

function initScrollEffects() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.prepend(progress);

  const parallaxItems = [
    { el: document.querySelector(".hero-image"), speed: 0.18 },
    { el: document.querySelector(".enrollment-image"), speed: 0.12 },
  ].filter((item) => item.el);

  let ticking = false;

  function update() {
    ticking = false;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;

    if (reduceMotion) return;
    parallaxItems.forEach(({ el, speed }) => {
      const rect = el.parentElement.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * -speed;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scale(1.15)`;
    });
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  update();

  if (reduceMotion || !("IntersectionObserver" in window)) return;

  const groups = [
    [".hero-content > *", "up", 120],
    [".benefit", "up", 100],
    [".section-heading", "up", 0],
    [".patron-card", "zoom", 80],
    [".proposal-copy > *", "left", 100],
    [".proposal-photos img", "zoom", 120],
    [".proposal-values article", "right", 120],
    [".differentials-title", "up", 0],
    [".differentials > article", "up", 110],
    [".school-life-heading > *", "left", 100],
    [".life-gallery article", "zoom", 100],
    [".enrollment-copy > *", "up", 100],
    [".enrollment blockquote", "up", 0],
    [".carousel", "zoom", 0],
    [".faq-list details", "up", 90],
    [".interest-copy > *", "left", 100],
    [".interest-form", "right", 0],
  ];

  const targets = [];
  groups.forEach(([selector, effect, step]) => {
    const seen = new Map();
    document.querySelectorAll(selector).forEach((el) => {
      if (el.hasAttribute("data-reveal")) return;
      const parent = el.parentElement;
      const index = seen.get(parent) ?? 0;
      seen.set(parent, index + 1);
      el.dataset.reveal = effect;
      el.style.setProperty("--reveal-delay", `${Math.min(index, 6) * step}ms`);
      targets.push(el);
    });
  });

  document.documentElement.classList.add("js");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add("is-visible");
        observer.unobserve(el);
        // Libera as transições originais do elemento (hover) após a animação
        const delay = parseFloat(el.style.getPropertyValue("--reveal-delay")) || 0;
        setTimeout(() => {
          el.removeAttribute("data-reveal");
          el.classList.remove("is-visible");
          el.style.removeProperty("--reveal-delay");
        }, delay + 900);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );

  targets.forEach((el) => observer.observe(el));
}
