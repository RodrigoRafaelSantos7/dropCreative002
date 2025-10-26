import type { ReactNode } from "react";
import { AutumnWrapper } from "@/components/providers/autumn-wrapper";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";

const Providers = ({ children }: { children: ReactNode }) => (
  <ConvexClientProvider>
    <AutumnWrapper>{children}</AutumnWrapper>
  </ConvexClientProvider>
);

export default Providers;
