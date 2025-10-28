import { ArrowUpRightIcon, FolderCodeIcon } from "lucide-react";
import Link from "next/link";
import { CreateProject } from "@/components/buttons/project";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

const EmptyProjectList = () => (
  <div className="py-20">
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderCodeIcon />
        </EmptyMedia>
        <EmptyTitle>No Projects Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any projects yet. Get started by creating
          your first project.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <CreateProject />
      </EmptyContent>
      <Button
        asChild
        className="text-muted-foreground"
        size="sm"
        variant="link"
      >
        {/* TODO: Add link to learn more */}
        <Link href={""}>
          Learn More <ArrowUpRightIcon />
        </Link>
      </Button>
    </Empty>
  </div>
);

export { EmptyProjectList };
