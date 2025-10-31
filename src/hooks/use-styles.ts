import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { logger } from "@/lib/logger";
import { tryCatch } from "./try-catch";

const log = logger.child({ module: "useStyles" });

type MoodBoardImage = {
  id: string;
  file?: File; // Optional for server-loaded images
  preview: string; // Local preview URL or Convex Url
  storageId: string;
  uploaded: boolean;
  uploading: boolean;
  error?: string;
  url?: string; // Convex URL for Uploaded Images
  isFromServer: boolean; // Track if image came from server
};

const stylesFormSchema = z.object({
  images: z.array(z.custom<MoodBoardImage>()),
});

const MAX_MOODBOARD_IMAGES = 5;

const convertServerImages = (guideImages: MoodBoardImage[]): MoodBoardImage[] =>
  guideImages.map((image) => ({
    id: image.id,
    preview: image.url ?? "",
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

    if (clientIndex !== -1) {
      // Clean up the old blob URL if it exists
      if (mergedImages[clientIndex].preview.startsWith("blob:")) {
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
  const projectId = searchParams.get("projectId");

  const stylesForm = useForm({
    defaultValues: {
      images: [] as MoodBoardImage[],
    },
    validators: {
      onSubmit: stylesFormSchema.parse,
    },
  });

  const images = stylesForm.state.values.images;

  const generateUploadUrl = useMutation(api.moodboard.generateUploadUrl);
  const removeMoodboardImage = useMutation(api.moodboard.removeMoodboardImage);
  const addMoodboardImage = useMutation(api.moodboard.addMoodboardImage);

  const uploadImage = useCallback(
    async (file: File) => {
      const result = await tryCatch(
        (async () => {
          const uploadUrl = await generateUploadUrl();

          const response = await tryCatch(
            fetch(uploadUrl, {
              method: "POST",
              headers: { "Content-Type": file.type },
              body: file,
            })
          );

          if (response.error || !response.data?.ok) {
            throw new Error("Failed to upload image");
          }

          const jsonData = await response.data.json();
          const storageId = jsonData.storageId as Id<"_storage">;

          if (projectId) {
            await addMoodboardImage({
              projectId: projectId as Id<"projects">,
              storageId,
            });
          }

          return storageId;
        })()
      );

      if (result.error) {
        log.error({ error: result.error }, "Error uploading image");
        toast.error("Failed to upload image");
        return;
      }

      return result.data;
    },
    [generateUploadUrl, addMoodboardImage, projectId]
  );

  useEffect(() => {
    if (guideImages && guideImages.length > 0) {
      const serverImages = convertServerImages(guideImages);
      const currentImages = stylesForm.state.values.images;

      if (currentImages.length === 0) {
        stylesForm.setFieldValue("images", serverImages);
      } else {
        const mergedImages = mergeImages(currentImages, serverImages);
        stylesForm.setFieldValue("images", mergedImages);
      }
    }
  }, [guideImages, stylesForm]);

  const addFile = (file: File) => {
    if (images.length >= MAX_MOODBOARD_IMAGES) {
      toast.error(`You can only add up to ${MAX_MOODBOARD_IMAGES} images`);
      return;
    }
    const newImage: MoodBoardImage = {
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      storageId: "",
      uploaded: false,
      uploading: false,
      isFromServer: false,
    };

    const updatedImages = [...images, newImage];
    stylesForm.setFieldValue("images", updatedImages);

    toast.success("Image added to moodboard");
  };

  const removeImage = async (imageId: string) => {
    const imageToRemove = images.find((image) => image.id === imageId);
    if (!imageToRemove) {
      log.error({ imageId }, "Image not found ");
      return;
    }

    // If it's a server image with a storage id, remove it from the server (Convex)
    if (imageToRemove.isFromServer && imageToRemove.storageId && projectId) {
      const result = await tryCatch(
        removeMoodboardImage({
          storageId: imageToRemove.storageId as Id<"_storage">,
          projectId: projectId as Id<"projects">,
        })
      );

      if (result.error) {
        log.error(
          { error: result.error },
          "Error removing the image from the server"
        );
        toast.error("Failed to remove image from moodboard");
        return;
      }
    }

    const updateImages = () =>
      images.filter((image) => {
        if (image.id === imageId) {
          // Clean up preview URL only fot local images
          if (!image.isFromServer && image.preview.startsWith("blob:")) {
            URL.revokeObjectURL(image.preview);
          }
          return false;
        }
        return true;
      });

    stylesForm.setFieldValue("images", updateImages());
    toast.success("Image removed");
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
      toast.error("Please drop image files only!");
      return;
    }

    for (const file of imageFiles) {
      if (images.length <= MAX_MOODBOARD_IMAGES) {
        addFile(file);
      } else {
        toast.error(`You can only add up to ${MAX_MOODBOARD_IMAGES} images`);
        return;
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      toast.error("Please select image files only!");
      return;
    }

    for (const file of imageFiles) {
      if (images.length <= MAX_MOODBOARD_IMAGES) {
        addFile(file);
      } else {
        toast.error(`You can only add up to ${MAX_MOODBOARD_IMAGES} images`);
        return;
      }
    }

    // Reset the file input
    e.target.value = "";
  };

  const uploadSingleImage = useCallback(
    async (
      image: MoodBoardImage,
      index: number,
      currentImages: MoodBoardImage[]
    ) => {
      if (!image.file) {
        return;
      }

      const updatedImages = [...currentImages];
      updatedImages[index] = { ...image, uploading: true };
      stylesForm.setFieldValue("images", updatedImages);

      const result = await tryCatch(uploadImage(image.file));

      if (result.error) {
        log.error({ error: result.error }, "Error uploading image");
        toast.error("Failed to upload image");
        const errorImages = [...currentImages];
        errorImages[index] = {
          ...image,
          uploading: false,
          error: "Upload failed",
        };
        stylesForm.setFieldValue("images", errorImages);
        return;
      }

      const storageId = result.data;
      if (storageId) {
        const successImages = [...currentImages];
        successImages[index] = {
          ...image,
          uploading: false,
          uploaded: true,
          storageId,
          isFromServer: true,
        };
        stylesForm.setFieldValue("images", successImages);
      }
    },
    [uploadImage, stylesForm.setFieldValue]
  );

  useEffect(() => {
    const uploadPendingImages = async () => {
      const currentImages = stylesForm.state.values.images;

      for (let i = 0; i < currentImages.length; i++) {
        const image = currentImages[i];

        if (!(image.uploaded || image.uploading || image.error) && image.file) {
          await uploadSingleImage(image, i, currentImages);
        }
      }
    };

    if (images.length > 0) {
      uploadPendingImages();
    }
  }, [stylesForm.state.values.images, images.length, uploadSingleImage]);

  useEffect(() => {
    for (const image of images) {
      URL.revokeObjectURL(image.preview);
    }
  }, [images]);

  return {
    form: stylesForm,
    images,
    dragActive,
    removeImage,
    handleDrag,
    handleDrop,
    handleFileInput,
    canAddMore: images.length < MAX_MOODBOARD_IMAGES,
  };
};

export { useMoodBoard, type MoodBoardImage };
