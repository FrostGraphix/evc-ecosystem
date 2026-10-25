"use client";

import { useRef, useState, type CSSProperties } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { socials as defaultSocials, type Social, type SocialId } from "@/lib/socials";
import { cn } from "@/lib/utils";

// Brand marks from Simple Icons (CC0), 24×24 viewBox.
const paths: Record<SocialId, string> = {
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  x: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
  facebook:
    "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z",
  instagram:
    "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077",
  youtube:
    "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
};

/** Brand fill revealed on hover, plus the colour its glow is tinted with. */
const brands: Record<SocialId, { fill: string; glow: string }> = {
  linkedin: { fill: "bg-[#0a66c2]", glow: "#0a66c2" },
  x: { fill: "bg-foreground", glow: "var(--foreground)" },
  facebook: { fill: "bg-[#0866ff]", glow: "#0866ff" },
  instagram: {
    fill: "bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fdf497_5%,#fd5949_45%,#d6249f_60%,#285aeb_90%)]",
    glow: "#d6249f",
  },
  youtube: { fill: "bg-[#ff0000]", glow: "#ff0000" },
};

// Magnification: tiles swell as the cursor nears, falling off over RANGE px.
const RANGE = 110;
const BASE = 36;
const PEAK = 54;
const spring = { mass: 0.1, stiffness: 170, damping: 12 };

function Glyph({ id, className }: { id: SocialId; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d={paths[id]} />
    </svg>
  );
}

function DockItem({
  social,
  index,
  mouseX,
  reduceMotion,
}: {
  social: Social;
  index: number;
  mouseX: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [active, setActive] = useState(false);
  const { fill, glow } = brands[social.id];

  const distance = useTransform(mouseX, (x) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return x - bounds.x - bounds.width / 2;
  });
  const size = useSpring(useTransform(distance, [-RANGE, 0, RANGE], [BASE, PEAK, BASE]), spring);
  const glyph = useSpring(useTransform(distance, [-RANGE, 0, RANGE], [16, 23, 16]), spring);

  return (
    <motion.a
      ref={ref}
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`EVC on ${social.name} (opens in a new tab)`}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.6 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.9 + index * 0.07, type: "spring", stiffness: 260, damping: 18 }}
      whileTap={{ scale: 0.9 }}
      style={
        {
          width: reduceMotion ? BASE : size,
          height: reduceMotion ? BASE : size,
          "--brand": glow,
        } as CSSProperties
      }
      className="group/social relative flex shrink-0 items-center justify-center rounded-xl border border-line-strong bg-chip text-soft transition-[color,border-color,box-shadow] duration-300 hover:border-transparent hover:text-white hover:shadow-[0_10px_28px_-8px_var(--brand)] focus-visible:border-transparent focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow"
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/social:opacity-100 group-focus-visible/social:opacity-100",
          fill
        )}
      />

      <motion.span
        className={cn(
          "relative flex items-center justify-center",
          social.id === "x" && "group-hover/social:text-background group-focus-visible/social:text-background"
        )}
        style={{ width: reduceMotion ? 16 : glyph, height: reduceMotion ? 16 : glyph }}
      >
        <Glyph id={social.id} className="relative h-full w-full" />
      </motion.span>

      <AnimatePresence>
        {active && (
          <div className="pointer-events-none absolute bottom-full left-1/2 mb-3 flex -translate-x-1/2 justify-center">
            <motion.div
              role="presentation"
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="relative rounded-lg border border-line-strong bg-panel px-3 py-2 text-center whitespace-nowrap shadow-[0_16px_40px_-14px_var(--panel-shadow,rgba(10,22,40,0.5))]"
            >
              <p className="text-[11px] font-bold text-foreground">{social.name}</p>
              <p className="mt-0.5 font-mono text-[10px] text-accent-muted">{social.handle}</p>
              <span
                aria-hidden
                className="absolute top-full left-1/2 -mt-[5px] h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-r border-b border-line-strong bg-panel"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.a>
  );
}

/**
 * Footer dock of EVC Nigeria's social accounts.
 * Tiles magnify toward the cursor macOS-dock style with spring physics,
 * displaying branded hover glow and tooltips for LinkedIn, X, Facebook, Instagram, and YouTube.
 */
export function SocialDock({
  items = defaultSocials,
  className,
}: {
  items?: Social[];
  className?: string;
}) {
  const mouseX = useMotionValue(Infinity);
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <nav aria-label="EVC on social media" className={cn("pointer-events-auto", className)}>
      {/* Fixed height with bottom-aligned tiles: magnified tiles rise out of
          the dock instead of growing the footer and nudging the page. */}
      <div
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="dock-sheen relative flex h-[52px] items-end gap-2 rounded-2xl border border-line-strong bg-surface px-2 pb-2 backdrop-blur-xl"
      >
        <span className="mr-1 hidden self-center pl-1.5 text-[9px] font-bold tracking-[0.18em] text-subtle uppercase sm:block">
          Follow
        </span>
        {items.map((social, i) => (
          <DockItem
            key={social.id}
            social={social}
            index={i}
            mouseX={mouseX}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>
    </nav>
  );
}

export default SocialDock;
