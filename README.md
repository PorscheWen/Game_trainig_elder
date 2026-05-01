# Granny's Got Game

A fun multi-game web platform — because grandma can play too!

**Live Demo:** [https://porschewen.github.io/GrannysGotGame/](https://porschewen.github.io/GrannysGotGame/)

---

## Games

| Game | Description |
|------|-------------|
| **2048** | Slide tiles and combine numbers to reach 2048 |
| **Fruit Matching** | Match pairs of fruits before time runs out |
| **Sudoku** | Classic 9x9 number puzzle |
| **Whack-a-Mole** | Tap the moles before they disappear |
| **Word Chain** | Connect words where each starts with the last letter of the previous |

---

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js + Express
- **PWA:** Service Worker + Web App Manifest
- **Deployment:** GitHub Pages (frontend) · Render (backend)

---

## Features

- **Progressive Web App (PWA)** — installable on mobile and desktop
- **Offline support** via Service Worker caching
- **Responsive design** — works on phones, tablets, and desktops
- **5 playable games** with distinct mechanics

---

## Local Development

```bash
# Clone the repository
git clone https://github.com/PorscheWen/GrannysGotGame.git
cd GrannysGotGame

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start the server
node server.js
```

Open `http://localhost:3000` in your browser.

---

## Deployment

- **Frontend** is deployed via GitHub Pages from the `main` branch.
- **Backend** is deployed on [Render](https://render.com) using `render.yaml`.

---

## License

This project is unlicensed — feel free to play around with it!
