"use client";
import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

export default function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}>
      {children}
    </motion.div>
  );
}