"use client";

import type { Preloaded } from "convex/react";
import { useEffect } from "react";
import type { api } from "@/convex/_generated/api";
import type { ProjectSummary } from "@/redux/slices/projects";
import { fetchProjectsSuccess } from "@/redux/slices/projects";
import { useAppDispatch } from "@/redux/store";

type ProjectProviderProps = {
  children: React.ReactNode;
  initialProjects: Preloaded<typeof api.projects.getUserProjects>;
};

const ProjectProvider = ({
  children,
  initialProjects,
}: ProjectProviderProps) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (initialProjects?._valueJSON) {
      const projectsData =
        initialProjects._valueJSON as unknown as ProjectSummary[];

      dispatch(
        fetchProjectsSuccess({
          projects: projectsData,
          total: projectsData.length,
        })
      );
    }
  }, [initialProjects, dispatch]);

  return <div>{children}</div>;
};

export default ProjectProvider;
