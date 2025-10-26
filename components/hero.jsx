"use client";
import { useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
// ADDED: Import motion from framer-motion
import { motion } from "framer-motion";
import {
  statsData,
  featuresData,
  howItWorksData,
  testimonialsData,
} from "@/data/landing"; // Adjust path as needed

export default function HomePage() {
  // Define a standard animation variant for sections
  const sectionAnimation = {
    initial: { opacity: 0, y: 50 }, // Start invisible and 50px down
    whileInView: { opacity: 1, y: 0 }, // Animate to visible and original position
    viewport: { once: true }, // Only animate once
    transition: { duration: 0.6, ease: "easeInOut" }, // Smooth 0.6s transition
  };

  return (
    // pt-16 ensures content starts below the fixed 4rem (h-16) header
    <main className="bg-background text-foreground">
      {/* Hero Section - We'll give this a simple fade-in on load */}
      <motion.section
        className="container mx-auto flex flex-col items-center px-4 py-20 text-center md:py-32"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
          Manage your Finances
          <br />
          with Intelligence
          <span className="text-primary"> AI</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          A smart expense tracking app that helps users manage and analyze
          their finances easily.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="rounded-full">
            <Link href="/sign-up">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full">
            <Link href="/demo">Get Demo</Link>
          </Button>
        </div>
      </motion.section>

      {/* Stats Section */}
      {/* CHANGED: <section> to <motion.section> and added animation props */}
      <motion.section
        className="bg-muted py-16 rounded-lg border"
        {...sectionAnimation} // Spread the animation props
      >
        <div className="container mx-auto grid grid-cols-2 gap-8 text-center md:grid-cols-4 ">
          {statsData.map((stat) => (
            <div key={stat.label}>
              <h3 className="text-3xl font-bold text-primary md:text-4xl">
                {stat.value}
              </h3>
              <p className="text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Features Section */}
      {/* CHANGED: <section> to <motion.section> and added animation props */}
      <motion.section
        className="container mx-auto px-4 py-20 md:py-32"
        {...sectionAnimation}
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need. Nothing you don't.
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Our app is packed with features powered by AI to help you take
            control of your finances.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuresData.map((feature) => (
            // Kept the hover/focus lift effect here
            <div
              key={feature.title}
              className="flex flex-col gap-4 rounded-lg border bg-card p-6 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg focus-within:-translate-y-1 focus-within:shadow-lg"
            >
              {feature.icon}
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* How It Works Section */}
      {/* CHANGED: <section> to <motion.section> and added animation props */}
      <motion.section
        className="bg-muted py-20 md:py-32"
        {...sectionAnimation}
      >
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Get started in 3 simple steps
            </h2>
          </div>
          <div className="relative mt-16 grid gap-12 md:grid-cols-3">
            {/* Dashed line connecting steps (visible on desktop) */}
            <div className="absolute top-1/2 left-0 hidden w-full -translate-y-1/2 md:block">
              <svg
                className="w-full"
                height="2"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line
                  x1="0"
                  y1="1"
                  x2="100%"
                  y2="1"
                  strokeWidth="2"
                  stroke="hsl(var(--border))"
                  strokeDasharray="8 8"
                />
              </svg>
            </div>
            {howItWorksData.map((step) => (
              <div
                key={step.title}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-primary bg-background">
                  {step.icon}
                </div>
                <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      {/* CHANGED: <section> to <motion.section> and added animation props */}
      <motion.section
        className="container mx-auto px-4 py-20 md:py-32"
        {...sectionAnimation}
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Trusted by users worldwide
          </h2>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {testimonialsData.map((testimonial) => (
            // Kept the hover/focus lift effect here
            <div
              key={testimonial.name}
              className="flex flex-col justify-between rounded-lg border bg-card p-6 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg focus-within:-translate-y-1 focus-within:shadow-lg"
            >
              <blockquote className="text-lg italic text-foreground font-serif">
                "{testimonial.quote}"
              </blockquote>
              <footer className="mt-6 flex items-center gap-4">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </footer>
            </div>
          ))}
        </div>
      </motion.section>
    </main>
  );
}