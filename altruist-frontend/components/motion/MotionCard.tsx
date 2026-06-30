"use client";
import { motion, useReducedMotion } from "framer-motion";
import { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends HTMLAttributes<HTMLDivElement> { children: ReactNode; }

export default function MotionCard({ children, className, ...rest }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -2 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn("card-hover", className)}
      {...(rest as any)}
    >
      {children}
    </motion.div>
  );
}