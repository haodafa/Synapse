"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CheckCircleIcon, InfoIcon, AlertTriangleIcon, XOctagonIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  // Use `resolvedTheme` (the concrete "light" / "dark" value) instead of
  // `theme` (which can be "system"). When we forward "system", sonner reads
  // `prefers-color-scheme` itself, and the Electron renderer's media query
  // can disagree with next-themes' `html.dark` class — that's why the toast
  // sometimes rendered light on a dark UI.
  const { resolvedTheme = "system" } = useTheme()

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CheckCircleIcon className="size-4 text-success" />
        ),
        info: (
          <InfoIcon className="size-4 text-info" />
        ),
        warning: (
          <AlertTriangleIcon className="size-4 text-warning" />
        ),
        error: (
          <XOctagonIcon className="size-4 text-destructive" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-brand" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
