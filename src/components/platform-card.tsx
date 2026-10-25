"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Platform {
  name: string;
  domain: string;
  href: string;
  description: string;
  tag: string;
  /** Brand mark for the platform. Falls back to `icon` when absent. */
  logo?: PlatformImage;
  /** Variant for light mode; `logo` is used in both themes when absent. */
  logoLight?: PlatformImage;
  icon?: LucideIcon;
}

export interface PlatformImage {
  src: string;
  width: number;
  height: number;
}

/**
 * Renders the platform's mark, or its fallback icon. When a light-mode variant
 * exists both are rendered and swapped by the `dark` class, so the right one
 * shows on first paint without waiting for hydration.
 */
export function PlatformLogo({
  platform,
  sizes,
  imageClassName,
  iconClassName,
}: {
  platform: Platform;
  sizes: string;
  imageClassName: string;
  iconClassName: string;
}) {
  const { logo, logoLight, icon: Icon } = platform;

  if (!logo) return Icon ? <Icon className={iconClassName} strokeWidth={2} /> : null;

  const image = (img: PlatformImage, themeClass?: string) => (
    <Image
      src={img.src}
      alt=""
      width={img.width}
      height={img.height}
      sizes={sizes}
      className={cn(imageClassName, themeClass)}
    />
  );

  return logoLight ? (
    <>
      {image(logoLight, "dark:hidden")}
      {image(logo, "hidden dark:block")}
    </>
  ) : (
    image(logo)
  );
}

export function PlatformCard({
  platform,
  index,
  onLaunch,
}: {
  platform: Platform;
  index: number;
  onLaunch: (
    platform: Platform,
    rect: { top: number; left: number; width: number; height: number }
  ) => void;
}) {
  const { name, domain, href, description, tag } = platform;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-card
      onClick={(e) => {
        // Let modified clicks (new tab/window, middle-click) behave natively.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        // The overlay card flies from exactly where this card sits.
        const r = e.currentTarget.getBoundingClientRect();
        onLaunch(platform, { top: r.top, left: r.left, width: r.width, height: r.height });
      }}
      className="group animate-fade-up relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-glow/45 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow"
      style={{ animationDelay: `${0.3 + index * 0.08}s` }}
    >
      {/* Hover wash with EVC glow — under the content, never intercepts pointer */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-glow/12 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-glow/25 bg-gradient-to-br from-glow/20 to-brand/10 text-accent transition-transform duration-300 group-hover:scale-110">
          <PlatformLogo
            platform={platform}
            sizes="48px"
            imageClassName="h-6 w-6 object-contain"
            iconClassName="h-[18px] w-[18px]"
          />
        </div>
        <span className="rounded-full border border-line-strong bg-chip px-2 py-0.5 text-[9px] font-bold tracking-wider text-muted uppercase">
          {tag}
        </span>
      </div>

      <div className="relative mt-4 flex-1">
        <h3 className="text-base font-extrabold tracking-tight text-foreground">{name}</h3>
        <p className="mt-0.5 font-mono text-[10px] break-all text-accent-muted">{domain}</p>
        <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted">{description}</p>
      </div>

      <div className="relative mt-4 flex items-center gap-1.5 text-[12.5px] font-semibold text-soft transition-colors group-hover:text-accent">
        <span>Open</span>
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </a>
  );
}

export default PlatformCard;
