"use client";

import { MotionConfig } from "framer-motion";

export function Providers({ children }: { children: React.ReactNode }) {
  // Belt and braces: every animated component also checks useReducedMotion()
  // and renders its static form, so nothing animates when the user opts out.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
