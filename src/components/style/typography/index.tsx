import type { TypographySection } from "@/redux/api/style-guide";

type StyleGuideTypographyProps = {
  typographyGuide: TypographySection[];
};

const StyleGuideTypography = ({
  typographyGuide,
}: StyleGuideTypographyProps) => (
  <div className="flex flex-col gap-10">
    {typographyGuide.map((section) => (
      <div className="flex flex-col gap-5" key={section.title}>
        <div>
          <h3 className="font-medium text-foreground/50 text-lg">
            {section.title}
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {section.styles.map((style) => (
            <div
              className="rounded-2xl border border-white/8 bg-white/2 p-6 saturate-150 backdrop-blur-xl"
              key={style.name}
            >
              <div className="space-y-4">
                <h4 className="mb-1 font-medium text-foreground text-lg">
                  {style.name}
                </h4>
                {style.description && (
                  <p className="text-muted-foreground text-sm">
                    {style.description}
                  </p>
                )}
              </div>
              <div
                className="text-foreground"
                style={{
                  fontFamily: style.fontFamily,
                  fontSize: style.fontSize,
                  fontWeight: style.fontWeight,
                  lineHeight: style.lineHeight,
                  letterSpacing: style.letterSpacing || "normal",
                }}
              >
                The quick brown fox jumps over the lazy dog.
              </div>
              <div className="space-y-1 text-muted-foreground text-xs">
                <p>Font: {style.fontFamily}</p>
                <p>Size: {style.fontSize}</p>
                <p>Weight: {style.fontWeight}</p>
                <p>Line Height: {style.lineHeight}</p>
                {style.letterSpacing && (
                  <p>Letter Spacing: {style.letterSpacing}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export { StyleGuideTypography };
