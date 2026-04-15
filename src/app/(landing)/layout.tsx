import type { Metadata } from "next";
import { getLandingConfig } from "@/lib/config/get-config";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { ThemeProvider } from "@/components/landing/theme-provider";

export const metadata: Metadata = {
  title: "Kiko Vargas | Professional Bodybuilder",
  description:
    "IFBB Professional Bodybuilder. Competicion, coaching y marca personal. Sponsorships y colaboraciones.",
  openGraph: {
    title: "Kiko Vargas | Professional Bodybuilder",
    description: "IFBB Pro Bodybuilder — Competicion, coaching y colaboraciones.",
    type: "website",
  },
};

export default async function LandingLayout({ children }: { children: React.ReactNode }) {
  const config = await getLandingConfig();

  return (
    <div className="grain">
      <ThemeProvider theme={config.theme} />
      <Navbar config={config.navbar} social={config.social} sections={config.sections} />
      <main>{children}</main>
      <Footer social={config.social} navbar={config.navbar} sections={config.sections} />
    </div>
  );
}
