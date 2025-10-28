import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { AutumnWrapper } from "@/components/autumn/autumn-wrapper";
import { ConvexClientProvider } from "@/components/convex/convex-client-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import ReduxProvider from "@/redux/provider";
import type { RootState } from "@/redux/store";

type ProvidersProps = {
  children: ReactNode;
  profile?: Partial<RootState>;
};

const Providers = ({ children, profile }: ProvidersProps) => (
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    disableTransitionOnChange
    enableSystem
    storageKey="dropCreative-theme"
  >
    <ConvexClientProvider>
      <AutumnWrapper>
        <ReduxProvider preloadedState={{ profile }}>
          {children}
          <Toaster richColors />
        </ReduxProvider>
      </AutumnWrapper>
    </ConvexClientProvider>
  </ThemeProvider>
);

export default Providers;
