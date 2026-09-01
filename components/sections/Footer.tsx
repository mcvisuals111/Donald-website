import Link from "next/link";
import {
  CONTACT_EMAIL,
  FOOTER_DISCLOSURE,
  LEGAL_LINKS,
  NAV_LINKS,
  WORDMARK,
} from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-28 border-t border-border sm:mt-32">
      <div className="mx-auto w-full max-w-[1120px] px-5 py-12 sm:px-8 sm:py-14">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div>
            <Link
              href="/"
              className="font-mono text-[0.5625rem] font-medium uppercase tracking-[0.16em] text-text xs:text-[0.6875rem] xs:tracking-[0.2em] sm:text-xs"
            >
              {WORDMARK}
            </Link>
            <p className="mt-4">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-mono text-xs text-muted transition-colors hover:text-text"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>

          <div className="flex gap-12 sm:gap-16">
            <nav aria-label="Sections">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                Site
              </h2>
              <ul className="mt-4 space-y-2.5">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={`/${link.href}`}
                      className="font-mono text-xs text-muted transition-colors hover:text-text"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Legal">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                Legal
              </h2>
              <ul className="mt-4 space-y-2.5">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-mono text-xs text-muted transition-colors hover:text-text"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <p className="mt-12 max-w-3xl border-t border-border pt-6 font-mono text-[11px] leading-[1.7] text-muted">
          {FOOTER_DISCLOSURE}
        </p>
      </div>
    </footer>
  );
}
