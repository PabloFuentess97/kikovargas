"use client";

import { motion } from "framer-motion";
import { lineExpand } from "@/lib/animations";

export function Divider() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={lineExpand}
      className="h-[1px] bg-gradient-to-r from-transparent via-accent/20 to-transparent origin-center"
    />
  );
}
