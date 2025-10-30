import { cn } from "@/lib/utils";

type ColorSwatchProps = {
  name: string;
  value: string;
  className?: string;
};

const ColorSwatch = ({ name, value, className }: ColorSwatchProps) => (
  <div className={cn("flex items-center gap-3", className)}>
    <div
      className="size-12 shrink-0 rounded-lg border border-border/20"
      style={{ backgroundColor: value }}
    />
    <div className="min-w-0 flex-1 space-y-1">
      <h4 className="font-medium text-foreground text-sm">{name}</h4>
      <p className="font-mono text-muted-foreground text-xs uppercase">
        {value}
      </p>
    </div>
  </div>
);

export { ColorSwatch };
