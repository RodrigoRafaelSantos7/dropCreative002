export type ColorSwatch = {
  name: string;
  hexColor: string;
  description?: string;
};

export type ColorSection = {
  title:
    | "Primary Colors"
    | "Secondary & Accent Colors"
    | "UI Component Colors"
    | "Utility & Form Colors"
    | "Status & Feedback Colors";
  swatches: ColorSwatch[];
};

export type TypographyStyle = {
  name: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing?: string;
  description?: string;
};

export type TypographySection = {
  title: string;
  styles: TypographyStyle[];
};

export type StyleGuide = {
  theme: string;
  description: string;
  colorSections: [
    ColorSection,
    ColorSection,
    ColorSection,
    ColorSection,
    ColorSection,
  ];
  typographySections: [TypographySection, TypographySection, TypographySection];
};
