"use client";

import { useEffect } from "react";

// Phones report the on-screen keyboard through window.visualViewport. While the
// keyboard is up, this sets --kb (its height) and --vvh (the visible height) on
// <html> and adds the "kb-open" class, so the message bar can sit right on top
// of the keyboard. Everything is removed again when the chat page closes.
export function useKeyboardInset() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const root = document.documentElement;

    const update = () => {
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      if (kb > 100) {
        root.style.setProperty("--kb", `${kb}px`);
        root.style.setProperty("--vvh", `${vv.height}px`);
        root.classList.add("kb-open");
      } else {
        root.style.removeProperty("--kb");
        root.style.removeProperty("--vvh");
        root.classList.remove("kb-open");
      }
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      root.style.removeProperty("--kb");
      root.style.removeProperty("--vvh");
      root.classList.remove("kb-open");
    };
  }, []);
}
