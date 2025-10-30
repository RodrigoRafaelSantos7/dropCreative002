import { ColorSwatch } from "@/components/style/swatch";
import { cn } from "@/lib/utils";
import type {
  ColorSection as ColorSectionType,
  ColorSwatch as ColorSwatchType,
} from "@/redux/api/style-guide";

type ColorSectionProps = {
  title: string;
  swatches: ColorSwatchType[];
  className?: string;
};

const ColorSection = ({ title, swatches, className }: ColorSectionProps) => (
  <div className={cn("flex flex-col gap-5", className)}>
    <div>
      <h3 className="font-medium text-foreground/50 text-lg">{title}</h3>
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {swatches.map((swatch) => (
        <div key={swatch.name}>
          <ColorSwatch name={swatch.name} value={swatch.hexColor} />
          {swatch.description && (
            <p className="mt-2 text-muted-foreground text-xs">
              {swatch.description}
            </p>
          )}
        </div>
      ))}
    </div>
  </div>
);

const ThemeContent = ({ colorGuide }: { colorGuide: ColorSectionType[] }) => (
  <div className="flex flex-col gap-10">
    <div className="flex flex-col gap-10">
      {colorGuide.map((section) => (
        <ColorSection
          key={section.title}
          swatches={section.swatches}
          title={section.title}
        />
      ))}
    </div>
  </div>
);

export { ThemeContent };
