/* ═══════════════════════════════════════════════════════════
   XOXO — Tic-Tac-Toe  |  script.js
   Full game logic: 2-player, Easy AI, Hard AI (minimax),
   scoreboard, win-line animation, Web Audio sound effects,
   dark/light theme toggle.
   ═══════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────
   1. DOM REFERENCES
────────────────────────────────────── */
const themeToggle    = document.getElementById('themeToggle');
const themeIcon      = themeToggle.querySelector('.theme-icon');

const modeSelector   = document.getElementById('modeSelector');
const gameArena      = document.getElementById('gameArena');

const btn2P          = document.getElementById('btn2P');
const btnAIEasy      = document.getElementById('btnAIEasy');
const btnAIHard      = document.getElementById('btnAIHard');
const btnBack        = document.getElementById('btnBack');
const btnRestart     = document.getElementById('btnRestart');
const btnResetScore  = document.getElementById('btnResetScore');

const boardEl        = document.getElementById('board');
const playerTag      = document.getElementById('playerTag');
const turnSymbol     = document.getElementById('turnSymbol');
const turnLabel      = document.getElementById('turnLabel');

const winLineSvg     = document.getElementById('winLineSvg');
const winLine        = document.getElementById('winLine');

const scoreXVal      = document.getElementById('scoreXVal');
const scoreOVal      = document.getElementById('scoreOVal');
const scoreDrawVal   = document.getElementById('scoreDrawVal');

const modalOverlay   = document.getElementById('modalOverlay');
const modalIcon      = document.getElementById('modalIcon');
const modalTitle     = document.getElementById('modalTitle');
const modalSub       = document.getElementById('modalSub');
const btnPlayAgain   = document.getElementById('btnPlayAgain');
const btnMenu        = document.getElementById('btnMenu');

/* ──────────────────────────────────────
   2. GAME STATE
────────────────────────────────────── */
/** @type {'2p'|'easy'|'hard'} */
let gameMode      = '2p';

/** The board: array of 9 slots → null | 'X' | 'O' */
let board         = Array(9).fill(null);

/** Whose turn it is: 'X' or 'O' */
let currentPlayer = 'X';

/** Is a game currently in progress? */
let gameActive    = false;

/** Scores object */
const scores = { X: 0, O: 0, draw: 0 };

/** Win combos — index triplets */
const WIN_COMBOS = [
  [0,1,2], [3,4,5], [6,7,8], // rows
  [0,3,6], [1,4,7], [2,5,8], // cols
  [0,4,8], [2,4,6],           // diagonals
];

/** Win line coordinates inside a 300×300 SVG grid.
    Cell centres (col, row) at 50, 150, 250 (with 10px gap factored in). */
const WIN_LINE_COORDS = {
  '0,1,2': [15,  50,  285, 50 ],
  '3,4,5': [15,  150, 285, 150],
  '6,7,8': [15,  250, 285, 250],
  '0,3,6': [50,  15,  50,  285],
  '1,4,7': [150, 15,  150, 285],
  '2,5,8': [250, 15,  250, 285],
  '0,4,8': [15,  15,  285, 285],
  '2,4,6': [285, 15,  15,  285],
};

/* ──────────────────────────────────────
   3. WEB AUDIO — SOUND EFFECTS
   (No external files needed — pure tone synthesis)
────────────────────────────────────── */
let audioCtx = null;

/** Lazily create AudioContext on first user interaction */
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

/**
 * Play a short synthesized sound.
 * @param {'place'|'win'|'draw'|'lose'} type
 */
