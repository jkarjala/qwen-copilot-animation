# Bouncing Ball Playground

A small React + TypeScript app that renders a full-screen animation of colorful balls bouncing around the viewport. The simulation includes gravity, wall collisions, restitution, and ball-to-ball interactions so the motion feels lively and organic. You can grab any ball with the pointer, drag it around, and fling it to send it flying.

**[Live Demo](https://jkarjala.github.io/qwen-copilot-animation/)**

## Features

- Full-screen canvas-based animation with crisp retina (devicePixelRatio) scaling
- 10 brightly colored balls with randomized initial motion and size
- Gravity-driven bouncing with wall and floor collision handling
- Ball-to-ball physics with overlap resolution and elastic impulses (mass ∝ radius², so bigger balls push smaller ones)
- Interactive pointer controls: pick up a ball, drag it, and release with a throw velocity derived from recent pointer motion
- Minimum bounce and drift speeds keep the scene lively instead of settling to rest
- Responsive resizing that keeps every ball inside the new bounds
- Built with Vite, React, and TypeScript

## Tech Stack

- React 19
- TypeScript
- Vite

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev -- --host 0.0.0.0
   ```

3. Open the local preview URL shown in the terminal, typically:

   ```text
   http://localhost:5173
   ```

   If you are running in a remote environment and need external access, use the forwarded host/port provided by your environment.

## Production Build

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview -- --host 0.0.0.0
```

## Deployment

The site is published to [GitHub Pages](https://jkarjala.github.io/qwen-copilot-animation/) via the workflow in `.github/workflows/deploy.yml`. It builds the app with a base path of `/<repo-name>/` and deploys on every push to `master` (or manually from the Actions tab).

## Project Structure

```text
.
├── src/
│   ├── components/
│   │   └── BouncingBall.tsx
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Notes

The animation logic lives in `src/components/BouncingBall.tsx`. The component uses a canvas element and `requestAnimationFrame` to continuously update the ball positions and render the scene.

Key simulation constants (defined at the top of the component):

- `BALL_COUNT` — number of balls (10)
- `GRAVITY` — downward acceleration in px/s²
- `RESTITUTION` — fraction of energy kept per bounce
- `MIN_BOUNCE` / `MIN_SPEED` — floor and drift speed floors that keep the motion lively

Interaction: pointer events (`pointerdown` / `pointermove` / `pointerup`) let you grab the topmost ball under the cursor, drag it, and release it. A smoothed velocity sampled from recent pointer positions is applied on release so the ball can be thrown. The held ball is excluded from the physics integration while it is being dragged.
