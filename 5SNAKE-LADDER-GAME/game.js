// ================== Configuration ==================
const SNAKES  = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 };
const LADDERS = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 };

const COLORS = ["#e63946", "#1d7ae6", "#2fb344", "#a855f7"];
const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const SVG_NS = "http://www.w3.org/2000/svg";

// ================== DOM ==================
const boardEl     = document.getElementById("board");
const overlayEl   = document.getElementById("overlay");
const tokensEl    = document.getElementById("tokens");
const playersEl   = document.getElementById("players");
const diceEl      = document.getElementById("dice");
const rollBtn     = document.getElementById("rollBtn");
const statusEl    = document.getElementById("status");
const logEl       = document.getElementById("log");
const setupEl     = document.getElementById("setup");
const winnerEl    = document.getElementById("winner");
const winnerText  = document.getElementById("winnerText");

// ================== State ==================
let players = [];      // { name, pos, color, isCPU, el }
let current = 0;
let busy = false;
let gameOver = false;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ================== Board helpers ==================
// Returns centre of square n as percentages (0-100) of the board.
function squareCenter(n) {
  const idx = n - 1;
  const row = Math.floor(idx / 10);          // 0 = bottom row
  let col = idx % 10;
  if (row % 2 === 1) col = 9 - col;          // zig-zag
  return { x: (col + 0.5) * 10, y: (9 - row + 0.5) * 10 };
}

function buildBoard() {
  // Remove previous cells (keep svg + tokens)
  boardEl.querySelectorAll(".cell").forEach((c) => c.remove());

  for (let r = 9; r >= 0; r--) {
    for (let c = 0; c < 10; c++) {
      const num = r * 10 + (r % 2 === 0 ? c + 1 : 10 - c);
      const cell = document.createElement("div");
      cell.className = "cell " + ((r + c) % 2 === 0 ? "a" : "b");
      if (SNAKES[num]) cell.classList.add("snake-head");
      if (LADDERS[num]) cell.classList.add("ladder-base");
      if (num === 100) cell.classList.add("final");
      cell.textContent = num;
      boardEl.insertBefore(cell, overlayEl);
    }
  }
}

function el(name, attrs) {
  const e = document.createElementNS(SVG_NS, name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}

function drawLadder(from, to) {
  const a = squareCenter(from), b = squareCenter(to);
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const nx = (-dy / len) * 1.3, ny = (dx / len) * 1.3; // half-width of ladder
  const g = el("g", {});

  [-1, 1].forEach((s) => {
    g.appendChild(el("line", {
      x1: a.x + nx * s, y1: a.y + ny * s, x2: b.x + nx * s, y2: b.y + ny * s,
      stroke: "#8b5a2b", "stroke-width": 0.8, "stroke-linecap": "round"
    }));
  });

  const rungs = Math.max(3, Math.floor(len / 4));
  for (let i = 1; i < rungs; i++) {
    const t = i / rungs;
    const px = a.x + dx * t, py = a.y + dy * t;
    g.appendChild(el("line", {
      x1: px - nx, y1: py - ny, x2: px + nx, y2: py + ny,
      stroke: "#b07a3c", "stroke-width": 0.6, "stroke-linecap": "round"
    }));
  }
  overlayEl.appendChild(g);
}

function drawSnake(from, to, idx) {
  const a = squareCenter(from), b = squareCenter(to); // a = head, b = tail
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const px = -dy / len, py = dx / len;                // perpendicular
  const amp = Math.min(9, len / 4);
  const hue = [120, 30, 280, 190, 340][idx % 5];
  const color = `hsl(${hue}, 60%, 40%)`;

  // S-shaped cubic curve
  const c1 = { x: a.x + dx * 0.25 + px * amp, y: a.y + dy * 0.25 + py * amp };
  const c2 = { x: a.x + dx * 0.75 - px * amp, y: a.y + dy * 0.75 - py * amp };
  const d = `M ${a.x} ${a.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${b.x} ${b.y}`;

  const g = el("g", {});
  g.appendChild(el("path", {
    d, fill: "none", stroke: color, "stroke-width": 2.2, "stroke-linecap": "round", opacity: 0.9
  }));
  g.appendChild(el("path", {
    d, fill: "none", stroke: "#ffffff55", "stroke-width": 0.7,
    "stroke-dasharray": "1.2 1.8", "stroke-linecap": "round"
  }));
  // head + eyes
  g.appendChild(el("circle", { cx: a.x, cy: a.y, r: 2, fill: color }));
  g.appendChild(el("circle", { cx: a.x - 0.7, cy: a.y - 0.5, r: 0.45, fill: "#fff" }));
  g.appendChild(el("circle", { cx: a.x + 0.7, cy: a.y - 0.5, r: 0.45, fill: "#fff" }));
  g.appendChild(el("circle", { cx: a.x - 0.7, cy: a.y - 0.5, r: 0.2, fill: "#000" }));
  g.appendChild(el("circle", { cx: a.x + 0.7, cy: a.y - 0.5, r: 0.2, fill: "#000" }));
  // tail tip
  g.appendChild(el("circle", { cx: b.x, cy: b.y, r: 0.8, fill: color }));
  overlayEl.appendChild(g);
}

function drawOverlay() {
  overlayEl.innerHTML = "";
  Object.entries(LADDERS).forEach(([f, t]) => drawLadder(+f, +t));
  Object.entries(SNAKES).forEach(([f, t], i) => drawSnake(+f, +t, i));
}

// ================== Players / tokens ==================
function placeToken(p, index, animateJump = false) {
  // Position 0 = off-board, shown just below square 1
  const c = p.pos === 0 ? { x: 5, y: 103 } : squareCenter(p.pos);
  // small offset so tokens on same square don't fully overlap
  const off = [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]][index];
  p.el.classList.toggle("jump", animateJump);
  p.el.style.left = c.x + off[0] + (p.pos === 0 ? index * 3 : 0) + "%";
  p.el.style.top  = c.y + off[1] + "%";
}

