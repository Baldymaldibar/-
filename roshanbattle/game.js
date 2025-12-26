// ================== ENTITIES ==================
const sf = {
  hp: 100,
  maxHp: 100,
  element: document.querySelector(".fighter-wrap.left"),
  razeStacks: 0,
  lastRazeDamage: 0
};

const roshan = {
  hp: 500,
  maxHp: 500,
  element: document.querySelector(".fighter-wrap.right")
};

// ================== CONSTANTS ==================
const RAZE_BASE_MIN = 14;
const RAZE_BASE_MAX = 18;
const RAZE_MULTIPLIER = 1.5;
const RAZE_MISS_CHANCE = 0.15;
const RAZE_MAX_STACKS = 5;

// ================== UI ==================
const btnAttack = document.getElementById("btnAttack");
const btnRaze = document.getElementById("btnRaze");
const btnDodge = document.getElementById("btnDodge");

const skillcheck = document.getElementById("skillcheck");
const indicator = skillcheck?.querySelector(".indicator");
const sweet = skillcheck?.querySelector(".sweet");

let inputLocked = false;

// skillcheck state
let skillActive = false;
let skillSuccess = false;
let skillAnimId = null;
let skillTimeoutId = null;

// ================== HELPERS ==================
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function log(text) {
  const el = document.getElementById("log");
  if (el) el.innerText = text;
}

function updateBars() {
  const sfBar = document.getElementById("sfHp");
  const roshanBar = document.getElementById("roshanHp");
  if (sfBar) sfBar.style.width = (sf.hp / sf.maxHp) * 100 + "%";
  if (roshanBar) roshanBar.style.width = (roshan.hp / roshan.maxHp) * 100 + "%";
}

function setInputLocked(v) {
  inputLocked = v;
  if (btnAttack) btnAttack.disabled = v;
  if (btnRaze) btnRaze.disabled = v;
  // Dodge оставляем активной
}

// ================== ANIMATION ==================
function animateAttack(el, cb) {
  el.classList.add("attack");
  setTimeout(() => {
    cb();
    el.classList.remove("attack");
  }, 200);
}

function hitAnimation(el) {
  el.classList.add("hit");
  setTimeout(() => el.classList.remove("hit"), 150);
}

function showDamage(targetEl, dmg) {
  const text = document.createElement("div");
  text.className = "damage-text";
  text.innerText = "-" + dmg;
  targetEl.appendChild(text);
  setTimeout(() => text.remove(), 800);
}

// ================== Shadowraze sprite ==================
function showRazeSpriteNearRoshan() {
  const arena = document.getElementById("arena");
  if (!arena) return;

  const img = document.createElement("img");
  img.className = "raze-sprite";
  img.src = "../images/shadowraze.png";
  img.alt = "Shadowraze";

  arena.appendChild(img);

  setTimeout(() => img.remove(), 700);
}

// ================== COMBAT CORE ==================
function dealDamage(attacker, target, amount) {
  target.hp = Math.max(0, target.hp - amount);
  showDamage(target.element, amount);
  hitAnimation(target.element);
  updateBars();
  checkBattleEnd();
}

function checkBattleEnd() {
  if (sf.hp <= 0) endGame("Shadow Fiend пал...");
  if (roshan.hp <= 0) endGame();
}

// ================== END GAME & REWARD ==================
function endGame() {
  if (roshan.hp <= 0) {
    rewardMaskOfMadness();
  } else {
    alert("Shadow Fiend пал...");
    location.reload();
  }
}

function rewardMaskOfMadness() {
  const arena = document.getElementById("arena");
  if (!arena) return;

  // Скрываем Рошана
  roshan.element.style.transition = "opacity 0.8s, transform 0.8s";
  roshan.element.style.opacity = "0";
  roshan.element.style.transform = "scale(0.5) translateY(50px)";

  // Создаем предмет
  const mask = document.createElement("img");
  mask.src = "../images/mask_of_madness.png";
  mask.alt = "Mask of Madness";
  mask.style.position = "absolute";
  mask.style.left = roshan.element.offsetLeft + 100 + "px";
  mask.style.bottom = "120px";
  mask.style.width = "150px";
  mask.style.cursor = "pointer";
  mask.style.opacity = "0";
  mask.style.transform = "scale(0.7)";
  mask.style.transition = "opacity 0.8s, transform 0.8s";
  arena.appendChild(mask);

  requestAnimationFrame(() => {
    mask.style.opacity = "1";
    mask.style.transform = "scale(1)";
  });

  mask.addEventListener("click", () => {
    window.location.href = '../final/index11.html'; // сюда редирект
  });
}

