"use client";

import { useEffect } from "react";

/**
 * Opt-in registration component. Mount once in the root layout only after the
 * approved PWA icon set and production rollout decision are available.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      process.env.NEXT_PUBLIC_APP_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    const register = () => {
      void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        // Offline support is progressive enhancement; never interrupt the app.
      });
    };

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
