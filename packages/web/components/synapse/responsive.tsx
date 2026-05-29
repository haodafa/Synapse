import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export interface ResponsiveValue<T> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  "2xl"?: T;
  default?: T;
}

const BREAKPOINT_WIDTHS: Record<Breakpoint, number> = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

interface ResponsiveContextValue {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

const ResponsiveContext = createContext<ResponsiveContextValue>({
  breakpoint: "lg",
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  width: 1280,
  height: 800,
});

export function useResponsive(): ResponsiveContextValue {
  return useContext(ResponsiveContext);
}

export function useBreakpoint(): Breakpoint {
  const { breakpoint } = useResponsive();
  return breakpoint;
}

export function useIsMobile(): boolean {
  const { isMobile } = useResponsive();
  return isMobile;
}

export function useIsTablet(): boolean {
  const { isTablet } = useResponsive();
  return isTablet;
}

export function useIsDesktop(): boolean {
  const { isDesktop } = useResponsive();
  return isDesktop;
}

function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINT_WIDTHS["2xl"]) return "2xl";
  if (width >= BREAKPOINT_WIDTHS.xl) return "xl";
  if (width >= BREAKPOINT_WIDTHS.lg) return "lg";
  if (width >= BREAKPOINT_WIDTHS.md) return "md";
  if (width >= BREAKPOINT_WIDTHS.sm) return "sm";
  return "xs";
}

interface ResponsiveProviderProps {
  children: ReactNode;
}

export function ResponsiveProvider({ children }: ResponsiveProviderProps) {
  const [dimensions, setDimensions] = useState({ width: 1280, height: 800 });

  useEffect(() => {
    function updateDimensions() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const breakpoint = getBreakpoint(dimensions.width);
  const isMobile = breakpoint === "xs" || breakpoint === "sm";
  const isTablet = breakpoint === "md" || breakpoint === "lg";
  const isDesktop = breakpoint === "xl" || breakpoint === "2xl";

  return (
    <ResponsiveContext.Provider
      value={{
        breakpoint,
        isMobile,
        isTablet,
        isDesktop,
        width: dimensions.width,
        height: dimensions.height,
      }}
    >
      {children}
    </ResponsiveContext.Provider>
  );
}

export function getResponsiveValue<T>(values: ResponsiveValue<T>, breakpoint: Breakpoint): T | undefined {
  if (values[breakpoint] !== undefined) return values[breakpoint];
  if (values.default !== undefined) return values.default;
  
  const breakpoints: Breakpoint[] = ["2xl", "xl", "lg", "md", "sm", "xs"];
  const currentIndex = breakpoints.indexOf(breakpoint);
  
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (values[breakpoints[i]] !== undefined) {
      return values[breakpoints[i]];
    }
  }
  
  return values.default;
}

export interface A11yConfig {
  announceChanges: boolean;
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
}

const A11yContext = createContext<A11yConfig>({
  announceChanges: true,
  reduceMotion: false,
  highContrast: false,
  largeText: false,
});

export function useA11y(): A11yConfig {
  return useContext(A11yContext);
}

interface A11yProviderProps {
  children: ReactNode;
  config?: Partial<A11yConfig>;
}

export function A11yProvider({ children, config }: A11yProviderProps) {
  const [a11yConfig, setA11yConfig] = useState<A11yConfig>({
    announceChanges: true,
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    ...config,
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setA11yConfig((prev) => ({ ...prev, reduceMotion: mediaQuery.matches }));

    const handleChange = (e: MediaQueryListEvent) => {
      setA11yConfig((prev) => ({ ...prev, reduceMotion: e.matches }));
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <A11yContext.Provider value={a11yConfig}>
      {children}
    </A11yContext.Provider>
  );
}

export function announceToScreenReader(message: string, priority: "polite" | "assertive" = "polite"): void {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
}

interface FocusTrapProps {
  children: ReactNode;
  enabled?: boolean;
}

export function FocusTrap({ children, enabled = true }: FocusTrapProps): JSX.Element {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    }

    container.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();

    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);

  return (
    <div ref={containerRef} data-focus-trap="true">
      {children}
    </div>
  );
}

export function SkipLink({ targetId, children }: { targetId: string; children?: ReactNode }): JSX.Element {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
    >
      {children ?? "Skip to main content"}
    </a>
  );
}

export function LiveRegion({ message, priority = "polite" }: { message: string; priority?: "polite" | "assertive" }): null {
  const [announcement, setAnnouncement] = React.useState("");

  useEffect(() => {
    if (message) {
      setAnnouncement("");
      requestAnimationFrame(() => setAnnouncement(message));
    }
  }, [message]);

  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}

export function withReducedMotion<T extends object>(
  WrappedComponent: React.ComponentType<T>
): React.ComponentType<T> {
  return function ReducedMotionComponent(props: T) {
    const { reduceMotion } = useA11y();

    if (reduceMotion) {
      return <WrappedComponent {...props} />;
    }

    return <WrappedComponent {...props} />;
  };
}

export function getTabIndex(isDisabled: boolean, isHidden: boolean): number {
  if (isDisabled || isHidden) return -1;
  return 0;
}

export function generateId(prefix: string = "id"): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}
