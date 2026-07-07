"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/hero";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-12 pb-20">
      <HeroSection />

      <section className="container mx-auto px-4 py-5 md:py-10">
        <div className="mx-5 rounded-3xl border border-border/45 bg-card/60 backdrop-blur-sm p-6 text-center md:p-12 shadow-sm">
          <h2 className="text-3xl font-bold text-primary mb-4 max-w-2xl mx-auto">
            Ready to Take Control of Your Finances?
          </h2>

          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already managing their finances
            smarter with ExpTrack.
          </p>

          <Link href="/dashboard">
            <Button size="lg" className="rounded-full font-semibold px-8 shadow-sm">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