function playSound(type) {
  try {
    const ctx  = getAudioCtx();
    const gain = ctx.createGain();
    const osc  = ctx.createOscillator();
    gain.connect(ctx.destination);
    osc.connect(gain);

    const now = ctx.currentTime;

    if (type === 'place') {
      // Soft click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now); osc.stop(now + 0.12);

    } else if (type === 'win') {
      // Ascending fanfare
      const freqs = [523, 659, 784, 1047];
      freqs.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.value = f;
        const t = now + i * 0.1;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.18, t + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        o.start(t); o.stop(t + 0.35);
      });
      return; // early return — no single osc

    } else if (type === 'draw') {
      // Flat tone
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now); osc.stop(now + 0.4);

    } else if (type === 'lose') {
      // Descending tone
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.35);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now); osc.stop(now + 0.35);
    }

  } catch (e) {
    // Silently fail if AudioContext unavailable
  }
}

/* ──────────────────────────────────────
   4. THEME TOGGLE
────────────────────────────────────── */
themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  themeIcon.textContent = isDark ? '☀' : '☽';
});

/* ──────────────────────────────────────
   5. MODE SELECTION
────────────────────────────────────── */
btn2P.addEventListener('click',     () => startGame('2p'));
btnAIEasy.addEventListener('click', () => startGame('easy'));
btnAIHard.addEventListener('click', () => startGame('hard'));

/**
 * Transition from menu → game arena.
 * @param {'2p'|'easy'|'hard'} mode
 */
function startGame(mode) {
  gameMode = mode;
  resetScores();
  modeSelector.classList.add('hidden');
  gameArena.classList.remove('hidden');
  initBoard();
}

/* ──────────────────────────────────────
   6. BOARD INITIALISATION
────────────────────────────────────── */
function initBoard() {
  board         = Array(9).fill(null);
  currentPlayer = 'X';
  gameActive    = true;

  // Build cell elements if they don't exist yet
  if (boardEl.children.length === 0) {
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', `Cell ${i + 1}`);
      cell.dataset.index = i;
      cell.addEventListener('click', handleCellClick);
      boardEl.appendChild(cell);
    }
  } else {
    // Clear existing cells
    [...boardEl.children].forEach(cell => {
      cell.textContent = '';
      cell.className   = 'cell';
      cell.setAttribute('aria-label', `Cell ${cell.dataset.index * 1 + 1}`);
    });
  }

  // Reset win line
  winLine.classList.remove('animate');
  winLine.setAttribute('x1', 0); winLine.setAttribute('y1', 0);
  winLine.setAttribute('x2', 0); winLine.setAttribute('y2', 0);

  updateStatusBar();
  boardEl.classList.remove('blocked');
}

/* ──────────────────────────────────────
   7. CELL CLICK HANDLER
────────────────────────────────────── */
function handleCellClick(e) {
  const idx = parseInt(e.currentTarget.dataset.index);

  // Ignore if game over or cell already taken
  if (!gameActive || board[idx]) return;

  placeMove(idx, currentPlayer);

  // Check result
  const result = checkResult();
  if (result) { handleResult(result); return; }

  // Switch player
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateStatusBar();

  // AI turn if applicable
  if (gameMode !== '2p' && currentPlayer === 'O' && gameActive) {
    triggerAIMove();
  }
}

/* ──────────────────────────────────────
   8. PLACE A MOVE ON THE BOARD
────────────────────────────────────── */
/**
 * Places the symbol on the board and updates the DOM.
 * @param {number} idx   — Cell index 0-8
 * @param {'X'|'O'} player
 */
function placeMove(idx, player) {
  board[idx] = player;

  const cell = boardEl.children[idx];
  cell.textContent = player;
  cell.classList.add(player.toLowerCase(), 'taken', 'pop');
  cell.setAttribute('aria-label', `${player} in cell ${idx + 1}`);

  // Remove animation class after it plays so it can re-trigger
  cell.addEventListener('animationend', () => cell.classList.remove('pop'), { once: true });

  playSound('place');
}

