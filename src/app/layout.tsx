import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const display = Outfit({ variable: "--font-display-face", subsets: ["latin"], weight: ["500", "600", "700", "800"] });
const body = Plus_Jakarta_Sans({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "SleepPillow: From screen time to dream time", template: "%s · SleepPillow" },
  description:
    "SleepPillow is a student product concept that brings cooling, calming audio, gentle haptics, and optional app blocking into one bedtime routine.",
};

export const viewport: Viewport = {
  themeColor: "#f8f7fe",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} antialiased`}>
      <body className="min-h-dvh bg-lav-50 text-ink">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-iris px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
