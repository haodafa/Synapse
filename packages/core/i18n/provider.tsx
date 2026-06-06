"use client";

import { useMemo, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { createI18n } from "./create-i18n";
import type { LocaleResources, SupportedLocale } from "./types";

export interface I18nProviderProps {
  locale: SupportedLocale;
  resources: Record<string, LocaleResources>;
  children: ReactNode;
}

export function I18nProvider({
  locale,
  resources,
  children,
}: I18nProviderProps) {
  // Re-create i18n whenever locale/resources change. At runtime these are
  // stable — language switching goes through window.location.reload().
  // useMemo is used instead of useState to guarantee the instance matches
  // the current props on both server and client renders.
  const instance = useMemo(
    () => createI18n(locale, resources),
    [locale, resources],
  );
  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
