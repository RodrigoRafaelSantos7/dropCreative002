import type { LucideIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type EmptyComponentProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const EmptyComponent = ({ icon, title, description }: EmptyComponentProps) => {
  const Icon = icon;
  return (
    <div className="py-20">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon className="size-8 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
};

export { EmptyComponent };
