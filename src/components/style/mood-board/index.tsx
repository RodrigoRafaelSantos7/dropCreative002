"use client";

import { UploadIcon } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { type MoodBoardImage, useMoodBoard } from "@/hooks/use-styles";
import { cn } from "@/lib/utils";
import { ImagesBoard } from "./images.board";

type MoodBoardProps = {
  guideImages: MoodBoardImage[];
};

const MAX_IMAGES = 5;

const MARGIN_LEFT = "-80px";
const MARGIN_TOP = "-96px";

const DESKTOP_MARGIN_LEFT = "-96px";
const DESKTOP_MARGIN_TOP = "-112px";

// Random number generator constants
const RANDOM_MULTIPLIER = 9301;
const RANDOM_ADDEND = 49_297;
const RANDOM_MODULUS = 233_280;
const ROTATION_MULTIPLIER = 20; // -10 to +10 degrees for subtle tilt
const X_OFFSET_MULTIPLIER = 40; // -20 to +20 pixels for horizontal movement
const Y_OFFSET_MULTIPLIER = 30; // -15 to +15 pixels for vertical movement

const DESKTOP_ROTATION_MULTIPLIER = 50;
const HALF_OFFSET = 0.5;
const IMAGE_WIDTH = 192;
const OVERLAP_AMOUNT = 30;
const SPACING = IMAGE_WIDTH - OVERLAP_AMOUNT;

const MoodBoard = ({ guideImages }: MoodBoardProps) => {
  const {
    images,
    dragActive,
    removeImage,
    handleDrag,
    handleDrop,
    canAddMore,
    handleFileInput,
  } = useMoodBoard(guideImages);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-10">
      {/** biome-ignore lint/a11y/noNoninteractiveElementInteractions: This is a drag and drop area */}
      {/** biome-ignore lint/a11y/noStaticElementInteractions: This is a drag and drop area */}
      <div
        className={cn(
          "relative flex min-h-[500px] items-center justify-center rounded-3xl border-2 border-dashed p-12 text-center transition-all duration-200",
          dragActive
            ? "scale-102 border-primary bg-primary/5"
            : "border-border/50 hover:border-border"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full rounded-3xl bg-linear-to-br from-primary/20 to-transparent" />
        </div>

        {images.length > 0 && (
          <>
            <div className="absolute inset-0 flex items-center justify-center lg:hidden">
              <div className="relative">
                {images.map((image, index) => {
                  const seed = image.id
                    .split("")
                    .reduce((a, b) => a + b.charCodeAt(0), 0);

                  const random1 =
                    ((seed * RANDOM_MULTIPLIER + RANDOM_ADDEND) %
                      RANDOM_MODULUS) /
                    RANDOM_MODULUS;
                  const random2 =
                    (((seed + 1) * RANDOM_MULTIPLIER + RANDOM_ADDEND) %
                      RANDOM_MODULUS) /
                    RANDOM_MODULUS;
                  const random3 =
                    (((seed + 2) * RANDOM_MULTIPLIER + RANDOM_ADDEND) %
                      RANDOM_MODULUS) /
                    RANDOM_MODULUS;

                  const rotation =
                    (random1 - HALF_OFFSET) * ROTATION_MULTIPLIER;
                  const xOffset = (random2 - HALF_OFFSET) * X_OFFSET_MULTIPLIER;
                  const yOffset = (random3 - HALF_OFFSET) * Y_OFFSET_MULTIPLIER;

                  return (
                    <ImagesBoard
                      image={image}
                      key={`mobile-${image.id}`}
                      marginLeft={MARGIN_LEFT}
                      marginTop={MARGIN_TOP}
                      removeImage={removeImage}
                      rotation={rotation}
                      xOffset={xOffset}
                      yOffset={yOffset}
                      zIndex={index + 1}
                    />
                  );
                })}
              </div>
            </div>
            <div className="absolute inset-0 hidden items-center justify-center lg:flex">
              <div className="relative mx-auto h-[300px] w-full max-w-[700px]">
                {images.map((image, index) => {
                  const seed = image.id
                    .split("")
                    .reduce((a, b) => a + b.charCodeAt(0), 0);

                  const random1 =
                    ((seed * RANDOM_MULTIPLIER + RANDOM_ADDEND) %
                      RANDOM_MODULUS) /
                    RANDOM_MODULUS;
                  const random3 =
                    (((seed + 2) * RANDOM_MULTIPLIER + RANDOM_ADDEND) %
                      RANDOM_MODULUS) /
                    RANDOM_MODULUS;

                  const rotation =
                    (random1 - HALF_OFFSET) * DESKTOP_ROTATION_MULTIPLIER;
                  const xOffset =
                    index * SPACING - ((images.length - 1) * SPACING) / 2;
                  const yOffset = (random3 - HALF_OFFSET) * Y_OFFSET_MULTIPLIER;
                  const zIndex = index + 1;

                  return (
                    <ImagesBoard
                      image={image}
                      key={`mobile-${image.id}`}
                      marginLeft={DESKTOP_MARGIN_LEFT}
                      marginTop={DESKTOP_MARGIN_TOP}
                      removeImage={removeImage}
                      rotation={rotation}
                      xOffset={xOffset}
                      yOffset={yOffset}
                      zIndex={zIndex}
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}

        {images.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UploadIcon />
              </EmptyMedia>
              <EmptyTitle>Drop your images here</EmptyTitle>
              <EmptyDescription>
                Drag and drop up to 5 images to build your mood board
              </EmptyDescription>
              <EmptyContent>
                <Button
                  className="z-20"
                  onClick={handleUploadClick}
                  size="sm"
                  variant="outline"
                >
                  <UploadIcon className="mr-2 size-4" />
                  Upload Files
                </Button>
              </EmptyContent>
            </EmptyHeader>
          </Empty>
        )}

        {images.length > 0 && canAddMore && (
          <div className="absolute right-6 bottom-6 z-20">
            <Button onClick={handleUploadClick} size="sm" variant="outline">
              <UploadIcon className="mr-2 size-4" />
              Upload Files
            </Button>
          </div>
        )}

        <input
          accept="image/*"
          className="hidden"
          multiple
          onChange={handleFileInput}
          ref={fileInputRef}
          type="file"
        />
      </div>

      {/** TODO: Add AI generation */}
      <Button className="w-fit">Generate With AI</Button>

      {images.length > MAX_IMAGES && (
        <div className="rounded-2xl bg-muted/50 p-4 text-center">
          <p className="text-muted-foreground text-sm">
            Maximum of 5 images reached. Remove an image to add more.
          </p>
        </div>
      )}
    </div>
  );
};

export { MoodBoard };
