import { ConvexError, v } from "convex/values";
import { api } from "./_generated/api";
import { type MutationCtx, mutation, query } from "./_generated/server";

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

export const createProject = mutation({
  args: {
    userId: v.string(),
    name: v.optional(v.string()),
    sketchData: v.any(), // JSON Structure from Redux Shapes State
    thumbnail: v.optional(v.string()),
  },
  handler: async (ctx, { userId, name, sketchData, thumbnail }) => {
    console.log("🚀 [Convex] Creating project for user:", { userId });

    const projectNumber = await getNextProjectNumber(ctx, userId);
    const projectName = name || `Project ${projectNumber}`;

    const lastModified = Date.now();
    const createdAt = Date.now();

    const projectId = await ctx.db.insert("projects", {
      userId,
      name: projectName,
      sketchData,
      thumbnail,
      projectNumber,
      lastModified,
      createdAt,
      isPublic: false,
    });

    console.log("✅ [Convex] Project created:", {
      projectId,
      mame: projectName,
      projectNumber,
    });

    return {
      projectId,
      name: projectName,
      projectNumber,
      lastModified,
      createdAt,
    };
  },
});

async function getNextProjectNumber(
  ctx: MutationCtx,
  userId: string
): Promise<number> {
  const counter = await ctx.db
    .query("projects_counters")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();

  if (!counter) {
    // Create a new counter for the user starting at 1
    await ctx.db.insert("projects_counters", { userId, nextProjectNumber: 2 });
    return 1;
  }

  const projectNumber = counter.nextProjectNumber;

  await ctx.db.patch(counter._id, { nextProjectNumber: projectNumber + 1 });

  return projectNumber;
}
