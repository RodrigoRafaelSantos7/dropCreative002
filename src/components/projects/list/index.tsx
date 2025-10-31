"use client";

import { formatDistanceToNow } from "date-fns";
import { FolderCodeIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useProjectCreation } from "@/hooks/use-project";
import { canvasPath, signInPath } from "@/paths";
import type { ProjectSummary } from "@/redux/slices/projects";
import { useAppSelector } from "@/redux/store";
import { EmptyProjectList } from "./empty-project-list";

const ProjectsList = () => {
  const router = useRouter();
  const { projects, canCreate } = useProjectCreation();
  const user = useAppSelector((state) => state.profile);

  useEffect(() => {
    if (!canCreate) {
      router.push(signInPath());
    }
  }, [canCreate, router]);

  if (!canCreate) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-3xl text-foreground">
            Your Projects
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your design projects and continue where you left off.
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <EmptyProjectList />
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {projects.map((project: ProjectSummary) => (
            <Link
              className="group cursor-pointer"
              href={canvasPath(user.name, project._id)}
              key={project._id}
            >
              <div className="space-y-3">
                <div className="aspect-4/3 overflow-hidden rounded-lg bg-muted">
                  {project.thumbnail ? (
                    <Image
                      alt={project.name}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      height={200}
                      src={project.thumbnail}
                      width={300}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
                      <FolderCodeIcon className="size-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="truncate font-medium text-foreground text-sm transition-colors group-hover:text-primary">
                    {project.name}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(project.lastModified), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export { ProjectsList };
