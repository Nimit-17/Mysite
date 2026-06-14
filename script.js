(function () {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeIndex = 0;
  let locked = false;

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  function setActive(index) {
    activeIndex = Math.max(0, Math.min(index, slides.length - 1));
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });
  }

  function goTo(index) {
    const nextIndex = Math.max(0, Math.min(index, slides.length - 1));
    if (nextIndex === activeIndex) return;

    locked = true;
    setActive(nextIndex);
    slides[nextIndex].scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });

    window.setTimeout(() => {
      locked = false;
    }, reducedMotion ? 120 : 760);
  }

  function nearestSlide() {
    let nearest = 0;
    let nearestDistance = Infinity;

    slides.forEach((slide, index) => {
      const distance = Math.abs(slide.getBoundingClientRect().top);
      if (distance < nearestDistance) {
        nearest = index;
        nearestDistance = distance;
      }
    });

    return nearest;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      const index = slides.indexOf(visible.target);
      if (index >= 0) setActive(index);
    },
    { threshold: [0.55, 0.7, 0.85] }
  );

  slides.forEach((slide) => observer.observe(slide));

  window.addEventListener(
    "wheel",
    (event) => {
      if (Math.abs(event.deltaY) < 22) return;
      event.preventDefault();
      if (locked) return;

      const current = nearestSlide();
      setActive(current);
      goTo(current + (event.deltaY > 0 ? 1 : -1));
    },
    { passive: false }
  );

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") {
      event.preventDefault();
      goTo(nearestSlide() + 1);
    }

    if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      goTo(nearestSlide() - 1);
    }
  });

  window.addEventListener("resize", () => setActive(nearestSlide()));

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  setActive(0);
})();
