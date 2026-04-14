"use client";

import { motion, type Variants } from "framer-motion";
import { fadeUp } from "@/lib/animations";

interface SectionWrapperProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  variants?: Variants;
}

export function SectionWrapper({
  children,
  id,
  className = "",
  variants = fadeUp,
}: SectionWrapperProps) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.section>
  );
}
