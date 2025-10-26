import type { ReactNode } from "react";
import { ConvexClientProvider } from "@/components/convex-client-provider";

const Providers = ({ children }: { children: ReactNode }) => (
  <ConvexClientProvider>{children}</ConvexClientProvider>
);

export default Providers;
