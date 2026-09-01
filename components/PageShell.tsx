import Link from "next/link";
import { cn } from "@/lib/utils";

/** Shared frame for the standalone pages: legal, checkout success and cancel. */
export function PageShell({
  eyebrow,
  title,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[720px] px-5 pb-8 pt-32 sm:px-8 sm:pt-40", className)}>
      {eyebrow ? (
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-4 text-[1.875rem] font-semibold tracking-[-0.015em] text-text sm:text-[2.25rem]">
        {title}
      </h1>
      <div className="mt-8 space-y-5 text-[0.9375rem] leading-relaxed text-muted">
        {children}
      </div>
      <p className="mt-12">
        <Link
          href="/"
          className="font-mono text-xs text-muted transition-colors hover:text-text"
        >
          ← Back to the site
        </Link>
      </p>
    </div>
  );
}

export function LegalHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="pt-4 font-mono text-xs uppercase tracking-[0.2em] text-text">
      {children}
    </h2>
  );
}
