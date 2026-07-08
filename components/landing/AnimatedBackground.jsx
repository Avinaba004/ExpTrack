"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

export function AnimatedBackground() {
  const prefersReducedMotion = useReducedMotion();

  const blobs = useMemo(
    () => [
      { className: "-top-16 left-0 h-72 w-72 bg-fuchsia-500/20 blur-3xl", delay: 0 },
      { className: "right-0 top-20 h-80 w-80 bg-violet-500/20 blur-3xl", delay: 0.4 },
      { className: "bottom-0 left-1/3 h-96 w-96 bg-cyan-500/15 blur-3xl", delay: 0.8 },
    ],
    []
  );

  if (prefersReducedMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {blobs.map((blob, index) => (
        <motion.div
          key={index}
          className={`absolute ${blob.className}`}
          animate={{ y: [0, -24, 0], x: [0, 18, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 10 + index * 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
