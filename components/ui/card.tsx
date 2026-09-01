import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Panel surface: 1px border, never a shadow. `tick-hover` flashes the border
 * to the up colour over 200ms, the way a price tick flashes on a quote board.
 */
export function Card({
  className,
  tickHover = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { tickHover?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-panel",
        tickHover &&
          "transition-colors duration-200 ease-out hover:border-accent focus-within:border-accent",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold tracking-tight text-text", className)}
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-[0.9375rem] leading-relaxed text-muted", className)}
      {...props}
    />
  );
}
