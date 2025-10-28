import { HashIcon, LayoutIcon, type LucideIcon, TypeIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LayoutProps = {
  children: React.ReactNode;
};

type TabProps = {
  value: string;
  label: string;
  icon: LucideIcon;
};

const tabs: TabProps[] = [
  {
    value: "colours",
    label: "Colours",
    icon: HashIcon,
  },
  {
    value: "typography",
    label: "Typography",
    icon: TypeIcon,
  },
  {
    value: "moodboard",
    label: "Moodboard",
    icon: LayoutIcon,
  },
] as const;

const Layout = ({ children }: LayoutProps) => (
  <Tabs className="w-full px-2" defaultValue={tabs[0].value}>
    <div className="container mx-auto mt-36 py-6 sm:px-6 sm:py-8">
      <div>
        <div className="flex flex-col items-center justify-between gap-4 lg:flex-row lg:gap-5">
          <div>
            <h1 className="text-center font-bold text-3xl text-foreground lg:text-left">
              Style Guide
            </h1>
            <p className="mt-2 text-center text-muted-foreground lg:text-left">
              Manage your style guide for your project.
            </p>
          </div>
          <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-full border border-white/12 bg-white/8 p-2 saturate-150 backdrop-blur-xl sm:w-fit">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  className="flex items-center gap-2 rounded-xl text-xs transition-all duration-200 data-[state=active]:border data-[state=active]:border-white/2 data-[state=active]:bg-white/15 data-[state=active]:backdrop-blur-xl sm:text-sm"
                  key={tab.value}
                  value={tab.value}
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.value}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
      </div>
    </div>
    <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8">
      {children}
    </div>
  </Tabs>
);

export default Layout;
