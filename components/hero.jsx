"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Bot, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { FeatureCard } from "./landing/FeatureCard";
import { SectionHeading } from "./landing/SectionHeading";
import { ParticleBackground } from "./landing/ParticleBackground";
import {
  faqs,
  featuresData,
  highlightCards,
  howItWorksData,
  pricingPlans,
  statsData,
  testimonialsData,
  whyExpTrack,
} from "@/data/landing";

export default function HeroSection() {
  const reveal = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.55, ease: "easeOut" },
  };

  return (
    <main className="relative overflow-hidden bg-[#fcfcfc] dark:bg-zinc-950 text-foreground">
      <ParticleBackground />

      <section className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-4 pb-20 pt-15 sm:px-6 lg:px-8 lg:pt-28">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur">
            <Sparkles className="h-4 w-4" />
            Premium planning for modern money habits
          </div>

          <h1 className="mt-8 text-2xl font-semibold tracking-tight sm:text-2xl lg:text-6xl">
            A finance workspace that turns every spend into a smarter decision.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            ExpTrack blends realtime budget insight, automated alerts, and receipt intelligence into one polished experience.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full px-6">
              <Link href="/sign-up">
                Start free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-6">
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="relative mt-14 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease: "easeOut" }}
        >
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/10 p-6 shadow-[0_30px_120px_-40px_rgba(91,33,182,0.65)] backdrop-blur-xl sm:p-8">
            <motion.div
              className="absolute inset-x-0 top-0 h-40 rounded-b-[40px] bg-gradient-to-r from-purple-500/10 via-cyan-400/10 to-fuchsia-500/10"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: [0, 0.85, 0.85], y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-primary">Financial pulse</p>
                  <p className="mt-1 text-3xl font-semibold text-foreground">$4,280 left</p>
                </div>
                <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400">
                  +12% this month
                </div>
              </div>

              <div className="space-y-4">
                <motion.div
                  className="rounded-[28px] border border-white/10 bg-background/90 p-5 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.35)]"
                  animate={{ rotate: [0, 1.5, 0], x: [0, 6, 0], y: [0, -4, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Budget health</span>
                    <span className="text-emerald-300">Stable</span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-2 w-[68%] rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
                  </div>
                </motion.div>

                <motion.div
                  className="grid gap-4 sm:grid-cols-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.7, ease: "easeOut" }}
                >
                  {[
                    { label: "Budget", value: "$6,000" },
                    { label: "Spent", value: "$1,720" },
                    { label: "Alerts", value: "2 active" },
                  ].map((item) => (
                    <motion.div
                      key={item.label}
                      className="rounded-2xl border border-white/10 bg-background/50 p-4"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="mt-2 text-xl font-semibold text-foreground">{item.value}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <motion.div
                className="rounded-2xl border border-white/10 bg-background/60 p-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: [0, 1, 1], y: [12, 4, 12] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bot className="h-4 w-4 text-primary" />
                  AI summary: your spending is steady and travel is trending 18% above plan.
                </div>
              </motion.div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-[32px] border border-white/10 bg-slate-950/70 p-6 text-white shadow-[0_20px_90px_-40px_rgba(2,6,23,0.95)] backdrop-blur-xl sm:p-8">
            <div className="flex items-center gap-2 text-sm font-medium text-cyan-300">
              <Sparkles className="h-4 w-4" />
              Designed for focus
            </div>
            <div className="space-y-3">
              {highlightCards.map((card) => (
                <div key={card.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl bg-primary/15 p-2 text-primary">{card.icon}</div>
                    <div>
                      <h3 className="font-semibold text-white">{card.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{card.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <motion.section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8" {...reveal}>
        <div className="grid gap-4 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_90px_-45px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-background/50 p-4 text-center">
              <p className="text-3xl font-semibold text-foreground">{stat.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24" {...reveal}>
        <SectionHeading
          eyebrow="Core experience"
          title="A focused finance hub built for fast decisions."
          description="Insightful spending snapshots, email alerts, and clear action cards remove the noise from everyday money management."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuresData.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </motion.section>

      <motion.section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-16" {...reveal}>
        <div className="grid gap-8 rounded-[36px] border border-white/10 bg-gradient-to-br from-background/80 to-primary/5 p-8 shadow-[0_24px_90px_-40px_rgba(91,33,182,0.6)] backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
          <div>
            <SectionHeading
              centered={false}
              eyebrow="Workflow"
              title="From receipt to insight in a few calm steps."
              description="The experience stays intuitive whether you are logging an expense, adjusting a budget, or reviewing your portfolio trend."
            />
            <div className="mt-8 space-y-4">
              {howItWorksData.map((step) => (
                <div key={step.title} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">{step.icon}</div>
                  <div>
                    <h3 className="font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm leading-7 text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-950/80 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-300">Smart preview</p>
                <h3 className="mt-2 text-2xl font-semibold">Your monthly plan, always visible</h3>
              </div>
              <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary">Live</div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Budget health</span>
                  <span className="text-sm font-semibold text-emerald-300">Healthy</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-800">
                  <div className="h-2 w-[74%] rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Investment outlook</span>
                  <span className="font-semibold text-emerald-300">+8.2%</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-400">A balanced view of investments and daily expenses can help you stay calm during market shifts.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                  <span>Your budget alert is configured to notify you whenever you cross the threshold.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" {...reveal}>
        <SectionHeading
          eyebrow="Trusted by thoughtful users"
          title="People use ExpTrack to make steady progress without the noise."
          description="From students to founders, the experience is designed to stay useful and beautiful every step of the way."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {testimonialsData.map((testimonial) => (
            <div key={testimonial.name} className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_90px_-45px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <p className="text-lg leading-8 text-foreground">“{testimonial.quote}”</p>
              <div className="mt-6 flex items-center gap-4">
                <img src={testimonial.image} alt={testimonial.name} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" {...reveal}>
        <SectionHeading
          eyebrow="Pricing"
          title="Choose the rhythm that fits how you manage money."
          description="Start simple and unlock more automation and insight as your needs grow."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div key={plan.name} className={`rounded-[28px] border p-6 shadow-[0_20px_90px_-45px_rgba(0,0,0,0.5)] backdrop-blur-xl ${plan.featured ? "border-primary/30 bg-primary/10" : "border-white/10 bg-white/5"}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                {plan.featured ? <span className="rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary">Most popular</span> : null}
              </div>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{plan.description}</p>
              <p className="mt-6 text-4xl font-semibold text-foreground">{plan.price}</p>
              <p className="mt-2 text-sm text-muted-foreground">per month</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" {...reveal}>
        <div className="grid gap-8 rounded-[36px] border border-white/10 bg-background/70 p-8 shadow-[0_25px_100px_-45px_rgba(0,0,0,0.65)] backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
          <div>
            <SectionHeading
              centered={false}
              eyebrow="Why it stands out"
              title="Built to feel premium, practical, and personal."
              description="A thoughtful experience can make even everyday money tasks feel lighter and more intentional."
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {whyExpTrack.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-primary">{item.icon}<span className="font-medium text-foreground">{item.title}</span></div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="rounded-[28px] border border-white/10 bg-slate-950/80 p-6 text-white">
              <h3 className="text-2xl font-semibold">Frequently asked questions</h3>
              <div className="mt-6 space-y-3">
                {faqs.map((faq) => (
                  <details key={faq.question} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <summary className="cursor-pointer font-medium text-white">{faq.question}</summary>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

    </main>
  );
}
