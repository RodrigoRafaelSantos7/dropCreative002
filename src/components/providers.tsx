import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { AutumnWrapper } from "@/components/autumn/autumn-wrapper";
import { ConvexClientProvider } from "@/components/convex/convex-client-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";

const Providers = ({ children }: { children: ReactNode }) => (
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    disableTransitionOnChange
    enableSystem
    storageKey="dropCreative-theme"
  >
    <ConvexClientProvider>
      <AutumnWrapper>
        {children}
        <Toaster richColors />
      </AutumnWrapper>
    </ConvexClientProvider>
  </ThemeProvider>
);

export default Providers;