/* ──────────────────────────────────────
   9. STATUS BAR UPDATE
────────────────────────────────────── */
function updateStatusBar() {
  turnSymbol.textContent = currentPlayer;
  turnSymbol.className   = `turn-indicator ${currentPlayer.toLowerCase()}`;

  if (gameMode === '2p') {
    turnLabel.textContent = `Player ${currentPlayer === 'X' ? '1' : '2'}'s turn`;
  } else {
    turnLabel.textContent = currentPlayer === 'X' ? "Your turn" : "AI thinking";
  }

  // Show thinking animation for AI
  if (currentPlayer === 'O' && gameMode !== '2p') {
    playerTag.classList.add('thinking');
  } else {
    playerTag.classList.remove('thinking');
  }
}

/* ──────────────────────────────────────
   10. CHECK WIN / DRAW
────────────────────────────────────── */
/**
 * Returns { winner: 'X'|'O', combo: number[] } or 'draw' or null.
 */
function checkResult() {
  for (const combo of WIN_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo };
    }
  }
  if (board.every(cell => cell !== null)) return 'draw';
  return null;
}

/* ──────────────────────────────────────
   11. HANDLE GAME RESULT
────────────────────────────────────── */
function handleResult(result) {
  gameActive = false;
  boardEl.classList.add('blocked');

  if (result === 'draw') {
    scores.draw++;
    updateScoreDisplay('draw');
    playSound('draw');
    setTimeout(() => showModal('draw', null), 500);
  } else {
    const { winner, combo } = result;
    scores[winner]++;
    updateScoreDisplay(winner);

    // Highlight winning cells
    combo.forEach(i => boardEl.children[i].classList.add('winner'));

    // Draw win line
    drawWinLine(combo);
    playSound('win');

    setTimeout(() => showModal('win', winner), 700);
  }
}

/* ──────────────────────────────────────
   12. WIN LINE ANIMATION
────────────────────────────────────── */
function drawWinLine(combo) {
  const key = combo.join(',');
  const [x1, y1, x2, y2] = WIN_LINE_COORDS[key];

  winLine.setAttribute('x1', x1);
  winLine.setAttribute('y1', y1);
  winLine.setAttribute('x2', x2);
  winLine.setAttribute('y2', y2);

  // Trigger animation on next frame
  requestAnimationFrame(() => {
    winLine.classList.remove('animate');
    void winLine.getBoundingClientRect(); // force reflow
    winLine.classList.add('animate');
  });
}

/* ──────────────────────────────────────
   13. SCOREBOARD
────────────────────────────────────── */
function updateScoreDisplay(updated) {
  scoreXVal.textContent    = scores.X;
  scoreOVal.textContent    = scores.O;
  scoreDrawVal.textContent = scores.draw;

  // Bump animation on updated score
  const target = updated === 'X' ? scoreXVal
               : updated === 'O' ? scoreOVal
               : scoreDrawVal;

  target.classList.remove('bump');
  void target.getBoundingClientRect();
  target.classList.add('bump');
  target.addEventListener('animationend', () => target.classList.remove('bump'), { once: true });
}

function resetScores() {
  scores.X = scores.O = scores.draw = 0;
  scoreXVal.textContent = scoreOVal.textContent = scoreDrawVal.textContent = '0';
}

btnResetScore.addEventListener('click', resetScores);

/* ──────────────────────────────────────
   14. RESULT MODAL
────────────────────────────────────── */
function showModal(type, winner) {
  if (type === 'win') {
    const isAI     = gameMode !== '2p';
    const playerWon = winner === 'X';

    if (isAI && !playerWon) {
      // AI wins
      modalIcon.textContent  = '🤖';
      modalTitle.textContent = 'AI Wins!';
      modalSub.textContent   = 'Better luck next time.';
      playSound('lose');
    } else if (isAI && playerWon) {
      modalIcon.textContent  = '🏆';
      modalTitle.textContent = 'You Win!';
      modalSub.textContent   = gameMode === 'hard' ? 'You beat the unbeatable!' : 'Great game!';
    } else {
      // 2-player
      modalIcon.textContent  = '🏆';
      modalTitle.textContent = `Player ${winner === 'X' ? '1 (X)' : '2 (O)'} Wins!`;
      modalSub.textContent   = 'Spectacular!';
    }
  } else {
    modalIcon.textContent  = '🤝';
    modalTitle.textContent = "It's a Draw!";
    modalSub.textContent   = 'Perfectly balanced.';
  }

  modalOverlay.classList.remove('hidden');
}

