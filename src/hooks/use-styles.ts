import { useMutation } from "convex/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { logger } from "@/lib/logger";
import { tryCatch } from "./try-catch";

const log = logger.child({ module: "useStyles" });

const MAX_IMAGES = 5;

type MoodBoardImage = {
  id: string;
  file?: File; // Optional for server-loaded images
  preview: string; // Local preview URL or Convex Url
  storageId?: string;
  uploaded: boolean;
  uploading: boolean;
  error?: string;
  url?: string; // Convex URL for Uploaded Images
  isFromServer?: boolean; // Track if image came from server
};

type StylesFormData = {
  images: MoodBoardImage[];
};

const mapToServerImages = (guideImages: MoodBoardImage[]): MoodBoardImage[] =>
  guideImages.map((image) => ({
    id: image.id,
    preview: image.url || "",
    storageId: image.storageId,
    uploaded: true,
    uploading: false,
    url: image.url,
    isFromServer: true,
  }));

const mergeImages = (
  currentImages: MoodBoardImage[],
  serverImages: MoodBoardImage[]
): MoodBoardImage[] => {
  const mergedImages = [...currentImages];
  for (const serverImage of serverImages) {
    const clientIndex = mergedImages.findIndex(
      (clientImage) => clientImage.storageId === serverImage.storageId
    );

    if (clientIndex === -1) {
      mergedImages.push(serverImage);
    } else {
      // Clean up old blob URL if it exists
      if (mergedImages[clientIndex]?.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(mergedImages[clientIndex].preview);
      }

      // Replace with server image
      mergedImages[clientIndex] = serverImage;
    }
  }
  return mergedImages;
};

