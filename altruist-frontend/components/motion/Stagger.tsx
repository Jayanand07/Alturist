"use client";
import { motion, useReducedMotion } from "framer-motion";
import { Children, ReactNode } from "react";

export default function Stagger({ children, delay = 0.04 }: { children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <div className="contents">
      {Children.map(children, (child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * delay, ease: [0.4, 0, 0.2, 1] }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}