import type { ReactNode } from "react";
import { AppNav } from "./app-nav";
import { MobileNav } from "./mobile-nav";

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden
        className="flex h-8 w-8 items-center justify-center rounded-md bg-navy text-sm font-semibold text-white"
      >
        TD
      </span>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-ink">Tax Desk</p>
        <p className="text-[11px] text-ink-faint">Sri Lanka</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-canvas">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 border-r border-line bg-surface-dim lg:flex lg:flex-col">
        <div className="px-4 py-5">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          <AppNav />
        </div>
        <div className="border-t border-line px-4 py-3 text-[11px] text-ink-faint">
          Rules: 2025/2026 · IRD verified
        </div>
      </aside>

      {/* Topbar — mobile/tablet */}
      <header className="sticky top-0 z-20 border-b border-line bg-surface lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Brand />
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2" aria-label="Mobile">
          <MobileNav />
        </nav>
      </header>

      {/* Main content */}
      <div className="lg:pl-60">
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