function renderPlayersPanel() {
  playersEl.innerHTML = "";
  players.forEach((p, i) => {
    const row = document.createElement("div");
    row.className = "player-row" + (i === current && !gameOver ? " active" : "");
    row.innerHTML =
      `<span class="player-dot" style="background:${p.color}"></span>
       <span class="player-name">${p.name}</span>
       <span class="player-pos">${p.pos}</span>`;
    playersEl.appendChild(row);
  });
}

function setupPlayers(count) {
  tokensEl.innerHTML = "";
  players = [];
  const total = count === 1 ? 2 : count;
  for (let i = 0; i < total; i++) {
    const isCPU = count === 1 && i === 1;
    const token = document.createElement("div");
    token.className = "token";
    token.style.background = COLORS[i];
    tokensEl.appendChild(token);
    players.push({
      name: isCPU ? "Computer" : `Player ${i + 1}`,
      pos: 0, color: COLORS[i], isCPU, el: token
    });
  }
  players.forEach((p, i) => placeToken(p, i));
}

// ================== Game flow ==================
function log(msg) {
  const li = document.createElement("li");
  li.textContent = msg;
  logEl.prepend(li);
}

function setStatus(msg) { statusEl.textContent = msg; }

async function rollDice() {
  diceEl.classList.add("rolling");
  for (let i = 0; i < 8; i++) {
    diceEl.textContent = DICE_FACES[Math.floor(Math.random() * 6)];
    await sleep(70);
  }
  diceEl.classList.remove("rolling");
  const value = Math.floor(Math.random() * 6) + 1;
  diceEl.textContent = DICE_FACES[value - 1];
  return value;
}

async function moveStepByStep(p, index, steps) {
  for (let i = 0; i < steps; i++) {
    p.pos++;
    placeToken(p, index);
    renderPlayersPanel();
    await sleep(250);
  }
}

async function takeTurn() {
  if (busy || gameOver) return;
  busy = true;
  rollBtn.disabled = true;

  const p = players[current];
  const value = await rollDice();
  log(`${p.name} rolled a ${value}`);

  if (p.pos + value > 100) {
    setStatus(`${p.name} needs an exact roll to reach 100.`);
    log(`${p.name} can't move (needs exact roll).`);
  } else {
    await moveStepByStep(p, current, value);

    if (SNAKES[p.pos]) {
      const to = SNAKES[p.pos];
      setStatus(`🐍 ${p.name} was bitten! ${p.pos} → ${to}`);
      log(`🐍 ${p.name}: ${p.pos} → ${to}`);
      await sleep(400);
      p.pos = to;
      placeToken(p, current, true);
      await sleep(800);
    } else if (LADDERS[p.pos]) {
      const to = LADDERS[p.pos];
      setStatus(`🪜 ${p.name} climbed a ladder! ${p.pos} → ${to}`);
      log(`🪜 ${p.name}: ${p.pos} → ${to}`);
      await sleep(400);
      p.pos = to;
      placeToken(p, current, true);
      await sleep(800);
    }
    renderPlayersPanel();

    if (p.pos === 100) {
      gameOver = true;
      winnerText.textContent = `🎉 ${p.name} wins!`;
      winnerEl.classList.remove("hidden");
      setStatus(`🏆 ${p.name} wins!`);
      log(`🏆 ${p.name} wins the game!`);
      renderPlayersPanel();
      busy = false;
      return;
    }
  }

  // Rolling a 6 gives another turn
  if (value === 6 && p.pos <= 100) {
    log(`${p.name} rolled a 6 – roll again!`);
    setStatus(`${p.name} rolled a 6 – roll again!`);
  } else {
    current = (current + 1) % players.length;
    setStatus(`${players[current].name}'s turn`);
  }

  renderPlayersPanel();
  busy = false;
  nextTurnUI();
}

function nextTurnUI() {
  const p = players[current];
  if (p.isCPU) {
    rollBtn.disabled = true;
    setTimeout(takeTurn, 900);
  } else {
    rollBtn.disabled = false;
  }
}

function startGame(count) {
  gameOver = false;
  busy = false;
  current = 0;
  logEl.innerHTML = "";
  diceEl.textContent = DICE_FACES[0];
  setupPlayers(count);
  renderPlayersPanel();
  setStatus(`${players[0].name}'s turn`);
  rollBtn.disabled = false;
}

// ================== Events ==================
document.getElementById("startBtn").addEventListener("click", () => {
  const count = parseInt(document.getElementById("playerCount").value, 10);
  setupEl.classList.add("hidden");
  startGame(count);
});

rollBtn.addEventListener("click", takeTurn);

function backToSetup() {
  winnerEl.classList.add("hidden");
  setupEl.classList.remove("hidden");
}
document.getElementById("playAgainBtn").addEventListener("click", backToSetup);
document.getElementById("restartBtn").addEventListener("click", () => {
  gameOver = true;     // stops any in-flight CPU turn
  busy = false;
  backToSetup();
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !rollBtn.disabled && setupEl.classList.contains("hidden")) {
    e.preventDefault();
    takeTurn();
  }
});

// ================== Init ==================
buildBoard();
drawOverlay();
rollBtn.disabled = true;
