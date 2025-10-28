"use client";

import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useProjectCreation } from "@/hooks/use-project";

const CreateProject = () => {
  const { createProject, isCreating, canCreate } = useProjectCreation();
  return (
    <Button
      className="flex cursor-pointer items-center gap-2 rounded-full"
      disabled={!canCreate || isCreating}
      onClick={() => createProject()}
    >
      {isCreating ? <Spinner /> : <PlusIcon className="size-4" />}
      {isCreating ? "Creating..." : "New Project"}
    </Button>
  );
};

export { CreateProject };
