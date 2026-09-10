"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Reveal-on-scroll wrapper. Content is server-rendered visible (SEO / no-JS);
// on the client the html gets `.js`, which hides `.reveal` elements and
// animates them in as they enter the viewport. Honors prefers-reduced-motion
// via CSS. `immediate` forces it visible right away (e.g. above the fold).
export default function Reveal({
  children,
  className = "",
  immediate = false,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  immediate?: boolean;
  as?: "div" | "section" | "span" | "article" | "h1" | "h2" | "h3" | "h4" | "p";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("js");
    const el = ref.current;
    if (!el) return;

    if (immediate || !("IntersectionObserver" in window)) {
      el.classList.add("in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [immediate]);

  return (
    <Tag ref={ref as never} className={`reveal${className ? ` ${className}` : ""}`}>
      {children}
    </Tag>
  );
}
