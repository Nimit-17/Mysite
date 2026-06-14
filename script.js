(function () {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const slideTimers = new WeakMap();
  let activeIndex = 0;
  let locked = false;

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  function lineDuration(line) {
    const configured = Number(line.dataset.duration || 0);
    if (configured) return reducedMotion ? Math.min(configured, 900) : configured;
    return reducedMotion ? 700 : 1900;
  }

  function stopLoop(slide) {
    const timer = slideTimers.get(slide);
    if (timer) window.clearTimeout(timer);
    slideTimers.delete(slide);
  }

  function showLine(slide, nextIndex) {
    const lines = Array.from(slide.querySelectorAll(".line-card"));
    if (!lines.length || !slide.classList.contains("is-active")) return;

    lines.forEach((line, index) => {
      const isCurrent = index === nextIndex;
      line.classList.toggle("is-showing", isCurrent);
      line.classList.toggle("is-leaving", false);
      line.setAttribute("aria-hidden", isCurrent ? "false" : "true");
    });

    const current = lines[nextIndex];
    const delay = lineDuration(current);
    const timer = window.setTimeout(() => {
      current.classList.remove("is-showing");
      current.classList.add("is-leaving");

      window.setTimeout(() => {
        current.classList.remove("is-leaving");
        showLine(slide, (nextIndex + 1) % lines.length);
      }, reducedMotion ? 1 : 260);
    }, delay);

    slideTimers.set(slide, timer);
  }

  function startLoop(slide) {
    stopLoop(slide);
    slide.querySelectorAll(".line-card").forEach((line) => {
      line.classList.remove("is-showing", "is-leaving");
      line.setAttribute("aria-hidden", "true");
    });
    showLine(slide, 0);
  }

  function setActive(index) {
    const nextIndex = Math.max(0, Math.min(index, slides.length - 1));
    if (nextIndex === activeIndex && slides[nextIndex].classList.contains("is-active")) return;

    activeIndex = nextIndex;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle("is-active", isActive);
      if (isActive) startLoop(slide);
      else stopLoop(slide);
    });
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

  function goTo(index) {
    const nextIndex = Math.max(0, Math.min(index, slides.length - 1));
    if (nextIndex === activeIndex) return;

    locked = true;
    setActive(nextIndex);
    window.scrollTo({
      top: slides[nextIndex].offsetTop,
      left: 0,
      behavior: reducedMotion ? "auto" : "smooth",
    });

    window.setTimeout(() => {
      locked = false;
    }, reducedMotion ? 120 : 760);
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
    { threshold: [0.58, 0.72, 0.86] }
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
  activeIndex = -1;
  setActive(0);
})();
