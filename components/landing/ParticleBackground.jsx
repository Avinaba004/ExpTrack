"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Three components to avoid SSR issues
const Canvas = dynamic(() => import("@react-three/fiber").then((mod) => mod.Canvas), { ssr: false });
const ParticlesScene = dynamic(() => import("./ParticlesScene"), { ssr: false });

export function ParticleBackground() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  if (!mounted) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-background/50 via-background to-background/50 pointer-events-none" />
    );
  }

  if (prefersReducedMotion) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-background/50 via-background to-background/50 pointer-events-none" />
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Suspense fallback={<div className="absolute inset-0 bg-background" />}>
        <Canvas
          gl={{ alpha: true, antialias: true }}
          camera={{ position: [0, 0, 1], fov: 75 }}
          style={{ width: "100%", height: "100%" }}
        >
          <ParticlesScene />
        </Canvas>
      </Suspense>
    </div>
  );
}
