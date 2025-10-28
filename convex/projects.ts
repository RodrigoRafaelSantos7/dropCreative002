import { ConvexError, v } from "convex/values";
import { api } from "./_generated/api";
import { query } from "./_generated/server";

/**
 * Get a project by ID.
 *
 * @param projectId - The ID of the project to get.
 * @returns The project.
 * @throws {ConvexError} If the project is not found or the user is not authorized to access it.
 */
export const getProject = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.object({
    _id: v.id("projects"),
    _creationTime: v.number(),
    userId: v.id("user"),
    name: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
    updatedAt: v.number(),
    createdAt: v.number(),
  }),
  handler: async (ctx, { projectId }) => {
    /**
     * Authenticate the requesting user.
     * Throws a 404 ConvexError if no user is authenticated.
     */
    const user = await ctx.runQuery(api.auth.getCurrentUser, {});

    /**
     * Fetch the project by ID.
     * Returns null if the project doesn't exist.
     */
    const project = await ctx.db.get(projectId);

    if (!project) {
      throw new ConvexError({
        code: 404,
        message: "Project not found",
        severity: "high",
      });
    }

    /**
     * Authorization check: Allow access if the user is the project owner
     * OR if the project is marked as public.
     * This prevents unauthorized users from accessing private projects.
     */
    if (project.userId !== user._id && !project.isPublic) {
      throw new ConvexError({
        code: 403,
        message:
          "Access denied. You are not the owner of this project and it is not public.",
        severity: "medium",
      });
    }

    return project;
  },
});
