import { HeroSection } from "@/components/landing/hero-section";
import { AboutSection } from "@/components/landing/about-section";
import { StatsBar } from "@/components/landing/stats-bar";
import { GallerySection } from "@/components/landing/gallery-section";
import { AchievementsSection } from "@/components/landing/achievements-section";
import { BlogSection } from "@/components/landing/blog-section";
import { ContactSection } from "@/components/landing/contact-section";
import { Divider } from "@/components/landing/divider";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <StatsBar />
      <GallerySection />
      <AchievementsSection />
      <Divider />
      <BlogSection />
      <ContactSection />
    </>
  );
}
