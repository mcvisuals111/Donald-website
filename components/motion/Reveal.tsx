"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

type DivProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Section reveal: children fade up 24px, staggered 60ms, once, when 20% of the
 * block has entered the viewport. Under prefers-reduced-motion this renders a
 * plain element and no animation is scheduled at all.
 */
export function Reveal({ className, children, ...props }: DivProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      data-reveal=""
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      {...(props as React.ComponentProps<typeof motion.div>)}
    >
      {children}
    </motion.div>
  );
}

type ItemTag = "div" | "li";

const MOTION_TAGS = { div: motion.div, li: motion.li } as const;

export function RevealItem({
  as = "div",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { as?: ItemTag }) {
  const reduced = useReducedMotion();

  if (reduced) {
    const Tag = as;
    return (
      <Tag className={cn(className)} {...props}>
        {children}
      </Tag>
    );
  }

  const MotionTag = MOTION_TAGS[as] as typeof motion.div;

  return (
    <MotionTag
      className={cn(className)}
      data-reveal=""
      variants={item}
      {...(props as React.ComponentProps<typeof motion.div>)}
    >
      {children}
    </MotionTag>
  );
}
