"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Point3D {
  x: number;
  y: number;
  z: number;
  oldX: number;
  oldY: number;
  oldZ: number;
  pinned: boolean;
  baseX: number;
  baseY: number;
  baseZ: number;
  projX: number;
  projY: number;
  projScale: number;
}

interface Constraint3D {
  p1: Point3D;
  p2: Point3D;
  length: number;
}

export interface NeonMeshProps {
  className?: string;
}

/**
 * Interactive 3D Verlet-physics cloth mesh canvas simulation for EVC Nigeria.
 *
 * Renders an interactive 3D particle lattice that ripples with cursor proximity,
 * ambient sinusoidal waves, and perspective rotation.
 *
 * Palettes calibrated for EVC Nigeria:
 * - Dark: deep navy backdrop (#080e18) with EVC brand orange mesh (242, 101, 34) and glowing hot accents
 * - Light: clean slate backdrop (#f8fafc) with burnt orange mesh (216, 80, 20) for high-contrast legibility
 *
 * Honors prefers-reduced-motion: renders a stationary, serene lattice backdrop without
 * wave cycles or cursor repulsion forces.
 */
export function NeonMesh({ className = "" }: NeonMeshProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduceMotion = mediaQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      reduceMotion = e.matches;
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const mouse = {
      x: -1000,
      y: -1000,
      targetAngleX: 0.2,
      targetAngleY: -0.3,
      angleX: 0.2,
      angleY: -0.3,
      radius: 150,
    };

    let points: Point3D[] = [];
    let constraints: Constraint3D[] = [];

    const initMesh = () => {
      points = [];
      constraints = [];

      // Wider spacing on mobile viewports preserves 60fps solver throughput
      const spacing = width < 768 ? 58 : 46;
      const cols = Math.ceil((width * 1.1) / spacing) + 1;
      const rows = Math.ceil((height * 1.1) / spacing) + 1;

      const grid: Point3D[][] = [];
      const startX = -(cols * spacing) / 2;
      const startY = -(rows * spacing) / 2;

      for (let j = 0; j < rows; j++) {
        grid[j] = [];
        for (let i = 0; i < cols; i++) {
          const bx = startX + i * spacing;
          const by = startY + j * spacing;
          const isEdge = i === 0 || i === cols - 1 || j === 0 || j === rows - 1;

          const p: Point3D = {
            x: bx,
            y: by,
            z: 0,
            oldX: bx,
            oldY: by,
            oldZ: 0,
            pinned: isEdge,
            baseX: bx,
            baseY: by,
            baseZ: 0,
            projX: 0,
            projY: 0,
            projScale: 1,
          };

          points.push(p);
          grid[j][i] = p;
        }
      }

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          if (i < cols - 1) {
            constraints.push({ p1: grid[j][i], p2: grid[j][i + 1], length: spacing });
          }
          if (j < rows - 1) {
            constraints.push({ p1: grid[j][i], p2: grid[j + 1][i], length: spacing });
          }
        }
      }
    };

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // setTransform to avoid compounding DPR on repeated resize calls
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initMesh();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;

      mouse.x = rawX;
      mouse.y = rawY;

      const normX = (rawX / width - 0.5) * 2;
      const normY = (rawY / height - 0.5) * 2;
      mouse.targetAngleY = normX * 0.45;
      mouse.targetAngleX = -normY * 0.35 + 0.2;
    };

    const resetMouse = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.targetAngleX = 0.2;
      mouse.targetAngleY = 0;
    };

    const handleDocumentMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget) resetMouse();
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseout", handleDocumentMouseOut);

    let time = 0;

    // EVC Brand palettes:
    // Dark: #080e18 background, 242, 101, 34 brand orange mesh lines, bright luminescent orange hot lines
    // Light: #f8fafc background, 216, 80, 20 deep orange mesh lines, rich warm accent hot lines
    const palettes = {
      dark: { bg: "#03090a", mesh: "242, 101, 34", lineAlpha: 0.11, accent: "rgba(255, 122, 51, 0.65)" },
      light: { bg: "#f8fafc", mesh: "216, 80, 20", lineAlpha: 0.14, accent: "rgba(234, 88, 12, 0.7)" },
    };

    const root = document.documentElement;
    let palette = root.classList.contains("dark") ? palettes.dark : palettes.light;
    const themeObserver = new MutationObserver(() => {
      palette = root.classList.contains("dark") ? palettes.dark : palettes.light;
    });
    themeObserver.observe(root, { attributes: true, attributeFilter: ["class"] });

    const render = () => {
      if (!reduceMotion) time += 0.022;

      mouse.angleX += (mouse.targetAngleX - mouse.angleX) * 0.05;
      mouse.angleY += (mouse.targetAngleY - mouse.angleY) * 0.05;

      const cosX = Math.cos(mouse.angleX);
      const sinX = Math.sin(mouse.angleX);
      const cosY = Math.cos(mouse.angleY);
      const sinY = Math.sin(mouse.angleY);

      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, width, height);

      // Verlet point integration
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        if (p.pinned) continue;

        const vx = (p.x - p.oldX) * 0.93;
        const vy = (p.y - p.oldY) * 0.93;
        const vz = (p.z - p.oldZ) * 0.93;

        p.oldX = p.x;
        p.oldY = p.y;
        p.oldZ = p.z;

        p.x += vx;
        p.y += vy;
        p.z += vz;

        const ambientZ = reduceMotion ? 0 : Math.sin(p.baseX * 0.015 + p.baseY * 0.015 + time) * 20;

        p.x += (p.baseX - p.x) * 0.04;
        p.y += (p.baseY - p.y) * 0.04;
        p.z += (p.baseZ + ambientZ - p.z) * 0.04;
      }

      const perspective = 620;
      const centerX = width / 2;
      const centerY = height / 2;

      // 3D Rotation & Perspective Projection
      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        const rx1 = p.x * cosY + p.z * sinY;
        const ry1 = p.y;
        const rz1 = -p.x * sinY + p.z * cosY;

        const ry2 = ry1 * cosX - rz1 * sinX;
        const rz2 = ry1 * sinX + rz1 * cosX + 400;

        const scale = perspective / Math.max(1, rz2);
        p.projScale = scale;
        p.projX = centerX + rx1 * scale;
        p.projY = centerY + ry2 * scale;

        // Cursor repulsion force
        if (!p.pinned && !reduceMotion) {
          const dx = p.projX - mouse.x;
          const dy = p.projY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius && dist > 0) {
            const force = (1 - dist / mouse.radius) * 15;
            const angle = Math.atan2(dy, dx);
            p.x += (Math.cos(angle) * force) / p.projScale;
            p.y += (Math.sin(angle) * force) / p.projScale;
            p.z -= (force * 1.5) / p.projScale;
          }
        }
      }

      // Constraint relaxation passes
      for (let iter = 0; iter < 4; iter++) {
        for (let i = 0; i < constraints.length; i++) {
          const c = constraints[i];
          const dx = c.p2.x - c.p1.x;
          const dy = c.p2.y - c.p1.y;
          const dz = c.p2.z - c.p1.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const delta = (dist - c.length) / (dist || 1);

          if (!c.p1.pinned) {
            c.p1.x += dx * 0.5 * delta;
            c.p1.y += dy * 0.5 * delta;
            c.p1.z += dz * 0.5 * delta;
          }
          if (!c.p2.pinned) {
            c.p2.x -= dx * 0.5 * delta;
            c.p2.y -= dy * 0.5 * delta;
            c.p2.z -= dz * 0.5 * delta;
          }
        }
      }

      // Draw structural cloth grid lines
      for (let i = 0; i < constraints.length; i++) {
        const c = constraints[i];
        const midX = (c.p1.projX + c.p2.projX) / 2;
        const midY = (c.p1.projY + c.p2.projY) / 2;

        const dx = mouse.x - midX;
        const dy = mouse.y - midY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const isHot = dist < mouse.radius;
        const avgScale = (c.p1.projScale + c.p2.projScale) / 2;

        ctx.strokeStyle = isHot
          ? palette.accent
          : `rgba(${palette.mesh}, ${Math.min(0.65, Math.max(0.035, palette.lineAlpha * avgScale))})`;
        ctx.lineWidth = isHot ? 1.4 * avgScale : 0.6 * avgScale;

        ctx.beginPath();
        ctx.moveTo(c.p1.projX, c.p1.projY);
        ctx.lineTo(c.p2.projX, c.p2.projY);
        ctx.stroke();
      }

      // Draw highlighted vertex nodes near cursor
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const dx = mouse.x - p.projX;
        const dy = mouse.y - p.projY;
        if (Math.sqrt(dx * dx + dy * dy) < 85) {
          ctx.fillStyle = palette.accent;
          ctx.beginPath();
          ctx.arc(p.projX, p.projY, 1.8 * p.projScale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      themeObserver.disconnect();
      mediaQuery.removeEventListener("change", handleMotionChange);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseout", handleDocumentMouseOut);
    };
  }, []);

  return (
    <div ref={containerRef} className={cn("h-full w-full overflow-hidden select-none", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 block" />
    </div>
  );
}

export default NeonMesh;
