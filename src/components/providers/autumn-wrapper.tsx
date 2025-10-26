"use client";

import { AutumnProvider } from "autumn-js/react";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";

export function AutumnWrapper({ children }: { children: React.ReactNode }) {
  const convex = useConvex();

  return (
    <AutumnProvider convex={convex} convexApi={api.autumn}>
      {children}
    </AutumnProvider>
  );
}
