"use client";

import { useEffect, useRef } from "react";

export function CodeBlockWrapper({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const pres = containerRef.current.querySelectorAll("pre");
    const cleanups: (() => void)[] = [];

    pres.forEach((pre) => {
      if (pre.querySelector("[data-copy-btn]")) return;

      pre.style.position = "relative";

      const btn = document.createElement("button");
      btn.setAttribute("data-copy-btn", "");
      btn.setAttribute("aria-label", "Copy to clipboard");
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;

      Object.assign(btn.style, {
        position: "absolute",
        top: "8px",
        right: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "32px",
        height: "32px",
        borderRadius: "6px",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.05)",
        color: "rgba(148,163,184,0.8)",
        cursor: "pointer",
        opacity: "0",
        transition: "opacity 150ms, background 150ms, color 150ms",
        backdropFilter: "blur(4px)",
      });

      const showBtn = () => { btn.style.opacity = "1"; };
      const hideBtn = () => { btn.style.opacity = "0"; };
      pre.addEventListener("mouseenter", showBtn);
      pre.addEventListener("mouseleave", hideBtn);

      btn.addEventListener("mouseenter", () => {
        btn.style.background = "rgba(255,255,255,0.1)";
        btn.style.color = "rgba(226,232,240,1)";
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.background = "rgba(255,255,255,0.05)";
        btn.style.color = "rgba(148,163,184,0.8)";
      });

      const checkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
      const copySvg = btn.innerHTML;

      btn.addEventListener("click", async () => {
        const text = pre.textContent || "";
        await navigator.clipboard.writeText(text);
        btn.innerHTML = checkSvg;
        btn.style.color = "rgba(74,222,128,1)";
        setTimeout(() => {
          btn.innerHTML = copySvg;
          btn.style.color = "rgba(148,163,184,0.8)";
        }, 2000);
      });

      pre.appendChild(btn);

      cleanups.push(() => {
        pre.removeEventListener("mouseenter", showBtn);
        pre.removeEventListener("mouseleave", hideBtn);
        btn.remove();
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
