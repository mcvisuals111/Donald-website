import { cn } from "@/lib/utils";
import { RevealItem } from "@/components/motion/Reveal";

export function SectionHeading({
  id,
  title,
  sub,
  className,
}: {
  id: string;
  title: string;
  sub?: string;
  className?: string;
}) {
  return (
    <RevealItem className={cn("max-w-2xl", className)}>
      <h2
        id={`${id}-title`}
        className="text-[1.75rem] font-semibold tracking-[-0.015em] text-text sm:text-[2rem]"
      >
        {title}
      </h2>
      {sub ? (
        <p className="mt-3 text-pretty text-[0.9375rem] leading-relaxed text-muted sm:text-base">
          {sub}
        </p>
      ) : null}
    </RevealItem>
  );
}
