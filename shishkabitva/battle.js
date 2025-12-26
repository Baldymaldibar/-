(() => {
  const hpHeroFill = document.getElementById('hpHero');
  const hpEnemyFill = document.getElementById('hpEnemy');
  const hpHeroText = document.getElementById('hpHeroText');
  const hpEnemyText = document.getElementById('hpEnemyText');

  const heroSprite = document.getElementById('heroSprite');
  const enemySprite = document.getElementById('enemySprite');
  const arena = document.getElementById('arena');
  const log = document.getElementById('log');

  const btnAttack = document.getElementById('attack');
  const btnBlock = document.getElementById('block');

  const result = document.getElementById('result');
  const resultText = document.getElementById('resultText');
  const restart = document.getElementById('restart');

  const vs = document.querySelector('.vs');

  const state = {
    hero: { hp: 120, max: 120 },
    enemy: { hp: 120, max: 120 },
    heroBlock: false,
    locked: false,
    over: false
  };

  const rand = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  function updateUI() {
    hpHeroFill.style.width = `${(state.hero.hp / state.hero.max) * 100}%`;
    hpEnemyFill.style.width = `${(state.enemy.hp / state.enemy.max) * 100}%`;
    hpHeroText.textContent = `${state.hero.hp} / ${state.hero.max}`;
    hpEnemyText.textContent = `${state.enemy.hp} / ${state.enemy.max}`;
  }

  function addLog(text) {
    log.textContent = text;
  }

  function showVS() { if (!vs) return; vs.hidden = false; }
  function hideVS() { if (!vs) return; vs.hidden = true; }

  function endGame(win) {
    state.over = true;
    if (win) {
      rewardGoldBag();
    } else {
      result.hidden = false;
      resultText.textContent = 'ПОРАЖЕНИЕ';
    }
  }

  function enemyDeath() {
    enemySprite.classList.add('enemy-death');
  }

  function attackFX(attacker, target) {
    attacker.classList.remove('attack');
    void attacker.offsetWidth;
    attacker.classList.add('attack');

    const r = target.getBoundingClientRect();
    const a = arena.getBoundingClientRect();

    const hit = document.createElement('div');
    hit.className = 'hit-effect';
    hit.style.left = `${r.left - a.left + r.width / 2 - 60}px`;
    hit.style.top = `${r.top - a.top + r.height / 2 - 60}px`;

    arena.appendChild(hit);
    hit.addEventListener('animationend', () => hit.remove());
  }

  async function enemyTurn() {
    if (state.over) return;

    await wait(600);

    let dmg = rand(18, 30);

    if (state.heroBlock) {
      dmg = Math.max(1, Math.floor(dmg * 0.5));
      state.heroBlock = false;
      addLog(`Шишка атакует, но ты в блоке: -${dmg}`);
    } else {
      addLog(`Шишка атакует: -${dmg}`);
    }

    attackFX(enemySprite, heroSprite);

    state.hero.hp = Math.max(0, state.hero.hp - dmg);
    updateUI();

    if (state.hero.hp <= 0) {
      endGame(false);
    } else {
      state.locked = false;
    }
  }

  async function heroAction(type) {
    if (state.locked || state.over) return;
    state.locked = true;

    hideVS();

    if (type === 'attack') {
      const dmg = rand(18, 30);
      addLog(`Ты ударил: -${dmg}`);

      attackFX(heroSprite, enemySprite);

      state.enemy.hp = Math.max(0, state.enemy.hp - dmg);
      updateUI();

      if (state.enemy.hp <= 0) {
        state.over = true;
        enemyDeath();

        setTimeout(() => {
          endGame(true);
        }, 900);
        return;
      }
    }

    if (type === 'block') {
      state.heroBlock = true;
      addLog('Ты встал в блок');
    }

    await enemyTurn();
  }

  function rewardGoldBag() {
    // скрываем результат сразу
    result.hidden = true;

    const bag = document.createElement('img');
    bag.src = '../images/gold.png'; // путь к мешку с золотом
    bag.alt = 'Gold Bag';
    bag.style.position = 'absolute';
    bag.style.left = enemySprite.offsetLeft + 'px';
    bag.style.bottom = '80px';
    bag.style.width = '420px';
    bag.style.cursor = 'pointer';
    bag.style.opacity = '0';
    bag.style.transform = 'scale(0.5)';
    bag.style.transition = 'opacity 0.8s, transform 0.8s';
    arena.appendChild(bag);

    requestAnimationFrame(() => {
      bag.style.opacity = '1';
      bag.style.transform = 'scale(1)';
    });

    bag.addEventListener('click', () => {
      window.location.href = '../10/index10.html';
    });
  }

  function reset() {
    state.hero.hp = 120;
    state.enemy.hp = 120;
    state.heroBlock = false;
    state.locked = false;
    state.over = false;

    enemySprite.classList.remove('enemy-death');

    result.hidden = true;
    addLog('Битва началась!');
    updateUI();

    showVS();
    setTimeout(hideVS, 1200);
  }

  btnAttack.addEventListener('click', () => heroAction('attack'));
  btnBlock.addEventListener('click', () => heroAction('block'));
  restart.addEventListener('click', reset);

  window.addEventListener('keydown', (e) => {
    if (e.key === '1') heroAction('attack');
    if (e.key === '2') heroAction('block');
  });

  reset();
})();