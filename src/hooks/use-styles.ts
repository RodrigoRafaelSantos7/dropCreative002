export type MoodBoardImage = {
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
