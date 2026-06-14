(function () {
  const scenes = [
    {
      text: "Alright let's do this one last time.",
      label: "Cold Open",
      caption: "Click. Glitch. Dramatic eye contact.",
      photo: "assets/photos/mirror-close.webp",
      frame: "SPIDEY SENSE: QUESTIONABLE",
      position: "50% 32%",
      hue: "0deg",
      duration: 1800,
    },
    {
      text: "My name is Nimit Limbachiya and I was bitten by a radioactive spider.",
      label: "Bite Event",
      caption: "Origin confirmed. Liability unclear.",
      photo: "assets/photos/lego-spider.webp",
      frame: "RADIOACTIVE? PROBABLY",
      position: "50% 50%",
      hue: "40deg",
      duration: 3200,
    },
    {
      text: "My newfound spidey sense helps me detect stupid people and I can cling to...the past.",
      label: "Sense Unlocked",
      caption: "A rare power. A common problem.",
      photo: "assets/photos/pool-sideeye.webp",
      frame: "TARGET ACQUIRED: BAD TAKES",
      position: "48% 38%",
      hue: "190deg",
      duration: 3600,
    },
    {
      text: "I am a third year student at IIT Bombay pursuing Civil engg",
      label: "Campus Arc",
      caption: "Structures? yes. Structure in life? pending.",
      photo: "assets/photos/jacket-pose.webp",
      frame: "CIVIL ENGG SIDE QUEST",
      position: "50% 28%",
      hue: "95deg",
      duration: 2800,
    },
    {
      text: "I make a list of things to remember and then forget about the list.",
      label: "Memory Arc",
      caption: "The list had one job.",
      photo: "assets/photos/brick-thinker.webp",
      frame: "REMINDER LOST IN CANON EVENT",
      position: "50% 35%",
      hue: "255deg",
      duration: 3000,
    },
    {
      text: "Love to read Indian Mythology books",
      label: "Lore Mode",
      caption: "Reading gods make decisions and feeling seen.",
      photo: "assets/photos/cake-lore.webp",
      frame: "MYTHOLOGY POWER-UP",
      position: "48% 40%",
      hue: "310deg",
      duration: 2300,
    },
    {
      text: "My achievements:",
      label: "Achievement Audit",
      caption: "Serious awards were unavailable.",
      photo: "assets/photos/neon-parking.webp",
      frame: "STAT SCREEN LOADING",
      position: "50% 50%",
      hue: "20deg",
      duration: 1600,
    },
    {
      text: "100+ LEGO minifigures",
      label: "Tiny Army",
      caption: "A population crisis in plastic.",
      photo: "assets/photos/lego-spider.webp",
      frame: "MINIFIGURE SUPREMACY",
      position: "50% 50%",
      hue: "55deg",
      duration: 1900,
    },
    {
      text: "11k+ trophies in Clash Royale",
      label: "Clash Era",
      caption: "Emotional stability not included.",
      photo: "assets/photos/neon-bull.webp",
      frame: "TROPHY COUNT: UNREASONABLE",
      position: "50% 43%",
      hue: "175deg",
      duration: 1900,
    },
    {
      text: "Can sleep 14+ hours straight",
      label: "Final Boss",
      caption: "Doctors hate this one simple achievement.",
      photo: "assets/photos/bed-stare.webp",
      frame: "HIBERNATION PROTOCOL",
      position: "50% 36%",
      hue: "280deg",
      duration: 2200,
    },
  ];

  const els = {
    origin: document.getElementById("origin"),
    collage: document.getElementById("collage"),
    line: document.getElementById("scriptLine"),
    label: document.getElementById("sceneLabel"),
    number: document.getElementById("sceneNumber"),
    caption: document.getElementById("captionStrip"),
    progress: document.getElementById("progressBar"),
    hero: document.getElementById("heroPhoto"),
    heroFrame: document.querySelector(".hero-comic-frame"),
    frameLabel: document.getElementById("frameLabel"),
    board: document.getElementById("collageBoard"),
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timer = 0;
  let index = 0;
  let startedAt = 0;
  let running = false;

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
    els.line.classList.toggle("is-long", scene.text.length > 62);
    els.line.classList.toggle("is-very-long", scene.text.length > 92);
    els.label.textContent = scene.label;
    els.number.textContent = String(sceneIndex + 1).padStart(2, "0");
    els.caption.textContent = scene.caption;
    els.frameLabel.textContent = scene.frame;
    els.origin.style.setProperty("--scene-hue", scene.hue);
    els.hero.style.setProperty("--hero-pos", scene.position);
    els.heroFrame.classList.add("flash");
    els.origin.classList.add("flash");

    window.setTimeout(() => {
      els.hero.src = scene.photo;
      els.heroFrame.classList.remove("flash");
      els.origin.classList.remove("flash");
    }, reducedMotion ? 1 : 130);

    const progress = ((sceneIndex + 1) / scenes.length) * 100;
    els.progress.style.width = `${progress}%`;
  }

  function finishIntro(options = {}) {
    running = false;
    window.clearTimeout(timer);
    els.origin.classList.add("is-done");
    document.body.classList.add("show-collage");

    if (!options.noScroll && !reducedMotion) {
      window.setTimeout(() => {
        els.collage.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 650);
    }
  }

  function scheduleNext() {
    if (!running) return;
    const scene = scenes[index];
    const duration = reducedMotion ? Math.min(scene.duration, 700) : scene.duration;

    timer = window.setTimeout(() => {
      if (index >= scenes.length - 1) {
        finishIntro();
        return;
      }
      renderScene(index + 1);
      scheduleNext();
    }, duration);
  }

  function startIntro() {
    running = true;
    startedAt = Date.now();
    document.body.classList.remove("show-collage");
    els.origin.classList.remove("is-done");
    window.clearTimeout(timer);
    renderScene(0);
    scheduleNext();
  }

  function skipIntro() {
    renderScene(scenes.length - 1);
    finishIntro();
  }

  function attachControls() {
    document.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.getAttribute("data-action");
        if (action === "skip") skipIntro();
        if (action === "replay") {
          window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
          window.setTimeout(startIntro, reducedMotion ? 1 : 400);
        }
      });
    });
  }

  function attachBoardParallax() {
    if (reducedMotion || !els.board) return;

    els.board.addEventListener("pointermove", (event) => {
      const rect = els.board.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      els.board.querySelectorAll(".photo-card").forEach((card, cardIndex) => {
        const strength = (cardIndex % 4) + 2;
        card.style.marginLeft = `${x * strength * 2}px`;
        card.style.marginTop = `${y * strength * 2}px`;
      });
    });

    els.board.addEventListener("pointerleave", () => {
      els.board.querySelectorAll(".photo-card").forEach((card) => {
        card.style.marginLeft = "";
        card.style.marginTop = "";
      });
    });
  }

  function revealIfReturningVisitor() {
    const hasHash = window.location.hash === "#collage";
    if (hasHash) {
      renderScene(scenes.length - 1);
      finishIntro({ noScroll: true });
    }
  }

  attachControls();
  attachBoardParallax();
  revealIfReturningVisitor();

  if (!document.body.classList.contains("show-collage")) {
    startIntro();
  }

  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "s") skipIntro();
    if (event.key.toLowerCase() === "r" && Date.now() - startedAt > 500) {
      startIntro();
    }
  });
})();
