(() => {
  const overlay = document.getElementById('sleepOverlay');
  const layer = document.getElementById('zzzLayer');
  const hero = document.querySelector('.character-sleep');

  if (!overlay || !layer || !hero) return;

  const SLEEP_MS = 10000;
  const AFTER_WAKE_DELAY_MS = 2000; // пауза после пробуждения
  const SPAWN_EVERY = 550;

  // путь к новому спрайту
  const WAKE_SPRITE_SRC = '../images/sf.png'; // если лежит не рядом — укажи правильный путь
hero.classList.add('is-flipped');
hero.classList.add('is-walking-right');

  let spawnTimer = null;
  let wakeTimer = null;
  let actionTimer = null;
  let sleeping = true;

  // запомним исходную картинку, чтобы при необходимости можно было вернуть
  const initialSrc = hero.getAttribute('src');

  function heroAnchor() {
    const r = hero.getBoundingClientRect();
    return { x: r.left + r.width * 0.62, y: r.top + r.height * 0.28 };
  }

  function spawnZ() {
    if (!sleeping) return;

    const { x, y } = heroAnchor();
    const el = document.createElement('div');
    el.className = 'zzz';
    el.textContent = Math.random() < 0.6 ? 'Zzz' : 'Zz';

    const size = 18 + Math.random() * 18;
    el.style.fontSize = `${size}px`;
    el.style.left = `${x + (Math.random() * 16 - 8)}px`;
    el.style.top  = `${y + (Math.random() * 16 - 8)}px`;

    layer.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  function startSleep() {
    sleeping = true;

    hero.classList.add('is-sleeping');
    hero.classList.remove('is-walking-right');

    overlay.classList.add('is-on');

    spawnZ();
    spawnTimer = setInterval(spawnZ, SPAWN_EVERY);
    wakeTimer = setTimeout(wakeUp, SLEEP_MS);
  }

  function wakeUp() {
    sleeping = false;

    overlay.classList.remove('is-on');
    clearInterval(spawnTimer);
    clearTimeout(wakeTimer);

    layer.querySelectorAll('.zzz').forEach(z => z.remove());

    clearTimeout(actionTimer);
    actionTimer = setTimeout(() => {
      // 1) меняем спрайт
      hero.src = WAKE_SPRITE_SRC;

      // 2) запускаем движение вправо
      hero.classList.remove('is-sleeping');
      hero.classList.add('is-walking-right');
    }, AFTER_WAKE_DELAY_MS);
  }

  window.addEventListener('load', startSleep);
})();