const useMoodBoard = (guideImages: MoodBoardImage[]) => {
  const [dragActive, setDragActive] = useState(false);

  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");

  const form = useForm<StylesFormData>({
    defaultValues: {
      images: [],
    },
  });

  const { watch, setValue, getValues } = form;
  const images = watch("images");

  const generateUploadUrl = useMutation(api.moodboard.generateUploadUrl);
  const removeMoodboardImage = useMutation(api.moodboard.removeMoodboardImage);
  const addMoodboardImage = useMutation(api.moodboard.addMoodboardImage);

  const uploadImage = useCallback(
    async (file: File) => {
      try {
        const uploadUrl = await generateUploadUrl();

        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!result.ok) {
          log.error(`Upload Failed: ${result.statusText}`);
          throw new Error(`Upload Failed: ${result.statusText}`);
        }

        const { storageId } = await result.json();

        if (projectId && storageId) {
          const addImageResult = await tryCatch(
            addMoodboardImage({
              projectId: projectId as Id<"projects">,
              storageId: storageId as Id<"_storage">,
            })
          );

          if (addImageResult.error) {
            log.error(
              addImageResult.error,
              "Failed to add image to the server"
            );
            throw addImageResult.error;
          }
        }

        return { storageId };
      } catch (error) {
        log.error(error, "Failed to upload image");
        throw error;
      }
    },
    [generateUploadUrl, addMoodboardImage, projectId]
  );

  useEffect(() => {
    if (guideImages && guideImages.length > 0) {
      const serverImages = mapToServerImages(guideImages);
      const currentImages = getValues("images");

      if (currentImages.length === 0) {
        setValue("images", serverImages);
      } else {
        const merged = mergeImages(currentImages, serverImages);
        setValue("images", merged);
      }
    }
  }, [guideImages, setValue, getValues]);

  const addImage = (file: File) => {
    if (images.length >= MAX_IMAGES) {
      log.error(`You can only add up to ${MAX_IMAGES} images`);
      toast.error("You can only add up to 5 images", {
        description: "Remove an image to add a new one",
      });
      return;
    }

    const newImage = {
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      uploaded: false,
      uploading: false,
      isFromServer: false,
    };

    const updatedImages = [...images, newImage];
    setValue("images", updatedImages);

    toast.success("Image added to mood board", {
      description:
        "You can now generate a mood board from your image or add more images",
    });
  };

  const removeImage = async (imageId: string) => {
    const imageToRemove = images.find((image) => image.id === imageId);

    if (!imageToRemove) {
      return;
    }

    // If it's a server image with storageId, remove from Convex
    if (imageToRemove.isFromServer && imageToRemove.storageId && projectId) {
      const result = await tryCatch(
        removeMoodboardImage({
          projectId: projectId as Id<"projects">,
          storageId: imageToRemove.storageId as Id<"_storage">,
        })
      );

      if (result.error) {
        log.error(result.error, "Failed to remove image from the server");
        toast.error("Failed to remove image from the server", {
          description: "Please try again",
        });
        return;
      }
    }

    const updatedImages = images.filter((image) => {
      if (image.id === imageId) {
        // Clean up preview URL if it's a local image
        if (!image.isFromServer && image.preview.startsWith("blob:")) {
          URL.revokeObjectURL(image.preview);
        }
        return false;
      }
      return true;
    });

    setValue("images", updatedImages);
    toast.success("Image removed from mood board");
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      toast.error("Failed to add images to mood board", {
        description: "Please drag and drop images only",
      });
      return;
    }

    // Add each image file
    for (const file of imageFiles) {
      if (images.length >= MAX_IMAGES) {
        addImage(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    for (const file of files) {
      if (file.type.startsWith("image/")) {
        addImage(file);
      }
    }

    // Reset the file input
    e.target.value = "";
  };

  const updateImageById = useCallback(
    (imageId: string, updates: Partial<MoodBoardImage>) => {
      const currentImages = getValues("images");
      const index = currentImages.findIndex((img) => img.id === imageId);
      if (index === -1) {
        return;
      }
      const updatedImages = [...currentImages];
      updatedImages[index] = { ...updatedImages[index], ...updates };
      setValue("images", updatedImages);
    },
    [getValues, setValue]
  );

  const markImageAsUploading = useCallback(
    (imageId: string) => {
      updateImageById(imageId, { uploading: true });
    },
    [updateImageById]
  );

  const handleUploadSuccess = useCallback(
    (imageId: string, storageId: Id<"_storage"> | undefined) => {
      updateImageById(imageId, {
        storageId,
        uploaded: true,
        uploading: false,
        isFromServer: true,
      });
    },
    [updateImageById]
  );

  const handleUploadError = useCallback(
    (imageId: string, error: Error) => {
      log.error(error, "Failed to upload image");
      updateImageById(imageId, {
        error: error.message,
        uploading: false,
      });
    },
    [updateImageById]
  );

  const processImageUpload = useCallback(
    async (image: MoodBoardImage) => {
      if (!image.file) {
        return;
      }

      markImageAsUploading(image.id);
      const result = await tryCatch(uploadImage(image.file));

      if (result.error) {
        handleUploadError(image.id, result.error);
        return;
      }

      handleUploadSuccess(image.id, result.data?.storageId);
    },
    [uploadImage, markImageAsUploading, handleUploadError, handleUploadSuccess]
  );

  useEffect(() => {
    const uploadPendingImages = async () => {
      const currentImages = getValues("images");
      const isPending = (img: MoodBoardImage) => {
        const hasUploaded = img.uploaded;
        const isUploading = img.uploading;
        const hasError = !!img.error;
        return !(hasUploaded || isUploading || hasError);
      };
      const pendingImages = currentImages.filter(isPending);

      for (const image of pendingImages) {
        await processImageUpload(image);
      }
    };

    if (images.length > 0) {
      uploadPendingImages();
    }
  }, [images, processImageUpload, getValues]);

  useEffect(() => () => {
    for (const image of images) {
      URL.revokeObjectURL(image.preview);
    }
  });

  return {
    form,
    images,
    dragActive,
    addImage,
    removeImage,
    handleDrag,
    handleDrop,
    handleFileInput,
    canAddMore: images.length < MAX_IMAGES,
  };
};

export { useMoodBoard, type MoodBoardImage };
