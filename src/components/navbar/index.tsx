"use client";

import { useQuery } from "convex/react";
import {
  CircleQuestionMarkIcon,
  HashIcon,
  LayoutTemplateIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { canvasPath, dashboardPath, styleGuidePath } from "@/paths";
import { useAppSelector } from "@/redux/store";
import { CreateProject } from "../buttons/project";

type TabProps = {
  label: string;
  href: string;
  icon: React.ReactNode;
};
const Navbar = () => {
  const params = useSearchParams();
  const projectId = params.get("project");

  const me = useAppSelector((state) => state.profile);

  const project = useQuery(
    api.projects.getProject,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip"
  );

  const tabs: TabProps[] = [
    {
      label: "Canvas",
      href: canvasPath(me.name, project?._id ?? ""),
      icon: <HashIcon className="size-4" />,
    },
    {
      label: "Style Guide",
      href: styleGuidePath(me.name, project?._id ?? ""),
      icon: <LayoutTemplateIcon className="size-4" />,
    },
  ];

  const pathname = usePathname();
  const hasCanvas = pathname.includes("canvas");
  const hasStyleGuide = pathname.includes("style-guide");
  const pathnameWithProject = `${pathname}?project=${projectId}`;
  return (
    <nav className="fixed top-0 right-0 left-0 z-50 grid grid-cols-2 p-6 lg:grid-cols-3">
      <div className="flex items-center gap-4">
        <Link
          className="flex size-8 items-center justify-center rounded-full border-3 border-white bg-black"
          href={dashboardPath(me.name)}
        >
          <div className="size-4 rounded-full bg-white" />
        </Link>

        {!hasCanvas ||
          (!hasStyleGuide && (
            <div className="hidden rounded-full border border-white/12 bg-white/8 px-4 py-2 text-primary/60 text-sm saturate-150 backdrop-blur-xl lg:inline-block">
              Project / {project?.name}
            </div>
          ))}
      </div>

      <div className="hidden items-center justify-center gap-2 lg:flex">
        <div className="flex items-center gap-2 rounded-full border border-white/12 bg-white/8 p-2 saturate-150 backdrop-blur-xl">
          {tabs.map((tab) => (
            <Link
              className={cn(
                "group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition",
                pathnameWithProject === tab.href
                  ? "border border-white/16 bg-white/12 text-white backdrop-blur-sm"
                  : "border border-transparent text-zinc-400 hover:bg-white/6 hover:text-zinc-200"
              )}
              href={tab.href}
              key={tab.href}
            >
              <span
                className={cn(
                  "",
                  pathnameWithProject === tab.href
                    ? "opacity-100"
                    : "opacity-70 group-hover:opacity-90"
                )}
              >
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        <span className="text-sm text-white/50">TODO: Credits</span>
        <Button
          className="flex size-12 items-center justify-center rounded-full border border-white/12 bg-white/8 saturate-150 backdrop-blur-xl hover:bg-white/12"
          variant="secondary"
        >
          <CircleQuestionMarkIcon className="size-5 text-white" />
        </Button>
        <Avatar className="ml-2 size-12">
          <AvatarImage
            referrerPolicy="no-referrer"
            src={me.image || `https://avatar.vercel.sh/${me.name}`}
          />
          <AvatarFallback>
            <UserIcon className="size-5 text-black" />
          </AvatarFallback>
        </Avatar>

        {!(hasCanvas || hasStyleGuide) && <CreateProject />}
      </div>
    </nav>
  );
};

export default Navbar;
