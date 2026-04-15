export const dynamic = "force-dynamic";

import { getLandingConfig } from "@/lib/config/get-config";
import { HeroSection } from "@/components/landing/hero-section";
import { AboutSection } from "@/components/landing/about-section";
import { StatsBar } from "@/components/landing/stats-bar";
import { GallerySection } from "@/components/landing/gallery-section";
import { AchievementsSection } from "@/components/landing/achievements-section";
import { BlogSection } from "@/components/landing/blog-section";
import { ContactSection } from "@/components/landing/contact-section";
import { Divider } from "@/components/landing/divider";

export default async function HomePage() {
  const config = await getLandingConfig();
  const s = config.sections ?? {};

  return (
    <>
      {s.hero !== false && <HeroSection config={config.hero} />}
      {s.about !== false && <AboutSection config={config.about} />}
      {s.stats !== false && <StatsBar config={config.stats} />}
      {s.gallery !== false && <GallerySection />}
      {s.achievements !== false && <AchievementsSection />}
      {s.blog !== false && (
        <>
          <Divider />
          <BlogSection />
        </>
      )}
      {s.contact !== false && <ContactSection config={config.contact} social={config.social} />}
    </>
  );
}
