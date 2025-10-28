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

/**
 * Creates a new project for a user with optional metadata.
 *
 * Implements an auto-incrementing project numbering system per user, ensuring
 * each user has sequentially numbered projects (Project 1, Project 2, etc.).
 *
 * If no name is provided, generates a default name using the project number.
 * All projects are created as private by default (isPublic: false).
 *
 * @param userId - The authenticated user creating the project
 * @param name - Optional custom project name. Defaults to "Project {number}"
 * @param sketchData - The complete Redux shapes state as JSON (required)
 * @param thumbnail - Optional base64-encoded thumbnail image
 * @returns Project metadata including ID, name, number, and timestamps
 *
 * @example
 * await createProject({
 *   userId: "user123",
 *   name: "My Sketch",
 *   sketchData: { shapes: [...] },
 *   thumbnail: "data:image/png;base64,..."
 * });
 */
export const createProject = mutation({
  args: {
    userId: v.string(),
    name: v.optional(v.string()),
    sketchData: v.any(), // JSON Structure from Redux Shapes State
    thumbnail: v.optional(v.string()),
  },
  handler: async (ctx, { userId, name, sketchData, thumbnail }) => {
    console.log("🚀 [Convex] Creating project for user:", { userId });

    // Get the next sequential project number for this user
    // This ensures each user has their own independent project numbering
    const projectNumber = await getNextProjectNumber(ctx, userId);

    // Use provided name or generate default "Project {number}"
    const projectName = name || `Project ${projectNumber}`;

    // Track creation and modification timestamps (initially the same)
    const lastModified = Date.now();
    const createdAt = Date.now();

    // Persist project to database with all metadata
    const projectId = await ctx.db.insert("projects", {
      userId,
      name: projectName,
      sketchData,
      thumbnail,
      projectNumber,
      lastModified,
      createdAt,
      isPublic: false, // New projects are private by default
    });

    console.log("✅ [Convex] Project created:", {
      projectId,
      name: projectName,
      projectNumber,
    });

    // Return essential metadata for client-side state management
    return {
      projectId,
      name: projectName,
      projectNumber,
      lastModified,
      createdAt,
    };
  },
});

/**
 * Manages per-user project numbering with atomic counter updates.
 *
 * This function implements a sequence generation pattern to ensure each user
 * gets unique, sequential project numbers. The counter is stored in a separate
 * "projects_counters" table and is incremented atomically to prevent race conditions.
 *
 * Strategy:
 * - First project for a user: returns 1, creates counter starting at 2
 * - Subsequent projects: returns current counter value, increments to next number
 *
 * Why a separate counter table instead of counting existing projects?
 * - Performance: O(1) lookup vs O(n) query across all projects
 * - Atomicity: Prevents duplicate numbers in concurrent scenarios
 * - Consistency: Survives project deletions (numbers never decrease or get reused)
 *
 * @param ctx - The mutation context for database access
 * @param userId - The user to get the next project number for
 * @returns The next available project number for this user
 *
 * @example
 * // First call for user123: returns 1, creates counter[nextNumber: 2]
 * const num1 = await getNextProjectNumber(ctx, "user123"); // 1
 *
 * // Second call: returns 2, updates counter[nextNumber: 3]
 * const num2 = await getNextProjectNumber(ctx, "user123"); // 2
 */
async function getNextProjectNumber(
  ctx: MutationCtx,
  userId: string
): Promise<number> {
  // Lookup existing counter for this user using indexed query
  const counter = await ctx.db
    .query("projects_counters")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();

  if (!counter) {
    // First project ever for this user
    // Return 1 and initialize counter to 2 for next project
    await ctx.db.insert("projects_counters", { userId, nextProjectNumber: 2 });
    return 1;
  }

  // Extract the next project number to assign
  const projectNumber = counter.nextProjectNumber;

  // Atomically increment counter for next project creation
  // This happens in a transaction with the project insertion
  await ctx.db.patch(counter._id, { nextProjectNumber: projectNumber + 1 });

  return projectNumber;
}

export const getUserProjects = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, limit = 20 }) => {
    console.log("🚀 [Convex] Getting user projects for user:", { userId });
    console.log("📚 [Convex] Limiting to:", { limit });

    console.log("🔍 [Convex] Querying projects...");
    const allProjects = await ctx.db
      .query("projects")
      .withIndex("by_userId_lastModified", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    console.log("✅ [Convex] Projects fetched:", {
      allProjects: allProjects.length,
    });

    const projects = allProjects.slice(0, limit);

    console.log("📝 [Convex] Projects to return:", {
      projects: projects.length,
    });
    console.log("🔍 [Convex] Returning Projects:", { projects });

    return projects.map((project) => ({
      _id: project._id,
      name: project.name,
      projectNumber: project.projectNumber,
      thumbnail: project.thumbnail,
      lastModified: project.lastModified,
      createdAt: project.createdAt,
      isPublic: project.isPublic,
    }));
  },
});

export const getProjectStyleGuide = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    /**
     * Authenticate the requesting user.
     * Throws a 404 ConvexError if no user is authenticated.
     */
    const user = await ctx.runQuery(api.auth.getCurrentUser, {});

    const project = await ctx.db.get(projectId);

    if (!project) {
      throw new ConvexError({
        code: 404,
        message: "Project not found for this project ID",
        severity: "high",
      });
    }

    // Check ownership or public access
    if (project.userId !== user._id && !project.isPublic) {
      throw new ConvexError({
        code: 403,
        message:
          "Access denied. You are not the owner of this project and the project is not public.",
        severity: "medium",
      });
    }

    return project.styleGuide ? JSON.parse(project.styleGuide) : null;
  },
});
