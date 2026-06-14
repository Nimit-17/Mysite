(function () {
  const scenes = [
    {
      text: "Alright let's do this one last time.",
      hero: "assets/photos/mirror-close.webp",
      sideA: "assets/photos/brick-thinker.webp",
      sideB: "assets/photos/lego-spider.webp",
      sideC: "assets/photos/neon-bull.webp",
      position: "50% 32%",
      hue: "0deg",
      duration: 1800,
    },
    {
      text: "My name is Nimit Limbachiya and I was bitten by a radioactive spider.",
      hero: "assets/photos/lego-spider.webp",
      sideA: "assets/photos/mirror-close.webp",
      sideB: "assets/photos/neon-parking.webp",
      sideC: "assets/photos/origin-waterfall.webp",
      position: "50% 50%",
      hue: "40deg",
      duration: 3200,
    },
    {
      text: "My newfound spidey sense helps me detect stupid people and I can cling to...the past.",
      hero: "assets/photos/pool-sideeye.webp",
      sideA: "assets/photos/mirror-glitch.webp",
      sideB: "assets/photos/bed-stare.webp",
      sideC: "assets/photos/neon-bull.webp",
      position: "48% 38%",
      hue: "190deg",
      duration: 3600,
    },
    {
      text: "I am a third year student at IIT Bombay pursuing Civil engg",
      hero: "assets/photos/jacket-pose.webp",
      sideA: "assets/photos/mirror-arch.webp",
      sideB: "assets/photos/origin-waterfall.webp",
      sideC: "assets/photos/brick-thinker.webp",
      position: "50% 28%",
      hue: "95deg",
      duration: 2800,
    },
    {
      text: "I make a list of things to remember and then forget about the list.",
      hero: "assets/photos/brick-thinker.webp",
      sideA: "assets/photos/cake-lore.webp",
      sideB: "assets/photos/mirror-close.webp",
      sideC: "assets/photos/pool-sideeye.webp",
      position: "50% 35%",
      hue: "255deg",
      duration: 3000,
    },
    {
      text: "Love to read Indian Mythology books",
      hero: "assets/photos/cake-lore.webp",
      sideA: "assets/photos/booth-smile.webp",
      sideB: "assets/photos/neon-parking.webp",
      sideC: "assets/photos/mirror-arch.webp",
      position: "48% 40%",
      hue: "310deg",
      duration: 2300,
    },
    {
      text: "My achievements:",
      hero: "assets/photos/neon-parking.webp",
      sideA: "assets/photos/lego-spider.webp",
      sideB: "assets/photos/bed-stare.webp",
      sideC: "assets/photos/neon-bull.webp",
      position: "50% 50%",
      hue: "20deg",
      duration: 1600,
    },
    {
      text: "100+ LEGO minifigures",
      hero: "assets/photos/lego-spider.webp",
      sideA: "assets/photos/mirror-close.webp",
      sideB: "assets/photos/brick-thinker.webp",
      sideC: "assets/photos/neon-parking.webp",
      position: "50% 50%",
      hue: "55deg",
      duration: 1900,
    },
    {
      text: "11k+ trophies in Clash Royale",
      hero: "assets/photos/neon-bull.webp",
      sideA: "assets/photos/neon-parking.webp",
      sideB: "assets/photos/pool-sideeye.webp",
      sideC: "assets/photos/smile-dinner.webp",
      position: "50% 43%",
      hue: "175deg",
      duration: 1900,
    },
    {
      text: "Can sleep 14+ hours straight",
      hero: "assets/photos/bed-stare.webp",
      sideA: "assets/photos/booth-smile.webp",
      sideB: "assets/photos/mirror-glitch.webp",
      sideC: "assets/photos/origin-waterfall.webp",
      position: "50% 36%",
      hue: "280deg",
      duration: 2300,
    },
  ];

  const els = {
    sequence: document.getElementById("sequence"),
    montage: document.getElementById("montage"),
    line: document.getElementById("scriptLine"),
    progress: document.getElementById("progressBar"),
    hero: document.getElementById("heroPhoto"),
    sideA: document.getElementById("sidePhotoA"),
    sideB: document.getElementById("sidePhotoB"),
    sideC: document.getElementById("sidePhotoC"),
    mainShot: document.querySelector(".shot-main"),
    card: document.querySelector(".script-card"),
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let index = 0;
  let timer = 0;

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  function setLine(text) {
    els.line.textContent = "";
    const words = text.split(" ");
    const fragment = document.createDocumentFragment();

    words.forEach((word, wordIndex) => {
      const span = document.createElement("span");
      span.className = "word";
      span.style.setProperty("--i", String(wordIndex));
      span.textContent = word;
      fragment.appendChild(span);
      if (wordIndex < words.length - 1) {
        fragment.appendChild(document.createTextNode(" "));
      }
    });

    els.line.appendChild(fragment);
  }

  function renderScene(sceneIndex) {
    const scene = scenes[sceneIndex];
    index = sceneIndex;

    setLine(scene.text);
    els.line.classList.toggle("is-long", scene.text.length > 58);
    els.line.classList.toggle("is-very-long", scene.text.length > 88);
    els.sequence.style.setProperty("--scene-hue", scene.hue);
    els.hero.style.setProperty("--hero-pos", scene.position);
    els.mainShot.classList.add("flash");
    els.card.classList.remove("flash");
    void els.card.offsetWidth;
    els.card.classList.add("flash");

    window.setTimeout(() => {
      els.hero.src = scene.hero;
      els.sideA.src = scene.sideA;
      els.sideB.src = scene.sideB;
      els.sideC.src = scene.sideC;
      els.mainShot.classList.remove("flash");
    }, reducedMotion ? 1 : 120);

    els.progress.style.width = `${((sceneIndex + 1) / scenes.length) * 100}%`;
  }

  function finish() {
    window.clearTimeout(timer);
    document.body.classList.add("montage-active");
    if (!reducedMotion) {
      window.setTimeout(() => {
        els.montage.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 420);
    }
  }

  function next() {
    const scene = scenes[index];
    timer = window.setTimeout(() => {
      if (index >= scenes.length - 1) {
        finish();
        return;
      }
      renderScene(index + 1);
      next();
    }, reducedMotion ? Math.min(scene.duration, 650) : scene.duration);
  }

  function start() {
    window.clearTimeout(timer);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.body.classList.remove("montage-active");
    renderScene(0);
    next();
  }

  start();

  window.addEventListener("click", () => {
    if (window.scrollY < window.innerHeight * 0.8) {
      finish();
    }
  });
})();
