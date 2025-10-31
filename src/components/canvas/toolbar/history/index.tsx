import { Redo2Icon, Undo2Icon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const HistoryPill = () => (
  <div className="col-span-1 flex items-center justify-start">
    <div
      aria-hidden
      className="inline-flex items-center rounded-full border border-white/12 bg-white/8 p-2 text-neutral-300 saturate-150 backdrop-blur-xl"
    >
      <span className="inline-grid size-9 cursor-pointer place-items-center rounded-full transition-all hover:bg-white/12">
        <Undo2Icon className="stroke-2 opacity-80" size={18} />
      </span>

      <Separator
        className="mx-1 h-5! w-px bg-white/16"
        orientation="vertical"
      />

      <span className="inline-grid size-9 cursor-pointer place-items-center rounded-full transition-all hover:bg-white/12">
        <Redo2Icon className="stroke-2 opacity-80" size={18} />
      </span>
    </div>
  </div>
);

export { HistoryPill };
