"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Mail } from "lucide-react";
import NeonMesh from "@/components/neon-mesh";
import PlatformCard, { type Platform } from "@/components/platform-card";
import LaunchOverlay, { type LaunchState } from "@/components/launch-overlay";
import ThemeToggle from "@/components/theme-toggle";
import SocialDock from "@/components/social-dock";

const platforms: Platform[] = [
  {
    name: "EVC Nigeria",
    domain: "www.evcng.com",
    href: "https://www.evcng.com",
    description:
      "Our corporate home — verified property portfolio, land acquisition, project developments, and company insights.",
    tag: "Public",
    logo: { src: "/images/evc-mark.png", width: 512, height: 512 },
  },
  {
    name: "EVC Workspace",
    domain: "workspace.evcng.com",
    href: "https://workspace.evcng.com",
    description:
      "Internal ERP & operations — task management, workforce directory, salary sheets, and team collaboration.",
    tag: "Internal",
    logo: { src: "/images/evc-mark.png", width: 512, height: 512 },
  },
  {
    name: "Property Portal",
    domain: "portal.evcng.com",
    href: "https://portal.evcng.com",
    description:
      "Client document vault — secure paperless access to land purchase documents, deed records, and property timelines.",
    tag: "Client",
    logo: { src: "/images/evc-mark.png", width: 512, height: 512 },
  },
  {
    name: "Webmail",
    domain: "mail.evcng.com",
    href: "https://mail.evcng.com",
    description: "Official corporate mail client for @evcng.com staff and administration.",
    tag: "Mail",
    icon: Mail,
  },
];

export default function Home() {
  const [launch, setLaunch] = useState<LaunchState | null>(null);
  const launchRef = useRef<Platform | null>(null);

  const handleLaunch = useCallback(
    (platform: Platform, rect: LaunchState["rect"]) => {
      launchRef.current = platform;
      setLaunch({ platform, rect });
      document.body.classList.add("is-launching");
    },
    []
  );

  // Fired by the overlay once the card has flipped and flown off.
  const handleLaunchDone = useCallback(() => {
    if (launchRef.current) window.location.href = launchRef.current.href;
  }, []);

  useEffect(() => {
    // Returning via the back button restores this page from the bfcache with
    // the overlay still mounted — clear it so the page is usable again.
    const handlePageShow = () => {
      launchRef.current = null;
      document.body.classList.remove("is-launching");
      setLaunch(null);
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.body.classList.remove("is-launching");
    };
  }, []);

  return (
    <main className="relative min-h-screen lg:h-screen lg:overflow-hidden">
      {/* Background layer */}
      <div className="fixed inset-0 z-0">
        <NeonMesh className="absolute inset-0" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--vignette)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent"
        />
      </div>

      {/* Foreground — pointer-events-none lets the cursor drive the mesh;
          re-enabled on the interactive children. */}
      <div className="page-content pointer-events-none relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-7 sm:px-8 lg:h-screen lg:px-10">
        {/* -my-2 absorbs the taller logo so it scales up without pushing the
            hero and cards further down the page. */}
        <header className="animate-fade-up -my-2 flex shrink-0 items-center justify-between gap-4">
          {/* Both variants are rendered and swapped by the `dark` class, so the
              right logo shows on first paint without waiting for hydration. */}
          <Image
            src="/images/evc-logo-light.png"
            alt="EVC Nigeria"
            width={568}
            height={230}
            priority
            sizes="(max-width: 640px) 100px, 140px"
            className="h-10 w-auto sm:h-12 dark:hidden"
          />
          <Image
            src="/images/evc-logo-dark.png"
            alt="EVC Nigeria"
            width={568}
            height={230}
            priority
            sizes="(max-width: 640px) 100px, 140px"
            className="hidden h-10 w-auto sm:h-12 dark:block"
          />
          <div className="flex items-center gap-3">
            <span className="pointer-events-auto hidden items-center gap-2 rounded-full border border-line-strong bg-surface px-3.5 py-1.5 text-[11px] font-bold tracking-wide text-soft backdrop-blur-xl sm:inline-flex">
              <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-gold" />
              Celebrating 4 Years of Building Legacy
            </span>
            <ThemeToggle />
          </div>
        </header>

        {/* Hero + cards */}
        <section className="flex flex-1 flex-col justify-center py-10 lg:py-0">
          <h1
            className="animate-fade-up max-w-3xl text-[2.15rem] leading-[1.06] font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem]"
            style={{ animationDelay: "0.1s" }}
          >
            Every EVC platform,{" "}
            <span className="bg-gradient-to-r from-heading-from via-heading-via to-heading-from bg-clip-text text-transparent">
              one place.
            </span>
          </h1>

          <p
            className="animate-fade-up mt-5 max-w-xl text-[0.95rem] leading-relaxed text-muted sm:text-base"
            style={{ animationDelay: "0.18s" }}
          >
            A single gateway into the systems and client portals that power EVC Nigeria. Pick where
            you&apos;re headed.
          </p>

          <div className="pointer-events-auto mt-9 grid gap-4 sm:grid-cols-2 lg:mt-11 lg:grid-cols-4">
            {platforms.map((platform, i) => (
              <PlatformCard
                key={platform.domain}
                platform={platform}
                index={i}
                onLaunch={handleLaunch}
              />
            ))}
          </div>
        </section>

        {/* Footer */}
        {/* Dock sits on its own row until lg, then centres between the two
            1fr columns so its magnification never shifts the text beside it. */}
        <footer
          className="animate-fade-up grid shrink-0 grid-cols-1 items-center gap-x-6 gap-y-3 border-t border-line pt-4 text-[11px] text-subtle sm:grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_1fr]"
          style={{ animationDelay: "0.75s" }}
        >
          <p>© {new Date().getFullYear()} EVC Nigeria. All rights reserved.</p>
          <SocialDock className="order-first mb-1 justify-self-start sm:col-span-2 lg:order-none lg:col-span-1 lg:mb-0 lg:justify-self-center" />
          <div className="pointer-events-auto flex items-center gap-5 sm:justify-self-end">
            <a href="tel:+2347082938870" className="transition-colors hover:text-accent">
              +234 708 293 8870
            </a>
            <a href="mailto:contact@evcng.com" className="transition-colors hover:text-accent">
              contact@evcng.com
            </a>
          </div>
        </footer>
      </div>

      {launch && <LaunchOverlay launch={launch} onDone={handleLaunchDone} />}
    </main>
  );
}
