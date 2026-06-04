"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { useAuthStore } from "@synapse/core/auth";
import { captureDownloadIntent } from "@synapse/core/analytics";
import { useLocale } from "../i18n";
import {
  ClaudeCodeLogo,
  CodexLogo,
  GeminiCliLogo,
  OpenClawLogo,
  OpenCodeLogo,
  heroButtonClassName,
} from "./shared";

export function LandingHero() {
  const { t } = useLocale();
  const user = useAuthStore((s) => s.user);

  return (
    <div className="relative min-h-full overflow-hidden bg-[#080612] text-white">
      {/* ── Neural Bridge Background ── */}
      <NeuralBackdrop />

      <main className="relative z-10">
        <section
          id="product"
          className="mx-auto max-w-[1320px] px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pb-24 lg:pt-36"
        >
          <div className="mx-auto max-w-[1120px] text-center">
            {/* ── Gradient Headline: Human → Synapse → AI ── */}
            <h1 className="font-[family-name:var(--font-serif)] text-[3.65rem] leading-[0.93] tracking-[-0.038em] sm:text-[4.85rem] lg:text-[6.4rem]">
              <span className="animate-gradient-text">
                {t.hero.headlineLine1}
                <br />
                {t.hero.headlineLine2}
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-[820px] text-[15px] leading-7 text-white/78 sm:text-[17px]">
              {t.hero.subheading}
            </p>

            {/* ── CTAs with glow ring on primary ── */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={user ? "/" : "/login"}
                className={heroButtonClassName("solid")}
              >
                {user ? t.header.dashboard : t.hero.cta}
              </Link>
              <Link
                href="/download"
                className={heroButtonClassName("ghost")}
                onClick={() => captureDownloadIntent("landing_hero")}
              >
                <Download className="size-4" aria-hidden />
                {t.hero.downloadDesktop}
              </Link>
              <Link
                href="/contact-sales"
                className="group inline-flex items-center justify-center gap-1.5 rounded-[12px] px-3 py-3 text-[14px] font-semibold text-white/80 transition-colors hover:text-white"
              >
                {t.hero.talkToSales}
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </div>
          </div>

          {/* ── Works-with logos ── */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <span className="text-[15px] text-white/50">
              {t.hero.worksWith}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
              <div className="flex items-center gap-2.5 text-white/80">
                <ClaudeCodeLogo className="size-5" />
                <span className="text-[15px] font-medium">Claude Code</span>
              </div>
              <div className="flex items-center gap-2.5 text-white/80">
                <CodexLogo className="size-5" />
                <span className="text-[15px] font-medium">Codex</span>
              </div>
              <div className="flex items-center gap-2.5 text-white/80">
                <GeminiCliLogo className="size-5" />
                <span className="text-[15px] font-medium">Gemini CLI</span>
              </div>
              <div className="flex items-center gap-2.5 text-white/80">
                <OpenClawLogo className="size-5" />
                <span className="text-[15px] font-medium">OpenClaw</span>
              </div>
              <div className="flex items-center gap-2.5 text-white/80">
                <OpenCodeLogo className="size-5" />
                <span className="text-[15px] font-medium">OpenCode</span>
              </div>
            </div>
          </div>

          {/* ── Product preview with glow frame ── */}
          <div id="preview" className="mt-10 sm:mt-12">
            <ProductImage alt={t.hero.imageAlt} />
          </div>
        </section>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Neural Bridge Backdrop
   Deep space gradient + animated synapse core + floating particles
   ═══════════════════════════════════════════════════════════════ */
function NeuralBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Base gradient: deep violet-blue space */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 30%, oklch(0.25 0.08 290 / 35%) 0%, transparent 70%),
            radial-gradient(ellipse 40% 50% at 20% 80%, oklch(0.30 0.10 80 / 12%) 0%, transparent 60%),
            radial-gradient(ellipse 40% 50% at 80% 80%, oklch(0.25 0.10 255 / 12%) 0%, transparent 60%),
            linear-gradient(180deg, #080612 0%, oklch(0.12 0.02 280) 100%)
          `,
        }}
      />

      {/* Synapse core — glowing center node */}
      <div className="absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2">
        <div
          className="size-64 rounded-full animate-glow-ring opacity-50"
          style={{
            background: "radial-gradient(circle, oklch(0.55 0.25 298 / 30%) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Connection lines from synapse core */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.15]"
        viewBox="0 0 1200 800"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Human-side connections (gold, left) */}
        <path d="M600 280 Q400 350 200 500" stroke="oklch(0.72 0.18 88)" strokeWidth="0.5" strokeDasharray="4 8" />
        <path d="M600 280 Q350 450 150 650" stroke="oklch(0.68 0.18 88 / 60%)" strokeWidth="0.3" strokeDasharray="2 6" />
        {/* AI-side connections (blue, right) */}
        <path d="M600 280 Q800 350 1000 500" stroke="oklch(0.62 0.22 255)" strokeWidth="0.5" strokeDasharray="4 8" />
        <path d="M600 280 Q850 450 1050 650" stroke="oklch(0.58 0.22 255 / 60%)" strokeWidth="0.3" strokeDasharray="2 6" />
      </svg>

      {/* Floating neural particles */}
      <NeuralParticles />
    </div>
  );
}

function NeuralParticles() {
  const particles = [
    { left: "15%", top: "60%", size: 3, color: "oklch(0.72 0.18 88 / 60%)" },
    { left: "25%", top: "40%", size: 2, color: "oklch(0.65 0.18 88 / 40%)" },
    { left: "70%", top: "55%", size: 3, color: "oklch(0.62 0.22 255 / 60%)" },
    { left: "82%", top: "35%", size: 2, color: "oklch(0.58 0.22 255 / 40%)" },
    { left: "45%", top: "70%", size: 4, color: "oklch(0.55 0.25 298 / 50%)" },
    { left: "55%", top: "50%", size: 2, color: "oklch(0.55 0.22 298 / 40%)" },
    { left: "10%", top: "25%", size: 2, color: "oklch(0.70 0.18 88 / 30%)" },
    { left: "88%", top: "22%", size: 2, color: "oklch(0.60 0.22 255 / 30%)" },
  ];

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {particles.map((p, i) => (
        <div
          key={i}
          className={`absolute rounded-full animate-float-up animate-float-up-delay-${(i % 4) + 1}`}
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
}

function ProductImage({ alt }: { alt: string }) {
  return (
    <div>
      <div className="relative overflow-hidden rounded-lg border border-white/[0.08] shadow-[0_0_80px_oklch(0.55_0.25_298_/_8%)]">
        <Image
          src="/images/landing-hero.png"
          alt={alt}
          width={3532}
          height={2382}
          priority
          className="block h-auto w-full"
          sizes="(max-width: 1320px) 100vw, 1320px"
          quality={85}
        />
      </div>
    </div>
  );
}
