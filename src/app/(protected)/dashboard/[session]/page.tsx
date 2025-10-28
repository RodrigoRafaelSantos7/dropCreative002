import { redirect } from "next/navigation";
import { ProjectsQuery } from "@/components/convex/query.config";
import { ProjectsList } from "@/components/projects/list";
import ProjectProvider from "@/components/projects/list/provider";
import { signInPath } from "@/paths";

const Page = async () => {
  const { projects, profile } = await ProjectsQuery();

  if (!profile) {
    redirect(signInPath());
  }

  return (
    <ProjectProvider initialProjects={projects}>
      <div className="container mx-auto px-4 py-36">
        <ProjectsList />
      </div>
    </ProjectProvider>
  );
};

export default Page;
