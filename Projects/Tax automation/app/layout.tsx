import type { Metadata } from "next";
import { IBM_Plex_Sans, Lexend } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-heading",
  subsets: ["latin"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Tax Desk",
    template: "%s · Tax Desk",
  },
  description:
    "Deterministic, auditable tax calculations for Sri Lanka — individual income tax, built on versioned official rules.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${lexend.variable} ${plexSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
