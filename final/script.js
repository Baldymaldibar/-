document.addEventListener("DOMContentLoaded", () => {
  // ===== Элементы =====
  const btn = document.getElementById("giveBtn");
  const gift = document.getElementById("gift");
  const finalText = document.getElementById("finalText");
  const pudgeMsg = document.getElementById("pudgeMsg");

  const canvas = document.getElementById("fireworks");
  const ctx = canvas.getContext("2d");

  // ===== Настройки перехода =====
  const NEXT_PAGE_URL = "../max/index.html";

  // 3 секунды после клика показать сообщение над Pudge
  const SHOW_MSG_AFTER_CLICK_MS = 3000;

  // 5 секунд после появления сообщения — редирект
  const REDIRECT_AFTER_MSG_MS = 5000;

  // ===== Салют =====
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function launchFireworks() {
    const fireworks = [];

    function createFirework() {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height * 0.5;
      const colors = ["#ff2e63", "#ffd700", "#00eaff", "#ffffff", "#ff9f1c"];
      const count = 60;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        fireworks.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 100,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = fireworks.length - 1; i >= 0; i--) {
        const p = fireworks[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);

        if (p.life <= 0) fireworks.splice(i, 1);
      }

      if (Math.random() < 0.05) createFirework();
      requestAnimationFrame(animate);
    }

    animate();
  }

  // ===== Снег при входе (5 секунд) =====
  const fx = document.querySelector(".winter-fx");
  const snow = document.getElementById("snow");

  const FX_ON_MS = 5000;
  const SNOW_COUNT = 60;

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

  if (fx) {
    makeSnow(SNOW_COUNT);
    fx.classList.add("is-on");

    setTimeout(() => {
      fx.classList.remove("is-on");
      if (snow) snow.innerHTML = "";
    }, FX_ON_MS);
  }

  // ===== Клик по кнопке =====
  if (btn) {
    btn.addEventListener("click", () => {
      // 1) Показ подарка
      gift.classList.remove("hidden");

      // 2) Летит к Пуджу
      setTimeout(() => {
        gift.style.left = "65%";
      }, 100);

      // 3) Показ финала + салют
      setTimeout(() => {
        finalText.classList.remove("hidden");
        btn.style.display = "none";
        launchFireworks();
      }, 2200);

      // 4) Через 3 секунды после клика — сообщение над Pudge
      setTimeout(() => {
        if (pudgeMsg) pudgeMsg.classList.add("is-show");

        // 5) Через 5 секунд после появления сообщения — редирект
        setTimeout(() => {
          window.location.href = NEXT_PAGE_URL;
        }, REDIRECT_AFTER_MSG_MS);
      }, SHOW_MSG_AFTER_CLICK_MS);
    }, { once: true }); // чтобы нельзя было нажать повторно и запустить таймеры заново
  }
});
