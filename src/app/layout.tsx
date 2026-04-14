import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import { PageTracker } from "@/components/analytics/page-tracker";
import { CookieBanner } from "@/components/cookie-banner";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kiko Vargas | Professional Bodybuilder",
    template: "%s | Kiko Vargas",
  },
  description:
    "IFBB Professional Bodybuilder. Competing, coaching, and building a legacy in the sport of bodybuilding.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${oswald.variable} ${inter.variable}`}>
      <body className="min-h-screen overflow-x-hidden">
        <PageTracker />
        <CookieBanner />
        {children}
      </body>
    </html>
  );
}
