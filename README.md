# ◈ XOXO — Premium Tic-Tac-Toe

A polished, modern Tic-Tac-Toe game built with vanilla HTML, CSS, and JavaScript. Designed to feel like a premium indie game — not a textbook exercise.


Game Link: http://127.0.0.1:5500/index.html


---

## ✨ Features

| Feature | Details |
|---|---|
| 🎮 **2-Player Mode** | Local PvP — play on the same device |
| 🤖 **AI — Easy** | Random move bot for beginners |
| 💀 **AI — Hard** | Unbeatable minimax algorithm |
| 🏆 **Scoreboard** | Tracks X wins, O wins, and draws |
| 🎨 **Win Line Animation** | SVG line draws across the winning combo |
| 🔊 **Sound Effects** | Web Audio API tones — no files needed |
| 🌗 **Dark / Light Mode** | Toggle with one click |
| 📱 **Mobile Responsive** | Optimised for all screen sizes |
| ⌨️ **Keyboard Support** | Press 1–9 to place moves |

---

## 📁 Project Structure

```
xoxo-game/
├── index.html       ← Game markup & layout
├── style.css        ← All styling, themes, animations
├── script.js        ← Game logic, AI, sounds
├── README.md        ← This file
└── assets/
    └── preview.png  ← Screenshot (add your own)
```

---

## 🚀 Getting Started

### Option 1 — Live Server (VS Code)
1. Install the **Live Server** extension in VS Code
2. Open the project folder in VS Code
3. Right-click `index.html` → **Open with Live Server**
4. Game opens at `http://127.0.0.1:5500`

### Option 2 — Direct File
Simply double-click `index.html` — it runs entirely in-browser with no server needed.

---

## 🛠 VS Code Extensions Recommended

| Extension | Why |
|---|---|
| **Live Server** | Hot-reload dev server |
| **Prettier** | Auto-format code on save |
| **ESLint** | Catch JS errors early |
| **GitLens** | Enhanced Git history in editor |
| **Color Highlight** | Visualise CSS colour values inline |
| **Indent Rainbow** | Colour-coded indentation |

---

## 🤖 How the AI Works

### Easy Mode
Picks a random empty cell every turn. Great for beginners.

### Hard Mode (Minimax)
Uses the **minimax algorithm** — a recursive decision tree that evaluates every possible game state. The AI assigns:
- `+10` for an AI win
- `-10` for a human win
- `0` for a draw

It always picks the move with the highest score. **It cannot be beaten** — only drawn (if you play perfectly).

---

## 🎵 Sound Design

All sounds are generated at runtime using the **Web Audio API** — zero external audio files required:
- `place` — soft sine-wave click
- `win` — ascending 4-note fanfare
- `draw` — flat triangle tone
- `lose` — descending sawtooth

---

## 🔮 Future Upgrade Ideas

- [ ] **Online Multiplayer** — WebSockets (Socket.io) for real-time PvP
- [ ] **Global Leaderboard** — Supabase or Firebase backend
- [ ] **React Rewrite** — Component-based architecture, React hooks
- [ ] **Animations++ ** — Framer Motion for React version
- [ ] **Custom Player Names** — Enter names before each match
- [ ] **Game History** — Replay last game move-by-move
- [ ] **Confetti on Win** — canvas-confetti library
- [ ] **PWA** — Add to home screen, offline play
- [ ] **Ultimate Tic-Tac-Toe** — 9 boards in a 3×3 meta-grid

---

## 📄 License

MIT — free to use, modify, and distribute.

---

> Built with 🖤 using vanilla HTML, CSS & JavaScript.
