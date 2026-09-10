import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { PREHYDRATION_TAP_REPLAY } from "@/lib/hydration";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: `Bantex Trading — Wholesale & Retail Stationery and Electrical Goods`,
    template: `%s | Bantex Trading`,
  },
  description:
    "Bantex Trading (Pvt) Ltd — wholesale and retail stationery and electrical goods in Colombo 12.",
};

export const viewport: Viewport = {
  themeColor: "#0B1E3D",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        {/* Runs during HTML parse, before any bundle: records taps that land
            before React hydration and replays the last one once it lands.
            Without this, on a phone with a cold cache every button "presses"
            (CSS) but does nothing for the first seconds — SSR paints instantly,
            onClick handlers don't exist yet. See lib/hydration.ts. */}
        <script dangerouslySetInnerHTML={{ __html: PREHYDRATION_TAP_REPLAY }} />
        {children}
      </body>
    </html>
  );
}
