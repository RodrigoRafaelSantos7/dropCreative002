import { Spinner } from "@/components/ui/spinner";

type LoadingProps = {
  title?: string;
  message?: string;
};

const Loading = ({ title, message }: LoadingProps) => (
  <div className="flex min-h-dvh items-center justify-center bg-background">
    <div className="fle-col flex items-center gap-4 text-center">
      <Spinner />

      <div className="space-y-1">
        <p className="font-medium text-foreground text-sm">{title}</p>
        <p className="text-muted-foreground text-xs">{message}</p>
      </div>
    </div>
  </div>
);

export default Loading;
