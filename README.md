# EVC Ecosystem Hub

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)

A unified entry gateway and portal for **EVC Nigeria**, connecting leadership, operations staff, clients, and partners to every core digital platform across the organization.

---

## 🌟 Platforms Included

| Platform | Domain / URL | Description | Audience |
| :--- | :--- | :--- | :--- |
| **EVC Workspace** | `workspace.evcng.com` | Internal team collaboration platform & ERP — tasks, leave management, asset tracking, project milestones, and team performance. | **Internal Staff & Ops** |
| **EVC Property Portal** | `portal.evcng.com` | Premium client property registry, real estate rollout tracking, documentation assignments, and verification. | **Clients & Partners** |
| **EVC Corporate** | `evcng.com` | Official corporate site — properties, project portfolio, company announcements, and national reach. | **Public & Investors** |
| **Webmail** | `mail.evcng.com` | Official corporate email client for `@evcng.com` personnel. | **Corporate Staff** |

---

## 🎨 Design Tokens & Brand Language

The EVC Ecosystem utilizes a signature design language calibrated for executive trust and visual vibrancy:

- **Deep Navy Foundations**: `#0a1628` / `#0b1329` base colorway ensuring high-contrast clarity and professional authority.
- **Warm Orange Accent System**: `#f27218` (Primary Action), `#fb923c` (Luminescent Highlights), `#ea580c` (Hover states) signaling primary CTAs and interactive focus.
- **Glassmorphic Depth**: Translucent panels with subtle backdrop blurs, glow borders, and layered surfaces.
- **Interactive Particle Mesh**: Dynamic canvas physics background creating responsive depth on cursor interaction.
- **Theme Versatility**: Complete dark, light, and system theme adaptability powered by `next-themes` and Tailwind CSS v4.

---

## 🛠️ Tech Stack & Key Features

- **Next.js 16.3 (App Router)**: Fast server and client rendering with standalone build optimizations.
- **React 19 & TypeScript 5**: Type-safe component design and modern concurrent runtime.
- **Tailwind CSS v4 & PostCSS**: Native CSS variables, lightning-fast compilation, and utility-first layout styling.
- **Framer Motion**: Smooth entry micro-animations, perspective card expansion, and transition launch states.
- **Lucide Icons**: Crisp modern iconography across all navigation controls.

---

## 🚀 Getting Started

### Prerequisites
- Node.js `^20.0.0` or higher
- npm `^10.0.0` or yarn / pnpm / bun

### Installation

1. Navigate to the project root:
   ```bash
   cd "EVC Ecosystem"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Repository Structure

```
EVC Ecosystem/
├── public/
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   └── images/
│       ├── evc-logo.png          # Full-color primary logo for light/translucent surfaces
│       ├── evc-logo-white.png    # High-contrast white logo for dark surfaces
│       ├── evc-mark.png          # Circular brand mark / badge
│       ├── pwa-192x192.png       # Standard PWA application icon (192px)
│       └── pwa-512x512.png       # High-resolution PWA application icon (512px)
├── src/
│   ├── app/
│   │   ├── apple-icon.png
│   │   ├── favicon.ico
│   │   ├── globals.css           # EVC Design tokens, CSS variables, and animations
│   │   ├── layout.tsx            # Root layout, fonts, and theme providers
│   │   └── page.tsx              # Main EVC Ecosystem Hub dashboard & gateway
│   ├── components/
│   │   ├── launch-overlay.tsx    # Card launch expansion animation
│   │   ├── neon-mesh.tsx         # Canvas particle background
│   │   └── platform-card.tsx     # Interactive platform portal cards
│   └── lib/
│       └── utils.ts              # Class merging utilities (clsx & tailwind-merge)
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```

---

## 📝 License & Copyright

© 2026 **EVC Nigeria**. All rights reserved.
