import { AlertCircleIcon, CheckCircleIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { MoodBoardImage } from "@/hooks/use-styles";

type UploadStatusProps = {
  uploading: boolean;
  uploaded: boolean;
  error?: string;
};

const UploadStatus = ({ uploading, uploaded, error }: UploadStatusProps) => {
  if (uploading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
        <Spinner />
      </div>
    );
  }

  if (uploaded) {
    return (
      <div className="absolute top-2 left-2">
        <CheckCircleIcon className="size-5 text-green-400" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="absolute top-2 left-2">
        <AlertCircleIcon className="size-5 text-destructive" />
      </div>
    );
  }

  return null;
};

type ImagesBoardProps = {
  image: MoodBoardImage;
  removeImage: (id: string) => void;
  xOffset: number;
  yOffset: number;
  rotation: number;
  zIndex: number;
  marginLeft: string;
  marginTop: string;
};

const ImagesBoard = ({
  image,
  removeImage,
  xOffset,
  yOffset,
  rotation,
  zIndex,
  marginLeft,
  marginTop,
}: ImagesBoardProps) => (
  <div
    className="group absolute"
    key={`board-${image.id}`}
    style={{
      transform: `rotate(${rotation}deg) translate(${xOffset}px, ${yOffset}px)`,
      zIndex,
      left: "50%",
      top: "50%",
      marginLeft,
      marginTop,
    }}
  >
    <div className="relative h-48 w-40 overflow-hidden rounded-2xl border border-border/20 bg-white shadow-xl transition-all duration-200 hover:scale-105">
      <Image
        alt={"Mood board image"}
        className="object-cover"
        fill
        src={image.preview}
      />

      <UploadStatus
        error={image.error}
        uploaded={image.uploaded}
        uploading={image.uploading}
      />

      <Button
        className="absolute top-2 right-2"
        onClick={() => removeImage(image.id)}
        type="button"
        variant="ghost"
      >
        <XIcon className="size-5 text-destructive" />
      </Button>
    </div>
  </div>
);

export { ImagesBoard };