function closeModal() {
  modalOverlay.classList.add('hidden');
}

btnPlayAgain.addEventListener('click', () => {
  closeModal();
  initBoard();
});

btnMenu.addEventListener('click', () => {
  closeModal();
  goToMenu();
});

/* ──────────────────────────────────────
   15. NAVIGATION HELPERS
────────────────────────────────────── */
btnBack.addEventListener('click', goToMenu);
btnRestart.addEventListener('click', initBoard);

function goToMenu() {
  gameArena.classList.add('hidden');
  modeSelector.classList.remove('hidden');
  gameActive = false;
}

/* ──────────────────────────────────────
   16. AI — EASY MODE
   Picks a random empty cell.
────────────────────────────────────── */
function aiEasyMove() {
  const empties = board.reduce((acc, v, i) => (v === null ? [...acc, i] : acc), []);
  return empties[Math.floor(Math.random() * empties.length)];
}

/* ──────────────────────────────────────
   17. AI — HARD MODE (Minimax)
   Plays perfectly — unbeatable.
────────────────────────────────────── */

/**
 * Minimax algorithm.
 * @param {Array}   boardState   — current board copy
 * @param {boolean} isMaximizing — true = AI's turn ('O')
 * @returns {number} score
 */
function minimax(boardState, isMaximizing) {
  const result = evalBoard(boardState);
  if (result !== null) return result;

  if (isMaximizing) {
    // AI ('O') wants to maximise
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!boardState[i]) {
        boardState[i] = 'O';
        best = Math.max(best, minimax(boardState, false));
        boardState[i] = null;
      }
    }
    return best;
  } else {
    // Human ('X') wants to minimise
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!boardState[i]) {
        boardState[i] = 'X';
        best = Math.min(best, minimax(boardState, true));
        boardState[i] = null;
      }
    }
    return best;
  }
}

/**
 * Evaluate a board state.
 * @returns {number|null} +10 AI win, -10 human win, 0 draw, null ongoing
 */
function evalBoard(boardState) {
  for (const [a, b, c] of WIN_COMBOS) {
    if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
      return boardState[a] === 'O' ? 10 : -10;
    }
  }
  if (boardState.every(c => c !== null)) return 0;
  return null;
}

/**
 * Returns the best cell index for the AI using minimax.
 */
function aiHardMove() {
  let bestScore = -Infinity;
  let bestMove  = -1;

  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      const score = minimax(board, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove  = i;
      }
    }
  }
  return bestMove;
}

/* ──────────────────────────────────────
   18. AI TRIGGER
────────────────────────────────────── */
function triggerAIMove() {
  // Block the board during AI "thinking"
  boardEl.classList.add('blocked');

  // Add a small delay so the UI feels natural
  setTimeout(() => {
    if (!gameActive) return;

    const move = gameMode === 'easy' ? aiEasyMove() : aiHardMove();
    placeMove(move, 'O');

    const result = checkResult();
    if (result) {
      handleResult(result);
    } else {
      currentPlayer = 'X';
      updateStatusBar();
      boardEl.classList.remove('blocked');
    }
  }, gameMode === 'easy' ? 400 : 600);
}

/* ──────────────────────────────────────
   19. KEYBOARD ACCESSIBILITY
   Press 1-9 to play the corresponding cell
────────────────────────────────────── */
document.addEventListener('keydown', (e) => {
  if (!gameActive || (gameMode !== '2p' && currentPlayer === 'O')) return;
  const num = parseInt(e.key);
  if (num >= 1 && num <= 9) {
    const cell = boardEl.children[num - 1];
    if (cell) cell.click();
  }
});
