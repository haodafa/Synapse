// Side-effect import: pulls the i18next module augmentation into the
// compilation graph. Without this, apps that consume @synapse/views won't
// see the resources types or the selector-API enablement, and their
// typecheck would reject `t($ => $.foo.bar)` calls inside views.
import "./resources-types";

import { useTranslation } from "react-i18next";
import type { TFunction, i18n } from "i18next";
import { useCallback, useMemo } from "react";

/**
 * Execute the selector function against a proxy to extract the key path.
 * The first segment is stripped (it's the parameter name like `$`).
 * Example: `$ => $.signin.title` → "signin.title"
 * Example: `$ => $.common.email_placeholder` → "common.email_placeholder"
 */
function resolveSelectorKey(fn: (proxy: any) => any): string {
  const path: string[] = [];
  const proxy = new Proxy({} as Record<string, any>, {
    get(_target, prop: string) {
      path.push(prop);
      return proxy;
    },
  });
  try {
    fn(proxy);
  } catch {
    // ignore — path built before throw
  }
  // Proxy captures property accesses, so the path IS the key path.
  // No need to strip anything — the function parameter ($) is never
  // captured by the Proxy; only property accesses on it are.
  return path.join(".");
}

/**
 * Enhanced useTranslation that uses Proxy-based selector resolution.
 * Works identically to react-i18next's selector-based `t` but executes
 * the selector function against a Proxy to extract the key path,
 * avoiding source-code parsing that breaks under minification or SSR.
 */
export function useT(defaultNs?: string | string[]) {
  const { t: baseT, i18n, ready } = useTranslation(defaultNs);

  const t = useCallback(
    (key: string | ((proxy: any) => any)) => {
      if (typeof key === "function") {
        const resolvedKey = resolveSelectorKey(key);
        return baseT(resolvedKey);
      }
      return baseT(key);
    },
    [baseT],
  );

  return useMemo(() => ({ t, i18n, ready }), [t, i18n, ready]);
}
