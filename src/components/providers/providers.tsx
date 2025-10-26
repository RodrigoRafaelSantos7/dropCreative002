import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { AutumnWrapper } from "@/components/providers/autumn-wrapper";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

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
