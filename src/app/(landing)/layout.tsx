import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Kiko Vargas | Professional Bodybuilder",
  description:
    "IFBB Professional Bodybuilder. Competición, coaching y marca personal. Sponsorships y colaboraciones.",
  openGraph: {
    title: "Kiko Vargas | Professional Bodybuilder",
    description: "IFBB Pro Bodybuilder — Competición, coaching y colaboraciones.",
    type: "website",
  },
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grain">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
