import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { type MutationCtx, mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

const DEFAULT_PROJECT_LIMIT = 20;
const MAX_PROJECT_LIMIT = 100;
const MIN_PROJECT_LIMIT = 1;

/**
 * Retrieves a project by ID with authorization checks.
 *
 * @param projectId - The ID of the project to retrieve
 * @returns The project document
 * @throws {ConvexError} 404 if project not found, 403 if user lacks access
 */
export const getProject = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.any(),
  handler: async (ctx, { projectId }) => {
    const user = await authComponent.getAuthUser(ctx);

    const project = await ctx.db.get(projectId);

    if (!project) {
      throw new ConvexError({
        code: 404,
        message: "Project not found",
        severity: "high",
      });
    }

    // Authorization: owner or public access only
    if (!user || (project.userId !== user._id && !project.isPublic)) {
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

/**
 * Creates a new project with auto-incrementing project numbers per user.
 *
 * Projects are numbered sequentially per user (Project 1, Project 2, etc.).
 * Defaults to "Project {number}" if no name provided. All projects are private by default.
 *
 * @param userId - Must match the authenticated user's ID
 * @param name - Optional project name
 * @param sketchData - Required Redux shapes state JSON
 * @param thumbnail - Optional base64-encoded thumbnail
 * @returns Project metadata with ID, name, number, and timestamps
 */
export const createProject = mutation({
  args: {
    userId: v.string(),
    name: v.optional(v.string()),
    sketchData: v.any(),
    thumbnail: v.optional(v.string()),
  },
  returns: v.object({
    projectId: v.id("projects"),
    name: v.string(),
    projectNumber: v.number(),
    lastModified: v.number(),
    createdAt: v.number(),
  }),
  handler: async (ctx, { userId, name, sketchData, thumbnail }) => {
    // Security: prevent creating projects for other users
    const authenticatedUser = await authComponent.getAuthUser(ctx);

    if (!authenticatedUser) {
      throw new ConvexError({
        code: 401,
        message: "Unauthenticated. Please sign in to create a project.",
        severity: "high",
      });
    }

    if (authenticatedUser._id !== userId) {
      throw new ConvexError({
        code: 403,
        message: "Cannot create project for another user",
        severity: "high",
      });
    }

    if (!sketchData) {
      throw new ConvexError({
        code: 400,
        message: "sketchData is required",
        severity: "medium",
      });
    }

    const projectNumber = await getNextProjectNumber(ctx, userId);
    const projectName = name || `Project ${projectNumber}`;
    const timestamp = Date.now();

    const projectId: Id<"projects"> = await ctx.db.insert("projects", {
      userId,
      name: projectName,
      sketchData,
      thumbnail,
      projectNumber,
      lastModified: timestamp,
      createdAt: timestamp,
      isPublic: false,
    });

    return {
      projectId,
      name: projectName,
      projectNumber,
      lastModified: timestamp,
      createdAt: timestamp,
    };
  },
});

/**
 * Generates sequential project numbers per user with atomic counter updates.
 *
 * Uses a separate counter table for O(1) performance and atomicity.
 * Counter state persists across project deletions, ensuring numbers are never reused.
 *
 * @param ctx - Mutation context
 * @param userId - User ID
 * @returns Next available project number for the user
 * @throws {ConvexError} If userId is invalid or counter state is corrupted
 */
async function getNextProjectNumber(
  ctx: MutationCtx,
  userId: string
): Promise<number> {
  if (!userId || typeof userId !== "string" || userId.trim() === "") {
    throw new ConvexError({
      code: 400,
      message: "Invalid userId provided",
      severity: "high",
    });
  }

  const counter = await ctx.db
    .query("projects_counters")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();

  if (!counter) {
    await ctx.db.insert("projects_counters", { userId, nextProjectNumber: 2 });
    return 1;
  }

  const projectNumber = counter.nextProjectNumber;

  // Data integrity check
  if (typeof projectNumber !== "number" || projectNumber < 1) {
    throw new ConvexError({
      code: 500,
      message: "Invalid counter state detected",
      severity: "high",
    });
  }

  await ctx.db.patch(counter._id, { nextProjectNumber: projectNumber + 1 });

  return projectNumber;
}

/**
 * Retrieves projects for the authenticated user, ordered by last modified (descending).
 *
 * @param userId - Must match the authenticated user's ID
 * @param limit - Maximum number of projects (default: 20, max: 100)
 * @returns Array of project summaries
 * @throws {ConvexError} 403 if accessing another user's projects
 */
export const getUserProjects = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("projects"),
      name: v.string(),
      projectNumber: v.number(),
      thumbnail: v.optional(v.string()),
      lastModified: v.number(),
      createdAt: v.number(),
      isPublic: v.boolean(),
    })
  ),
  handler: async (ctx, { userId, limit = DEFAULT_PROJECT_LIMIT }) => {
    // Security: prevent querying other users' projects
    const authenticatedUser = await authComponent.getAuthUser(ctx);

    if (!authenticatedUser) {
      throw new ConvexError({
        code: 401,
        message: "Unauthenticated. Please sign in to view projects.",
        severity: "high",
      });
    }

    if (authenticatedUser._id !== userId) {
      throw new ConvexError({
        code: 403,
        message: "Cannot access another user's projects",
        severity: "high",
      });
    }

    const validatedLimit = Math.min(
      Math.max(MIN_PROJECT_LIMIT, limit || DEFAULT_PROJECT_LIMIT),
      MAX_PROJECT_LIMIT
    );

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_userId_lastModified", (q) => q.eq("userId", userId))
      .order("desc")
      .take(validatedLimit);

    return projects.map(
      (project: {
        _id: Id<"projects">;
        name: string;
        projectNumber: number;
        thumbnail?: string;
        lastModified: number;
        createdAt: number;
        isPublic: boolean;
      }) => ({
        _id: project._id,
        name: project.name,
        projectNumber: project.projectNumber,
        thumbnail: project.thumbnail,
        lastModified: project.lastModified,
        createdAt: project.createdAt,
        isPublic: project.isPublic,
      })
    );
  },
});

/**
 * Retrieves the style guide for a project as parsed JSON.
 *
 * @param projectId - The project ID
 * @returns Parsed style guide object or null if not set
 * @throws {ConvexError} 404 if project not found, 403 if unauthorized, 500 if JSON invalid
 */
export const getProjectStyleGuide = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, { projectId }) => {
    const user = await authComponent.getAuthUser(ctx);

    const project = await ctx.db.get(projectId);

    if (!project) {
      throw new ConvexError({
        code: 404,
        message: "Project not found",
        severity: "high",
      });
    }

    // Authorization: owner or public access only
    if (!user || (project.userId !== user._id && !project.isPublic)) {
      throw new ConvexError({
        code: 403,
        message:
          "Access denied. You are not the owner of this project and the project is not public.",
        severity: "medium",
      });
    }

    if (!project.styleGuide) {
      return null;
    }

    try {
      return JSON.parse(project.styleGuide);
    } catch {
      throw new ConvexError({
        code: 500,
        message: "Invalid style guide format",
        severity: "high",
      });
    }
  },
});
