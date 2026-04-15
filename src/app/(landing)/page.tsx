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
  const { sections } = config;

  return (
    <>
      {sections.hero && <HeroSection config={config.hero} />}
      {sections.about && <AboutSection config={config.about} />}
      {sections.stats && <StatsBar config={config.stats} />}
      {sections.gallery && <GallerySection />}
      {sections.achievements && <AchievementsSection />}
      {sections.blog && (
        <>
          <Divider />
          <BlogSection />
        </>
      )}
      {sections.contact && <ContactSection config={config.contact} social={config.social} />}
    </>
  );
}
