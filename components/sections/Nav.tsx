"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { NAV_LINKS, WORDMARK } from "@/lib/site";
import { buttonVariants } from "@/components/ui/button";

export function Nav() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled
          ? "border-b border-border bg-bg/75 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-4 px-5 sm:px-8"
      >
        <Link
          href="/"
          className="font-mono text-[0.5625rem] font-medium uppercase tracking-[0.16em] text-text xs:text-[0.6875rem] xs:tracking-[0.2em] sm:text-xs"
        >
          {WORDMARK}
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-md px-3 py-2 font-mono text-xs tracking-wide text-muted transition-colors hover:text-text"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="#book"
            className={cn(buttonVariants({ variant: "primary", size: "sm" }), "font-mono text-xs tracking-wide")}
          >
            Book a lesson
          </Link>
        </div>
      </nav>
    </header>
  );
}
