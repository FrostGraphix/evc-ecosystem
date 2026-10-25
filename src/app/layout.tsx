import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { socials } from "@/lib/socials";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ecosystem.evcng.com"),
  title: "EVC Ecosystem — Every EVC platform, one place",
  description:
    "The central gateway to the EVC Nigeria digital ecosystem — corporate site, workspace ERP, property client portal, and corporate webmail.",
  openGraph: {
    title: "EVC Ecosystem — Every EVC platform, one place",
    description:
      "The central gateway to the EVC Nigeria digital ecosystem — corporate site, workspace ERP, property client portal, and corporate webmail.",
    url: "https://ecosystem.evcng.com",
    siteName: "EVC Ecosystem",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#03090a" },
  ],
};

// Lets search engines tie the official social profiles to EVC's knowledge panel.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "EVC Nigeria",
  url: "https://www.evcng.com",
  logo: "https://ecosystem.evcng.com/images/evc-logo.png",
  email: "contact@evcng.com",
  telephone: "+2347082938870",
  sameAs: socials.map((social) => social.href),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakarta.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
