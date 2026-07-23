"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registration failing (e.g. unsupported browser) shouldn't break
        // the app — the PWA install prompt just won't be offered.
      });
    }
  }, []);

  return null;
}
