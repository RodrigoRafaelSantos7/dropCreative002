import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

/**
 * Maximum number of moodboard images to process in a single query.
 * Prevents DoS attacks and excessive resource usage from projects with
 * thousands of uploaded images.
 */
const MAX_MOODBOARD_IMAGES = 20;

/**
 * Retrieves moodboard images for a project with authorization checks.
 *
 * This query:
 * - Validates user authentication and project access permissions
 * - Fetches signed URLs for all moodboard images stored in the project
 * - Handles missing or deleted storage files gracefully
 * - Preserves image order as stored in the database
 * - Enforces a maximum limit to prevent resource exhaustion
 *
 * @param projectId - The ID of the project containing moodboard images
 * @returns Array of image objects with URLs, metadata, and ordering info
 * @throws {ConvexError} 404 if project not found, 403 if unauthorized access
 *
 * @example
 * ```typescript
 * const images = await ctx.runQuery(api.moodboard.getMoodBoardImages, {
 *   projectId: "k1234..."
 * });
 * // Returns: [{ id, storageId, url, uploaded: true, uploading: false, index }, ...]
 * ```
 */
export const getMoodBoardImages = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.array(
    v.object({
      id: v.string(),
      storageId: v.id("_storage"),
      url: v.string(),
      uploaded: v.boolean(),
      uploading: v.boolean(),
      index: v.number(),
    })
  ),
  handler: async (ctx, { projectId }) => {
    // Authenticate user before proceeding with any database operations
    // This ensures unauthorized users cannot probe for project existence
    const authenticatedUser = await authComponent.getAuthUser(ctx);

    if (!authenticatedUser) {
      throw new ConvexError({
        code: 401,
        message: "Unauthenticated. Please sign in to create a project.",
        severity: "high",
      });
    }

    const project = await ctx.db.get(projectId);

    if (!project) {
      throw new ConvexError({
        code: 404,
        message: "Project not found",
        severity: "high",
      });
    }

    if (project.userId !== authenticatedUser._id && !project.isPublic) {
      // Authorization: enforce access control before exposing any project data
      // Users can only access their own projects or public projects
      throw new ConvexError({
        code: 403,
        message:
          "Access denied. You are not the owner of this project and the project is not public.",
        severity: "high",
      });
    }

    // Validate moodboardImages is an array and provide safe default
    // Schema validation ensures this is always an array of storage IDs when present,
    // but defensive programming prevents runtime errors from schema evolution
    const storageIds = Array.isArray(project.moodboardImages)
      ? project.moodboardImages
      : [];

    if (storageIds.length > MAX_MOODBOARD_IMAGES) {
      // Enforce resource limits to prevent DoS attacks from projects with
      // thousands of images, which could exhaust memory or request timeouts
      throw new ConvexError({
        code: 400,
        message: `Too many moodboard images. Maximum ${MAX_MOODBOARD_IMAGES} images allowed.`,
        severity: "medium",
      });
    }

    // Fetch signed URLs for all images concurrently for better performance.
    // Each image fetch is independent, so parallelization improves response time.
    // Note: Failed or missing files return null URLs, which we filter out below.
    const images = await Promise.all(
      storageIds.map(async (storageId, index) => {
        try {
          // ctx.storage.getUrl() returns null if the storage file doesn't exist.
          // This can happen if files were deleted but references remain in the database.
          const url = await ctx.storage.getUrl(storageId);

          // Skip images where storage file no longer exists
          if (!url) {
            return null;
          }

          // Return structured image data matching frontend expectations.
          // The ID prefix ensures uniqueness across different image sources,
          // though using storageId directly would also work since IDs are unique.
          return {
            id: `drop-creative-${storageId}`,
            storageId,
            url,
            uploaded: true,
            uploading: false,
            index, // Preserve original array order for consistent UI rendering
          };
        } catch {
          // Handle storage retrieval errors gracefully.
          // If storage.getUrl() throws (unlikely but possible), we skip this image
          // rather than failing the entire request, allowing partial results.
          // In production, consider tracking these errors for monitoring.
          return null;
        }
      })
    );

    // Filter out failed/missing images and sort by original index.
    // The sort ensures consistent ordering even if some images fail to load,
    // maintaining the user's intended visual arrangement.
    return images
      .filter((image): image is NonNullable<typeof image> => image !== null)
      .sort((a, b) => a.index - b.index);
  },
});

/**
 * Generates a signed upload URL for a moodboard image.
 *
 * This mutation:
 * - Authenticates the user before generating the upload URL
 * - Generates a signed upload URL that expires in 1 hour
 * - Returns the signed upload URL
 *
 * @returns The signed upload URL
 * @throws {ConvexError} 401 if the user is not authenticated
 *
 * @example
 * ```typescript
 * const uploadUrl = await ctx.runMutation(api.moodboard.generateUploadUrl, {});
 * // Returns: "https://storage.convex.dev/..."
 * ```
 */
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    // Authenticate user before proceeding with any database operations
    // This ensures unauthorized users cannot probe for project existence
    const authenticatedUser = await authComponent.getAuthUser(ctx);

    if (!authenticatedUser) {
      throw new ConvexError({
        code: 401,
        message: "Unauthenticated. Please sign in to create a project.",
        severity: "high",
      });
    }

    // Generate upload URL that expires in 1 hour
    return await ctx.storage.generateUploadUrl();
  },
});
