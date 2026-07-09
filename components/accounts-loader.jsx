"use client";

import React from "react";
import { motion } from "framer-motion";

export function AccountsLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 w-full">
      {/* Circular Spinning Particles Loader only */}
      <div className="relative w-16 h-16">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-violet-500"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              delay: i * 0.13,
              ease: "linear",
            }}
            style={{
              left: "50%",
              top: "50%",
              marginLeft: "-5px",
              marginTop: "-5px",
              transformOrigin: `5px ${28 - 5}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
