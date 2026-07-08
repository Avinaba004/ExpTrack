"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageTransitionLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const initialMount = useRef(true);

  useEffect(() => {
    if (!pathname) return;
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }

    setIsLoading(true);
    const timeout = window.setTimeout(() => setIsLoading(false), 450);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-md"
        >
          <div className="flex flex-col items-center gap-6">
            {/* Animated Particles Loader */}
            <div className="relative w-16 h-16">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-violet-500"
                  animate={{
                    rotate: 360,
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                  style={{
                    left: "50%",
                    top: "50%",
                    transformOrigin: "24px 24px",
                  }}
                />
              ))}
            </div>

            {/* Loading Text with Gradient */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">Loading</span>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex gap-1"
              >
                <span className="w-1 h-1 rounded-full bg-primary" />
                <span className="w-1 h-1 rounded-full bg-primary" />
                <span className="w-1 h-1 rounded-full bg-primary" />
              </motion.div>
            </div>

            {/* Progress Bar */}
            <div className="w-32 h-1 rounded-full bg-muted/50 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
