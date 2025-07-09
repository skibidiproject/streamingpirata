// app/_components/ScrollToAnchor.tsx
"use client";

import { useEffect } from "react";

export default function ScrollToAnchor() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Attendi un attimo per assicurarti che il DOM sia renderizzato
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 750); // delay opzionale
    }
  }, []);

  return null;
}
