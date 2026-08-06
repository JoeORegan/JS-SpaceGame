# Space Game JS

![GitHub repo size](https://img.shields.io/github/repo-size/JoeORegan/JS-SpaceGame?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/JoeORegan/JS-SpaceGame?style=flat-square)
![Stars](https://img.shields.io/github/stars/JoeORegan/JS-SpaceGame?style=social)
![GitHub Pages](https://img.shields.io/badge/deployed%20on-GitHub%20Pages-222?style=flat-square)

---

JavaScript/HTML5 Canvas space shooter, based on the Kodeco (Ray Wenderlich) Cocos2d-x tutorial, rebuilt as a browser game.

Tutorial source: <https://www.kodeco.com/2728-cocos2d-x-tutorial-for-ios-and-android-space-game>

---

## Play Online

- [GitHub Pages](https://joeoregan.github.io/JS-SpaceGame/)

---

## Features

- Player ship movement (keyboard)
- Laser shooting with object pooling
- Asteroid spawning with pooling
- Laser ↔ asteroid collision detection
- Ship hit detection, lives, and invulnerability blink
- Win/Lose game states and restart
- Parallax scrolling backgrounds
- Particle starfield
- Background music + sound effects
- Debug toggles for tuning
- Top menu + dark/light theme toggle

---

## Controls

- **Move:** `W` / `S` or `↑` / `↓`
- **Fire:** `Space`
- **Restart:** `R` or `Enter`
- **Toggle Audio:** `M`
- **Debug:** `P`
- **Parallax seam debug:** `O`
- **World speed:** `K` / `L`

---

## Tech Stack

- Vanilla JavaScript (ES Modules)
- HTML5 Canvas
- CSS
- Audio via HTMLAudioElement
- Texture atlas + plist parsing

---

## Run Locally

### Option 1: npm (recommended)

```bash
npm install
npm start
```

Then open: <http://127.0.0.1:5500/>

### Option 2: VS Code Live Server

1. Open project in VS Code
2. Run **Live Server** on `index.html`
3. Open in browser

### Option 3: Python static server

```bash
python -m http.server 5500
```

Then open: <http://127.0.0.1:5500/>

---

## Project Structure

```text
assets/
  audio/
    music/
    sfx/
  images/
  particles/
src/
  audio/
  entities/
  fx/
  gfx/
  game.js
  input.js
index.html
package.json
```

---

## Audio Notes

- Background music uses `assets/audio/music/SpaceGame.ogg` with MP3 fallback.
- Sound effects are loaded from `assets/audio/sfx/`.

---

## Screenshots

![Gameplay screenshot](https://github.com/JoeORegan/joeoregan.github.io/blob/main/src/assets/spacegame/cover.jpg?raw=true)

---

## Roadmap

- [ ] Explosion particle effects on asteroid hit
- [ ] Enemy ships + enemy lasers
- [ ] Score system + high score persistence
- [ ] Power-ups
- [ ] Mobile/touch controls
- [ ] Settings panel (audio volume, difficulty)

---

## Related Projects

- [Space Quest JS](https://github.com/JoeORegan/JS-SpaceQuest)
- [Antibody JavaScript](https://github.com/JoeORegan/JS-Antibody)
- [Flappy Bird JavaScript](https://github.com/JoeORegan/JS-FlappyBird)

---

## Credits

- Original tutorial/game design inspiration: Kodeco / Ray Wenderlich Cocos2d-x Space Game tutorial
- Original C++ versions from Platform Game Development work
