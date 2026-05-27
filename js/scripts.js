document.addEventListener("DOMContentLoaded", () => {
  let lenis = null;

  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.5,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      wheelMultiplier: 0.65,
      touchMultiplier: 1.05,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }

  /* =========================
     SCROLL SUAVE DOS LINKS
  ========================= */

  const header = document.querySelector(".site-header");
  const scrollLinks = document.querySelectorAll('a[href^="#"]');

  function getHeaderHeight() {
    return header ? header.offsetHeight : 0;
  }

  function scrollToTarget(targetId) {
    const target = document.querySelector(targetId);

    if (!target) return;

    const top =
      target.getBoundingClientRect().top +
      window.pageYOffset -
      getHeaderHeight() -
      12;

    if (lenis) {
      lenis.scrollTo(top, {
        duration: 1.8,
        easing: (t) => 1 - Math.pow(1 - t, 4),
      });
    } else {
      window.scrollTo({
        top,
        behavior: "smooth",
      });
    }
  }

  scrollLinks.forEach((link) => {
    const href = link.getAttribute("href");

    if (!href || href === "#") return;

    link.addEventListener("click", (event) => {
      const target = document.querySelector(href);

      if (!target) return;

      event.preventDefault();
      scrollToTarget(href);
      closeSidebar();
    });
  });

  /* =========================
     SIDEBAR MOBILE
  ========================= */

  const menuButton = document.querySelector(".mobile-menu-button");
  const sidebarClose = document.querySelector(".sidebar-close");
  const sidebarOverlay = document.querySelector(".sidebar-overlay");
  const sidebarLinks = document.querySelectorAll(".mobile-sidebar a");

  function openSidebar() {
    document.body.classList.add("sidebar-open");

    if (lenis) {
      lenis.stop();
    }
  }

  function closeSidebar() {
    document.body.classList.remove("sidebar-open");

    if (lenis) {
      lenis.start();
    }
  }

  if (menuButton) {
    menuButton.addEventListener("click", openSidebar);
  }

  if (sidebarClose) {
    sidebarClose.addEventListener("click", closeSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebar);
  }

  sidebarLinks.forEach((link) => {
    link.addEventListener("click", closeSidebar);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSidebar();
    }
  });

  /* =========================
     CARROSSEL SUPERIOR INFINITO
  ========================= */

  const carouselTrack = document.getElementById("carouselTrack");

  if (carouselTrack) {
    const originalItems = Array.from(carouselTrack.children);

    originalItems.forEach((item) => {
      carouselTrack.appendChild(item.cloneNode(true));
    });

    originalItems.forEach((item) => {
      carouselTrack.appendChild(item.cloneNode(true));
    });

    let carouselPosition = 0;
    const carouselSpeed = 0.25;
    let isCarouselPaused = false;
    const carouselGap = 24;

    function getCarouselOriginalWidth() {
      let width = 0;

      originalItems.forEach((item) => {
        width += item.offsetWidth + carouselGap;
      });

      return width;
    }

    function normalizeCarouselPosition() {
      const originalWidth = getCarouselOriginalWidth();

      if (Math.abs(carouselPosition) >= originalWidth) {
        carouselPosition = 0;
      }
    }

    function animateTopCarousel() {
      if (!isCarouselPaused) {
        carouselPosition -= carouselSpeed;
        normalizeCarouselPosition();

        carouselTrack.style.transform = `translateX(${carouselPosition}px)`;
      }

      requestAnimationFrame(animateTopCarousel);
    }

    carouselTrack.addEventListener("mouseenter", () => {
      isCarouselPaused = true;
    });

    carouselTrack.addEventListener("mouseleave", () => {
      isCarouselPaused = false;
    });

    animateTopCarousel();
  }

  /* =========================
     GALERIA EDUCAÇÃO
  ========================= */

  const educationGalleryCards = document.querySelectorAll(
    ".education-gallery .gallery-card"
  );

  educationGalleryCards.forEach((card) => {
    card.addEventListener("click", () => {
      educationGalleryCards.forEach((item) => {
        item.classList.remove("active");
      });

      card.classList.add("active");
    });
  });

  /* =========================
     CARROSSEL JUVENTUDE
     INFINITO + ARRASTE + INÉRCIA
  ========================= */

  const youthCarousel = document.getElementById("youthCarousel");
  const youthTrack = document.getElementById("youthTrack");

  if (youthCarousel && youthTrack) {
    const originalCards = Array.from(youthTrack.children);

    originalCards.forEach((card) => {
      youthTrack.appendChild(card.cloneNode(true));
    });

    originalCards.forEach((card) => {
      youthTrack.appendChild(card.cloneNode(true));
    });

    let youthPosition = 0;
    const youthAutoSpeed = 0.25;
    let youthVelocity = 0;

    let isDragging = false;
    let lastX = 0;
    let lastTime = 0;

    const youthGap = 10;

    function getYouthOriginalWidth() {
      let width = 0;

      originalCards.forEach((card) => {
        width += card.offsetWidth + youthGap;
      });

      return width;
    }

    function normalizeYouthPosition() {
      const originalWidth = getYouthOriginalWidth();

      if (youthPosition <= -originalWidth * 2) {
        youthPosition += originalWidth;
      }

      if (youthPosition >= 0) {
        youthPosition -= originalWidth;
      }
    }

    function updateYouthPosition() {
      youthTrack.style.transform = `translateX(${youthPosition}px)`;
    }

    function startDrag(clientX) {
      isDragging = true;
      lastX = clientX;
      lastTime = Date.now();
      youthVelocity = 0;

      youthCarousel.classList.add("dragging");
    }

    function moveDrag(clientX) {
      if (!isDragging) return;

      const currentTime = Date.now();
      const deltaX = clientX - lastX;
      const deltaTime = currentTime - lastTime || 16;

      youthPosition += deltaX;
      youthVelocity = (deltaX / deltaTime) * 16;

      lastX = clientX;
      lastTime = currentTime;

      normalizeYouthPosition();
      updateYouthPosition();
    }

    function endDrag() {
      if (!isDragging) return;

      isDragging = false;
      youthCarousel.classList.remove("dragging");
    }

    youthCarousel.addEventListener("mousedown", (event) => {
      event.preventDefault();
      startDrag(event.clientX);
    });

    window.addEventListener("mousemove", (event) => {
      moveDrag(event.clientX);
    });

    window.addEventListener("mouseup", endDrag);

    youthCarousel.addEventListener(
      "touchstart",
      (event) => {
        startDrag(event.touches[0].clientX);
      },
      { passive: true }
    );

    window.addEventListener(
      "touchmove",
      (event) => {
        if (!isDragging) return;
        moveDrag(event.touches[0].clientX);
      },
      { passive: true }
    );

    window.addEventListener("touchend", endDrag);

    function animateYouthCarousel() {
      if (!isDragging) {
        if (Math.abs(youthVelocity) > 0.05) {
          youthPosition += youthVelocity;
          youthVelocity *= 0.94;
        } else {
          youthPosition -= youthAutoSpeed;
        }

        normalizeYouthPosition();
        updateYouthPosition();
      }

      requestAnimationFrame(animateYouthCarousel);
    }

    youthPosition = -getYouthOriginalWidth();
    updateYouthPosition();
    animateYouthCarousel();
  }

  /* =========================
     FAQ / ACORDEÃO
  ========================= */

  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const button = item.querySelector(".faq-question");
    const icon = item.querySelector(".faq-question i");
    const answer = item.querySelector(".faq-answer");

    if (!button || !answer) return;

    if (item.classList.contains("active")) {
      answer.style.maxHeight = `${answer.scrollHeight}px`;
    }

    button.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      faqItems.forEach((faq) => {
        const faqIcon = faq.querySelector(".faq-question i");
        const faqAnswer = faq.querySelector(".faq-answer");

        faq.classList.remove("active");

        if (faqAnswer) {
          faqAnswer.style.maxHeight = null;
        }

        if (faqIcon) {
          faqIcon.classList.remove("fa-minus");
          faqIcon.classList.add("fa-plus");
        }
      });

      if (!isActive) {
        item.classList.add("active");
        answer.style.maxHeight = `${answer.scrollHeight}px`;

        if (icon) {
          icon.classList.remove("fa-plus");
          icon.classList.add("fa-minus");
        }
      }
    });
  });

  /* =========================
     AJUSTE FAQ AO REDIMENSIONAR
  ========================= */

  window.addEventListener("resize", () => {
    faqItems.forEach((item) => {
      const answer = item.querySelector(".faq-answer");

      if (item.classList.contains("active") && answer) {
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      }
    });
  });
});