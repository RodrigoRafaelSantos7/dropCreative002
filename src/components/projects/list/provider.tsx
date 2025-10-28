"use client";

import { useEffect } from "react";
import { fetchProjectsSuccess } from "@/redux/slices/projects";
import { useAppDispatch } from "@/redux/store";

type ProjectProviderProps = {
  children: React.ReactNode;
  initialProjects: any;
};

const ProjectProvider = ({
  children,
  initialProjects,
}: ProjectProviderProps) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (initialProjects?._valueJSON) {
      const projectsData = initialProjects._valueJSON;

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