// ================== PLAYER ACTIONS ==================
function attack() {
  animateAttack(sf.element, () => {
    const dmg = random(15, 25);
    dealDamage(sf, roshan, dmg);
    log(`Shadow Fiend атакует: -${dmg} HP`);
    roshanTurn();
  });
}

function raze() {
  animateAttack(sf.element, () => {
    if (Math.random() < RAZE_MISS_CHANCE) {
      sf.razeStacks = 0;
      sf.lastRazeDamage = 0;
      log("Shadowraze промахнулся! Стаки сброшены 💀");
      roshanTurn();
      return;
    }

    let dmg;
    if (sf.razeStacks === 0) {
      dmg = random(RAZE_BASE_MIN, RAZE_BASE_MAX);
    } else if (sf.razeStacks < RAZE_MAX_STACKS) {
      dmg = Math.floor(sf.lastRazeDamage * RAZE_MULTIPLIER);
    } else {
      dmg = sf.lastRazeDamage;
    }

    sf.razeStacks = Math.min(sf.razeStacks + 1, RAZE_MAX_STACKS);
    sf.lastRazeDamage = dmg;

    showRazeSpriteNearRoshan();
    dealDamage(sf, roshan, dmg);
    log(`Shadowraze x${sf.razeStacks}/${RAZE_MAX_STACKS} — ${dmg} DMG`);

    roshanTurn();
  });
}

// ================== SKILLCHECK (DODGE) ==================
function startSkillcheck(duration = 850) {
  if (!skillcheck || !indicator || !sweet) return;
  if (skillAnimId) cancelAnimationFrame(skillAnimId);
  if (skillTimeoutId) clearTimeout(skillTimeoutId);

  skillActive = true;
  skillSuccess = false;

  skillcheck.classList.remove("hidden");

  const barWidth = 260;
  const sweetWidth = sweet.offsetWidth;
  const padding = 40;

  const sweetX = padding + Math.random() * (barWidth - sweetWidth - padding * 2);
  sweet.style.left = sweetX + "px";
  indicator.style.left = "0px";

  let start = null;
  function animate(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    indicator.style.left = p * barWidth + "px";

    if (p < 1 && skillActive) {
      skillAnimId = requestAnimationFrame(animate);
    } else if (skillActive) {
      endSkillcheck(false);
    }
  }
  skillAnimId = requestAnimationFrame(animate);

  skillTimeoutId = setTimeout(() => {
    if (skillActive) endSkillcheck(false);
  }, duration + 20);
}

function trySkill() {
  if (!skillActive) return;
  const indX = indicator.offsetLeft;
  const sweetX = sweet.offsetLeft;
  if (indX >= sweetX && indX <= sweetX + sweet.offsetWidth) {
    endSkillcheck(true);
  } else {
    endSkillcheck(false);
  }
}

let originalEndSkillcheck = null;
function endSkillcheck(success) {
  skillActive = false;
  skillSuccess = success;

  if (skillAnimId) cancelAnimationFrame(skillAnimId);
  if (skillTimeoutId) clearTimeout(skillTimeoutId);
  if (skillcheck) skillcheck.classList.add("hidden");

  if (originalEndSkillcheck) {
    originalEndSkillcheck(success);
    originalEndSkillcheck = null;
  }
}

// ================== ROSHAN ==================
function roshanTurn() {
  if (sf.hp <= 0 || roshan.hp <= 0) {
    setInputLocked(false);
    return;
  }

  setInputLocked(true);

  setTimeout(() => {
    const dmg = random(10, 18);

    originalEndSkillcheck = (success) => {
      if (success) {
        log("PERFECT DODGE!");
        hitAnimation(roshan.element);
      } else {
        animateAttack(roshan.element, () => {
          dealDamage(roshan, sf, dmg);
          log(`Roshan бьёт: -${dmg} HP`);
        });
      }
      setInputLocked(false);
    };

    startSkillcheck(850);

  }, 700);
}

// ================== PLAYER ACTIONS WRAPPER ==================
function playerAction(fn) {
  if (inputLocked) return;
  if (sf.hp <= 0 || roshan.hp <= 0) return;
  setInputLocked(true);
  fn();
}

// ================== INPUT ==================
if (btnAttack) btnAttack.addEventListener("click", () => playerAction(attack));
if (btnRaze) btnRaze.addEventListener("click", () => playerAction(raze));
if (btnDodge) btnDodge.addEventListener("click", trySkill);

document.addEventListener("keydown", (e) => {
  if (["input", "textarea"].includes(e.target.tagName?.toLowerCase())) return;

  if (e.key.toLowerCase() === "a") playerAction(attack);
  if (e.key.toLowerCase() === "s") playerAction(raze);
  if (e.key.toLowerCase() === "d") trySkill();
});

// ================== INIT ==================
updateBars();
log("A — Attack | S — Shadowraze | D — Dodge (skillcheck)");