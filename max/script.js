document.addEventListener("DOMContentLoaded", () => {
  const fx = document.querySelector(".winter-fx");
  const snow = document.getElementById("snow");

  // Карточка/телефон
  const cardWrap = document.getElementById("cardWrap");
  const card = document.getElementById("card");

  // Кнопка
  const sendBtn = document.getElementById("sendBtn");

  // Canvas для салюта
  const canvas = document.getElementById("fireworks");
  const ctx = canvas ? canvas.getContext("2d", { alpha: true }) : null;

  // === Настройки снега (как на прошлых экранах) ===
  const FX_ON_MS = 5000;
  const FX_FADE_MS = 800; // должно совпадать с transition opacity у .winter-fx
  const SNOW_COUNT = 60;

  // === Спрайт/картинка после клика (потом заменишь) ===
  const NEXT_SPRITE_SRC = "../images/Group 11.png";

  // === Салют ===
  let fireworksRunning = false;
  const particles = [];

  function resizeCanvas() {
    if (!canvas || !ctx) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    // Рисуем в CSS-пикселях
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createFirework() {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight * 0.5;
    const colors = ["#ff2e63", "#ffd700", "#00eaff", "#ffffff", "#ff9f1c"];
    const count = 70;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;

      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 90 + Math.floor(Math.random() * 30),
        color: colors[(Math.random() * colors.length) | 0],
      });
    }
  }

  function launchFireworks() {
    if (!canvas || !ctx) return;
    if (fireworksRunning) return;

    fireworksRunning = true;
    resizeCanvas();

    function animate() {
      // лёгкий "шлейф" (если хочешь без затемнения — скажи, заменю на clearRect)
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03; // гравитация
        p.life--;

        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);

        if (p.life <= 0) particles.splice(i, 1);
      }

      if (Math.random() < 0.06) createFirework();
      requestAnimationFrame(animate);
    }

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    animate();
  }

  // === Снег ===
  function makeSnow(count) {
    if (!snow) return;
    snow.innerHTML = "";

    for (let i = 0; i < count; i++) {
      const flake = document.createElement("div");
      flake.className = "snowflake";

      const size = (Math.random() * 6 + 3).toFixed(1) + "px";
      const x = (Math.random() * 100).toFixed(2) + "vw";
      const dur = (Math.random() * 3 + 3.5).toFixed(2) + "s";
      const delay = (-Math.random() * 6).toFixed(2) + "s";
      const drift = ((Math.random() * 60) - 30).toFixed(1) + "px";

      flake.style.setProperty("--size", size);
      flake.style.setProperty("--x", x);
      flake.style.setProperty("--dur", dur);
      flake.style.setProperty("--delay", delay);
      flake.style.setProperty("--drift", drift);

      snow.appendChild(flake);
    }
  }

  function runIntroSnow() {
    if (!fx) return Promise.resolve();

    makeSnow(SNOW_COUNT);
    fx.classList.add("is-on");

    return new Promise((resolve) => {
      setTimeout(() => {
        fx.classList.remove("is-on");
        if (snow) snow.innerHTML = "";

        setTimeout(resolve, FX_FADE_MS); // ждём fade-out
      }, FX_ON_MS);
    });
  }

  // === Выезд "телефона" (анимируем cardWrap, фон не двигается) ===
  function slideCardIn() {
    if (!cardWrap) return;

    requestAnimationFrame(() => cardWrap.classList.add("is-in"));

    const onEnd = (e) => {
      if (e.propertyName !== "transform") return;
      cardWrap.removeEventListener("transitionend", onEnd);
      if (sendBtn) sendBtn.classList.add("is-show");
    };

    cardWrap.addEventListener("transitionend", onEnd);
  }

  // === Клик по кнопке ===
  if (sendBtn && card) {
    sendBtn.addEventListener("click", () => {
      // меняем картинку/спрайт
      card.src = NEXT_SPRITE_SRC;

      // кнопка пропадает
      sendBtn.style.display = "none";

      // салют на фоне
      launchFireworks();
    });
  }

  // resize для салюта
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // === Сценарий: снег 5с -> выезд -> кнопка ===
  (async () => {
    await runIntroSnow();
    slideCardIn();
  })();
});
