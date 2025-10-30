import type { MoodBoardImage } from "@/hooks/use-styles";

type MoodBoardProps = {
  guideImages: MoodBoardImage[];
};

const MoodBoard = ({ guideImages }: MoodBoardProps) => (
  <div className="flex flex-col gap-10">
    <div className="relative flex min-h-[500px] items-center justify-center rounded-3xl border-2 border-dashed p-12 text-center transition-all duration-200">
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full rounded-3xl bg-linear-to-br from-primary/20 to-transparent" />
      </div>
    </div>
  </div>
);

export { MoodBoard };
