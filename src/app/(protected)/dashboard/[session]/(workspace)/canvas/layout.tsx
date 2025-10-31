import { Toolbar } from "@/components/canvas/toolbar";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => (
  <div className="h-full w-screen">
    {children}
    <Toolbar />
  </div>
);

export default Layout;
