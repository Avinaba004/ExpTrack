"use client"; // Added for Framer Motion
import React from "react";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/hero";
import Link from "next/link";
import { motion } from "framer-motion"; // Added for animations

// Removed unused imports: Card, Image, and all data from @/data/landing

export default function Home() {
  // Added this animation definition
  const sectionAnimation = {
    initial: { opacity: 0, y: 50 }, // Start invisible and 50px down
    whileInView: { opacity: 1, y: 0 }, // Animate to visible and original position
    viewport: { once: true }, // Only animate once
    transition: { duration: 0.6, ease: "easeInOut" }, // Smooth 0.6s transition
  };

  return (
    <div className="min-h-screen mt-21 bg-orange-100 ">
      <HeroSection />

      {/* Changed <section> to <motion.section> and spread animation props */}
      <motion.section
        className="container mx-auto px-4 py-5 md:py-10"
        {...sectionAnimation}
      >
        <div className="mx-5 rounded-2xl border bg-muted p-5 text-center md:p-10">
          <h2 className="text-3xl font-bold text-primary mb-4 max-w-2xl mx-auto">
            Ready to Take Control of Your Finances?
          </h2>

          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already managing their finances
            smarter with ExpTrack
          </p>

          <Link href="/dashboard">
            <Button size="lg" className="rounded-full animate-bounce">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
}