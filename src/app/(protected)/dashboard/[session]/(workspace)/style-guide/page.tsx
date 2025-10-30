import { PaletteIcon } from "lucide-react";
import {
  MoodBoardImagesQuery,
  StyleGuideQuery,
} from "@/components/convex/query.config";
import { EmptyComponent } from "@/components/style/empty";
import { ThemeContent } from "@/components/style/theme";
import { TabsContent } from "@/components/ui/tabs";
import type { MoodBoardImage } from "@/hooks/use-styles";
import type { StyleGuide } from "@/redux/api/style-guide";

type Props = {
  searchParams: Promise<{
    project: string;
  }>;
};

const Page = async ({ searchParams }: Props) => {
  const projectId = (await searchParams).project;
  const existingStyleGuide = await StyleGuideQuery(projectId);

  const guide = existingStyleGuide.styleGuide
    ?._valueJSON as unknown as StyleGuide;

  const colorGuide = guide?.colorSections || [];
  const _typographyGuide = guide?.typographySections || [];

  const existingMoodBoardImages = await MoodBoardImagesQuery(projectId);
  const guideImages = existingMoodBoardImages.images
    ._valueJSON as unknown as MoodBoardImage[];
  return (
    <div>
      <TabsContent className="space-y-8" value="colours">
        {guideImages.length ? (
          <ThemeContent colorGuide={colorGuide} />
        ) : (
          <EmptyComponent
            description="Upload images to your mood board and generate an AI-powered style guide with colors and typography."
            icon={PaletteIcon}
            title="No colors generated yet"
          />
        )}
      </TabsContent>
    </div>
  );
};

export default Page;
