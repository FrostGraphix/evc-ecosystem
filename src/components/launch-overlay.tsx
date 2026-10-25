"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { PlatformLogo, type Platform } from "./platform-card";

export interface LaunchState {
  platform: Platform;
  /** Viewport rect of the card that was clicked, used as the flight origin. */
  rect: { top: number; left: number; width: number; height: number };
}

/**
 * Size of the centred "modal" card the clicked card flies into. Deliberately
 * much larger than a grid card so the flight reads as a real 3D zoom, and clamped
 * to the viewport so it fits comfortably on mobile screens.
 */
const CARD_MAX_W = 420;
const CARD_MAX_H = 520;

const ZOOM_MS = 720;
const HOLD_MS = 260;
const EXIT_MS = 560;

type Phase = "enter" | "zoom" | "exit";

/**
 * 3D perspective flight transition: the clicked card lifts off the grid and flies
 * to the centre of the screen (`zoom`), holds for a beat, then accelerates
 * toward the viewer with 3D perspective and dissolves (`exit`) — at which
 * point `onDone` fires and navigation completes.
 */
export function LaunchOverlay({
  launch,
  onDone,
}: {
  launch: LaunchState;
  onDone: () => void;
}) {
  const { platform, rect } = launch;
  const [phase, setPhase] = useState<Phase>("enter");

  // Computed once on the click that mounts this overlay.
  const [card] = useState(() => ({
    w: Math.min(CARD_MAX_W, window.innerWidth * 0.86),
    h: Math.min(CARD_MAX_H, window.innerHeight * 0.68),
  }));

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Offset/scale that place the centred card exactly over the clicked card, so
  // the opening frame is seamless and Motion animates the delta back to zero.
  const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
  const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 0;
  const fromX = rect.left + rect.width / 2 - centerX;
  const fromY = rect.top + rect.height / 2 - centerY;
  // Capped so the flight always reads as a zoom *in*.
  const fromScale = Math.min(rect.width / card.w, 0.85);

  useEffect(() => {
    if (reduceMotion) {
      const t = window.setTimeout(onDone, 120);
      return () => window.clearTimeout(t);
    }

    // Hold one painted frame at the card's position/size before animating to center.
    const timers: number[] = [];
    let started = false;

    const start = () => {
      if (started) return;
      started = true;
      setPhase("zoom");
      timers.push(
        window.setTimeout(() => setPhase("exit"), ZOOM_MS + HOLD_MS),
        window.setTimeout(onDone, ZOOM_MS + HOLD_MS + EXIT_MS)
      );
    };

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(start);
    });

    timers.push(window.setTimeout(start, 120));

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      timers.forEach(window.clearTimeout);
    };
  }, [reduceMotion, onDone]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "exit" ? 1 : 0.88 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      />

      {/* Flying Card */}
      <motion.div
        className="relative flex flex-col overflow-hidden rounded-2xl border border-glow/35 bg-panel p-7 shadow-[0_30px_80px_-20px_var(--panel-shadow)]"
        style={{
          width: card.w,
          height: card.h,
        }}
        initial={{
          x: fromX,
          y: fromY,
          scale: fromScale,
          opacity: 1,
        }}
        animate={
          phase === "enter"
            ? {
                x: fromX,
                y: fromY,
                scale: fromScale,
                opacity: 1,
              }
            : phase === "zoom"
              ? {
                  x: 0,
                  y: 0,
                  scale: 1,
                  opacity: 1,
                }
              : {
                  x: 0,
                  y: 0,
                  scale: [1, 0.94, 5.5],
                  opacity: [1, 1, 0],
                }
        }
        transition={
          phase === "enter"
            ? { duration: 0 }
            : phase === "zoom"
              ? { duration: ZOOM_MS / 1000, ease: [0.22, 1, 0.36, 1] }
              : {
                  duration: EXIT_MS / 1000,
                  times: [0, 0.28, 1],
                  ease: [0.4, 0, 0.9, 0.4],
                }
        }
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-glow/14 via-transparent to-transparent"
        />

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-glow/25 bg-gradient-to-br from-glow/20 to-brand/10 text-accent">
            <PlatformLogo
              platform={platform}
              sizes="64px"
              imageClassName="h-8 w-8 object-contain"
              iconClassName="h-6 w-6"
            />
          </div>
          <span className="rounded-full border border-line-strong bg-chip px-2.5 py-1 text-[10px] font-bold tracking-wider text-muted uppercase">
            {platform.tag}
          </span>
        </div>

        <div className="relative mt-6 flex-1">
          <h3 className="text-xl font-extrabold tracking-tight text-foreground">
            {platform.name}
          </h3>
          <p className="mt-1 font-mono text-[11px] break-all text-accent-muted">
            {platform.domain}
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            {platform.description}
          </p>
        </div>

        <div className="relative flex items-center gap-2 text-[13px] font-semibold text-accent">
          <span>Opening {platform.name}</span>
          <ArrowUpRight className="h-4 w-4 animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
}

export default LaunchOverlay;
