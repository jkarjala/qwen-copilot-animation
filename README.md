# Bouncing Ball Playground

A small React + TypeScript app that renders a full-screen animation of colorful balls bouncing around the viewport. The simulation includes gravity, wall collisions, restitution, and ball-to-ball interactions so the motion feels lively and organic.

## Features

- Full-screen canvas-based animation
- 10 brightly colored balls with randomized initial motion
- Gravity-driven bouncing with wall and floor collision handling
- Ball-to-ball physics with overlap resolution and elastic impulses
- Responsive resizing for different screen sizes
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

The animation logic lives in `src/components/BouncingBall.tsx`. The component uses a canvas element and requestAnimationFrame to continuously update the ball positions and render the scene.
