import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { api } from "@/convex/_generated/api";

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

type StylesFormData = z.infer<typeof stylesFormSchema>;

const useMoodBoard = (guideImages: MoodBoardImage[]) => {
  const [dargActive, setDragActive] = useState(false);
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const stylesForm = useForm({
    defaultValues: {
      images: [],
    },
    validators: {
      onSubmit: stylesFormSchema.parse,
    },
  });

  const images = stylesForm.state.values.images;

  const generateUploadUrl = useMutation(api.moodboard.generateUploadUrl);
};

export { useMoodBoard, type MoodBoardImage };
