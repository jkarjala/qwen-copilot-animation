import { useEffect, useRef } from "react";

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  color: string;
}

// Ten bright, high-contrast hues that read clearly on a black background.
const PALETTE = [
  "#ff3b30", // red
  "#ff9500", // orange
  "#ffcc00", // yellow
  "#34c759", // green
  "#32ade6", // cyan
  "#0a84ff", // blue
  "#5e5ce6", // indigo
  "#bf5af2", // purple
  "#ff2d55", // pink
  "#ffffff", // white
];

const BALL_COUNT = 10;
const GRAVITY = 2000; // px/s^2
const RESTITUTION = 0.85; // energy kept per bounce
const MIN_BOUNCE = 600; // px/s — keeps a lively floor bounce going
const MIN_SPEED = 300; // px/s — keeps a steady horizontal drift

function BouncingBall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const balls: Ball[] = [];

    // Size the backing store to the viewport (scaled for crisp retina output)
    // and keep every ball inside the new bounds.
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const b of balls) {
        b.x = Math.min(Math.max(b.x, b.radius), Math.max(b.radius, width - b.radius));
        b.y = Math.min(Math.max(b.y, b.radius), Math.max(b.radius, height - b.radius));
      }
    };

    resize();

    for (let i = 0; i < BALL_COUNT; i++) {
      const radius = 14 + Math.random() * 12;
      const spanX = Math.max(1, width - 2 * radius);
      const spanY = Math.max(1, height * 0.6);
      balls.push({
        x: radius + Math.random() * spanX,
        y: radius + Math.random() * spanY,
        vx: (Math.random() * 2 - 1) * 400,
        vy: (Math.random() * 2 - 1) * 300,
        radius,
        mass: radius * radius, // mass ∝ area, so bigger balls push smaller ones
        color: PALETTE[i % PALETTE.length],
      });
    }

    // Resolve overlapping pairs with an impulse along the line of centers.
    // Equal restitution keeps the exchange elastic; mass ∝ radius² so larger
    // balls knock smaller ones around.
    const resolveCollisions = () => {
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i];
          const b = balls[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const minDist = a.radius + b.radius;
          const distSq = dx * dx + dy * dy;
          if (distSq >= minDist * minDist) continue;

          const dist = Math.sqrt(distSq) || 0.0001;
          const nx = dx / dist;
          const ny = dy / dist;

          // Positional correction: push the pair apart so they no longer overlap.
          const overlap = minDist - dist;
          const total = a.mass + b.mass;
          a.x -= nx * overlap * (b.mass / total);
          a.y -= ny * overlap * (b.mass / total);
          b.x += nx * overlap * (a.mass / total);
          b.y += ny * overlap * (a.mass / total);

          // Impulse: only if the balls are moving toward each other.
          const rvx = b.vx - a.vx;
          const rvy = b.vy - a.vy;
          const velAlongNormal = rvx * nx + rvy * ny;
          if (velAlongNormal > 0) continue;

          const impulse = (-(1 + RESTITUTION) * velAlongNormal) / (1 / a.mass + 1 / b.mass);
          const ix = impulse * nx;
          const iy = impulse * ny;
          a.vx -= ix / a.mass;
          a.vy -= iy / a.mass;
          b.vx += ix / b.mass;
          b.vy += iy / b.mass;
        }
      }
    };

    // --- Mouse pick / drag / drop -------------------------------------------
    let grabbed: Ball | null = null;
    let grabOffsetX = 0;
    let grabOffsetY = 0;
    // Track recent pointer positions to derive a throw velocity on release.
    let lastPointerX = 0;
    let lastPointerY = 0;
    let lastPointerTime = 0;
    let throwVX = 0;
    let throwVY = 0;

    const pointerPos = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onPointerDown = (e: PointerEvent) => {
      const { x, y } = pointerPos(e);
      // Pick the topmost ball under the cursor (iterate in reverse draw order).
      for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];
        const dx = x - b.x;
        const dy = y - b.y;
        if (dx * dx + dy * dy <= b.radius * b.radius) {
          grabbed = b;
          grabOffsetX = b.x - x;
          grabOffsetY = b.y - y;
          lastPointerX = x;
          lastPointerY = y;
          lastPointerTime = performance.now();
          throwVX = 0;
          throwVY = 0;
          b.vx = 0;
          b.vy = 0;
          canvas.setPointerCapture(e.pointerId);
          break;
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!grabbed) return;
      const { x, y } = pointerPos(e);
      const now = performance.now();
      const dt = (now - lastPointerTime) / 1000;
      if (dt > 0) {
        // Smooth the instantaneous velocity so a jittery release stays sane.
        const instVX = (x - lastPointerX) / dt;
        const instVY = (y - lastPointerY) / dt;
        throwVX = throwVX * 0.6 + instVX * 0.4;
        throwVY = throwVY * 0.6 + instVY * 0.4;
      }
      lastPointerX = x;
      lastPointerY = y;
      lastPointerTime = now;

      grabbed.x = Math.min(Math.max(x + grabOffsetX, grabbed.radius), width - grabbed.radius);
      grabbed.y = Math.min(Math.max(y + grabOffsetY, grabbed.radius), height - grabbed.radius);
      grabbed.vx = 0;
      grabbed.vy = 0;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!grabbed) return;
      grabbed.vx = throwVX;
      grabbed.vy = throwVY;
      grabbed = null;
      if (canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
    };

    let lastTime = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      let dt = (now - lastTime) / 1000;
      lastTime = now;
      if (dt > 0.032) dt = 0.032; // clamp to avoid tunneling after a stall

      for (const b of balls) {
        if (b === grabbed) continue; // the held ball is driven by the pointer
        b.vy += GRAVITY * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        if (b.x - b.radius < 0) {
          b.x = b.radius;
          b.vx = -b.vx * RESTITUTION;
          if (Math.abs(b.vx) < MIN_SPEED) b.vx = (b.vx < 0 ? -1 : 1) * MIN_SPEED;
        } else if (b.x + b.radius > width) {
          b.x = width - b.radius;
          b.vx = -b.vx * RESTITUTION;
          if (Math.abs(b.vx) < MIN_SPEED) b.vx = (b.vx < 0 ? -1 : 1) * MIN_SPEED;
        }

        if (b.y - b.radius < 0) {
          b.y = b.radius;
          b.vy = -b.vy * RESTITUTION;
        } else if (b.y + b.radius > height) {
          b.y = height - b.radius;
          b.vy = -b.vy * RESTITUTION;
          if (Math.abs(b.vy) < MIN_BOUNCE) b.vy = -MIN_BOUNCE;
        }
      }

      resolveCollisions();

      // Re-clamp after collision correction so balls aren't drawn outside the canvas
      for (const b of balls) {
        b.x = Math.min(Math.max(b.x, b.radius), width - b.radius);
        b.y = Math.min(Math.max(b.y, b.radius), height - b.radius);
      }

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);
      for (const b of balls) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return <canvas ref={canvasRef} className="bouncing-ball" />;
}

export default BouncingBall;
