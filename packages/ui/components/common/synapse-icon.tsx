import { useState, useEffect } from "react";
import { cn } from "../../lib/utils";

interface SynapseIconProps extends React.ComponentProps<"span"> {
  animate?: boolean;
  noSpin?: boolean;
  bordered?: boolean;
  size?: "sm" | "md" | "lg";
}

const borderedSizes = {
  sm: { wrapper: "p-1.5", icon: "size-3.5" },
  md: { wrapper: "p-2", icon: "size-4" },
  lg: { wrapper: "p-2.5", icon: "size-5" },
};

/**
 * Synapse Neural Bridge icon.
 *
 * Visual metaphor: a central glowing node (the synapse) bridging
 * human intelligence (warm gold, left arc) and AI (electric blue, right arc).
 * The radiating nodes pulse with activity when animated.
 */
export function SynapseIcon({
  className,
  animate = false,
  noSpin = false,
  bordered = false,
  size = "sm",
  ...props
}: SynapseIconProps) {
  const [entranceDone, setEntranceDone] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => setEntranceDone(true), 800);
    return () => clearTimeout(timer);
  }, [animate]);

  const icon = (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "size-full",
        !entranceDone && "animate-entrance-spin",
        entranceDone && !noSpin && "hover:animate-[spin_3s_linear_infinite]"
      )}
    >
      <defs>
        <linearGradient id="sg-human" x1="0" y1="16" x2="16" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.72 0.18 88)" />
          <stop offset="1" stopColor="oklch(0.55 0.22 298)" />
        </linearGradient>
        <linearGradient id="sg-ai" x1="32" y1="16" x2="16" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.62 0.22 255)" />
          <stop offset="1" stopColor="oklch(0.55 0.22 298)" />
        </linearGradient>
        <radialGradient id="sg-core" cx="16" cy="16" r="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.65 0.25 298)" />
          <stop offset="1" stopColor="oklch(0.45 0.20 298)" />
        </radialGradient>
      </defs>

      {/* Human arc — warm gold (left side) */}
      <path
        d="M16 4 C10 4 4 9 4 16 C4 20 7 23 10 24"
        stroke="url(#sg-human)"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="10" cy="8" r="1.5" fill="oklch(0.72 0.18 88)" opacity="0.8" />
      <circle cx="6" cy="14" r="1" fill="oklch(0.68 0.18 88)" opacity="0.6" />

      {/* AI arc — electric blue (right side) */}
      <path
        d="M16 4 C22 4 28 9 28 16 C28 20 25 23 22 24"
        stroke="url(#sg-ai)"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="22" cy="8" r="1.5" fill="oklch(0.62 0.22 255)" opacity="0.8" />
      <circle cx="26" cy="14" r="1" fill="oklch(0.58 0.22 255)" opacity="0.6" />

      {/* Synapse core — glowing center node */}
      <circle cx="16" cy="16" r="5.5" fill="url(#sg-core)" />
      <circle cx="16" cy="16" r="3" fill="oklch(0.75 0.20 298 / 60%)" />

      {/* Connection lines from core to arcs */}
      <line x1="16" y1="12" x2="16" y2="4" stroke="oklch(0.60 0.22 298)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="16" x2="6" y2="14" stroke="oklch(0.65 0.20 298 / 60%)" strokeWidth="1" strokeLinecap="round" />
      <line x1="20" y1="16" x2="26" y2="14" stroke="oklch(0.65 0.20 298 / 60%)" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );

  if (bordered) {
    const sizeConfig = borderedSizes[size];
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center border border-border rounded-md bg-background",
          sizeConfig.wrapper,
          className
        )}
        aria-hidden="true"
        {...props}
      >
        <span className={sizeConfig.icon}>{icon}</span>
      </span>
    );
  }

  return (
    <span
      className={cn("inline-block size-[1em]", className)}
      aria-hidden="true"
      {...props}
    >
      {icon}
    </span>
  );
}
