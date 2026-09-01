import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/sections/Nav";
import { Footer } from "@/components/sections/Footer";
import { Providers } from "@/components/Providers";
import { SITE_URL, WORDMARK } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
});

export const viewport: Viewport = {
  themeColor: "#0A0B0D",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Donald Mackenzie — One-on-one index and futures trading lessons",
    template: `%s — ${WORDMARK}`,
  },
  description:
    "One-on-one lessons on the S&P 500, the Nasdaq, and futures. In person, one hour at a time.",
  openGraph: {
    title: "Donald Mackenzie — One-on-one index and futures trading lessons",
    description:
      "One-on-one lessons on the S&P 500, the Nasdaq, and futures. In person, one hour at a time.",
    type: "website",
    url: SITE_URL,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Without JS the reveal animations never run, so the content they
            wrap is shown outright rather than left at opacity 0. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-svh antialiased">
        <Providers>
          <a
            href="#main"
            className="skip-link rounded-md border border-border bg-panel px-4 py-2 font-mono text-xs text-text focus:translate-y-0"
          >
            Skip to content
          </a>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
