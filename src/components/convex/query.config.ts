"use server";

import { fetchAction, preloadQuery } from "convex/nextjs";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getToken } from "@/lib/auth-server";
import { logger } from "@/lib/logger";
import { type ConvexRawUser, normalizeProfile } from "@/types/user";

const log = logger.child({ module: "ConvexQuery" });

/**
 * Fetches the authenticated user's profile data for server-side preloading.
 *
 * Base query function that retrieves the current authenticated user's profile from
 * Convex, enabling SSR hydration without client-side data fetching. This is the
 * foundational query used by other functions that require user context.
 *
 * @returns Preloaded query handle for the current user profile, or null if
 *          authentication fails or token is invalid. Returns null instead of
 *          throwing to allow callers to handle unauthenticated states gracefully.
 *
 * @remarks
 * - Uses server-side token extraction to authenticate the Convex query
 * - Returns a preload query handle (not resolved data) for reactive client updates
 * - Gracefully degrades to null on auth failures rather than throwing errors
 * - This null-return pattern allows downstream functions to check authentication
 *   without try-catch blocks
 */
const ProfileQuery = async () => {
  try {
    const profile = await preloadQuery(
      api.auth.getCurrentUser,
      {},
      { token: await getToken() }
    );
    return profile;
  } catch (error) {
    let errorMessage = "Unexpected error occurred";
    if (error instanceof ConvexError || error instanceof Error) {
      errorMessage = error.message;
    }

    log.error({ error, errorMessage }, "Failed to fetch user profile");
    return null;
  }
};

/**
 * Verifies whether the authenticated user has access to a specific feature via Autumn.
 *
 * Orchestrates entitlement checking by first fetching and normalizing the user profile,
 * then querying the Autumn subscription service to determine feature access. This enables
 * feature gating and paywall enforcement throughout the application.
 *
 * Uses `fetchAction` instead of `preloadQuery` because entitlement checks require
 * server-side execution to access Autumn's billing APIs and cannot be preloaded for
 * client-side reactivity.
 *
 * @param featureId - Autumn feature identifier (e.g., "premium", "pro-plan", "unlimited-export").
 *                    Must match a feature defined in the Autumn subscription configuration.
 * @returns Object containing entitlement boolean and optional profile name for user context.
 * @throws ConvexError with 500 status if authentication fails, profile fetch fails,
 *         or the entitlement check encounters an error. Unlike ProfileQuery, this function
 *         throws on failures to ensure entitlement checks are never silently ignored.
 *
 * @remarks
 * - Profile normalization ensures consistent schema between Convex user data and Autumn
 * - fetchAction is used because Autumn checks require server-side Node.js runtime
 * - Returns profileName for UI personalization even when entitlement is false
 * - Throwing on errors ensures UI can distinguish between "no access" and "check failed"
 */
const SubscriptionEntitlementQuery = async (featureId: string) => {
  try {
    const rawProfile = await ProfileQuery();

    if (!rawProfile) {
      throw new ConvexError({
        code: 404,
        message: "User profile not found. Please sign in to continue.",
        severity: "high",
      });
    }

    const profile = normalizeProfile(
      rawProfile?._valueJSON as unknown as ConvexRawUser | null
    );

    if (!profile) {
      throw new ConvexError({
        code: 500,
        message: "Failed to normalize user profile",
        severity: "high",
      });
    }

    const entitlement = await fetchAction(
      api.subscription.hasEntitlement,
      {
        featureId,
      },
      {
        token: await getToken(),
      }
    );

    return { entitlement, profileName: profile?.name };
  } catch (error) {
    if (error instanceof ConvexError) {
      log.error({ error, featureId }, "Entitlement check failed");
      throw error;
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unexpected error occurred";

    log.error({ error, featureId, errorMessage }, "Entitlement check failed");

    throw new ConvexError({
      code: 500,
      message: errorMessage,
      severity: "high",
    });
  }
};

/**
 * Preloads user projects and profile data for server-side rendering.
 *
 * Orchestrates a two-step query: first fetching and normalizing the authenticated
 * user profile, then loading all projects associated with that user. This enables
 * efficient data hydration in Next.js server components without client-side waterfalls.
 *
 * @returns Object containing preloaded projects query and normalized profile, or
 *          { projects: null, profile: null } if user is not authenticated.
 *          Note: Returns null values instead of throwing to allow graceful degradation
 *          in UI components that may handle unauthenticated states.
 * @throws ConvexError with 500 status if profile fetch succeeds but projects query fails,
 *         ensuring that partial data states are never returned.
 *
 * @remarks
 * - Profile normalization ensures consistent schema before downstream queries
 * - Token is fetched after profile validation to avoid unnecessary auth overhead
 * - Projects are preloaded as a Convex query handle for reactive client-side updates
 */
const ProjectsQuery = async () => {
  try {
    const rawProfile = await ProfileQuery();
    const profile = normalizeProfile(
      rawProfile?._valueJSON as unknown as ConvexRawUser | null
    );

    if (!profile) {
      log.warn("User profile not found, returning null projects");
      return { projects: null, profile: null };
    }

    const projects = await preloadQuery(
      api.projects.getUserProjects,
      {
        userId: profile.id,
      },
      { token: await getToken() }
    );

    return { projects, profile };
  } catch (error) {
    if (error instanceof ConvexError) {
      log.error({ error }, "Failed to fetch user projects");
      throw error;
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unexpected error occurred";

    log.error({ error, errorMessage }, "Failed to fetch user projects");

    throw new ConvexError({
      code: 500,
      message: errorMessage,
      severity: "high",
    });
  }
};

/**
 * Preloads style guide configuration for a specific project.
 *
 * Fetches the design system and style tokens associated with the given project ID,
 * enabling server-side preloading for workspace pages. The style guide includes
 * design tokens, color palettes, typography scales, and component configuration
 * that drive the visual consistency across the design canvas.
 *
 * @param projectId - String identifier of the project (cast to Convex Id type internally).
 *                    Must correspond to an existing project in the database.
 * @returns Object containing preloaded style guide query handle for reactive updates.
 * @throws ConvexError with 500 status if authentication fails, project doesn't exist,
 *         or user lacks permission to access the project's style guide.
 *
 * @remarks
 * - Accepts string parameter for flexibility but casts to typed Id for type safety
 * - Token-based auth ensures user has access rights to the requested project
 * - Style guide is returned as a preloaded query handle for automatic reactivity
 * - Does not validate project existence before query (Convex query will handle this)
 */
const StyleGuideQuery = async (projectId: string) => {
  try {
    const styleGuide = await preloadQuery(
      api.projects.getProjectStyleGuide,
      {
        projectId: projectId as Id<"projects">,
      },
      { token: await getToken() }
    );

    return { styleGuide };
  } catch (error) {
    if (error instanceof ConvexError) {
      log.error({ error, projectId }, "Failed to fetch style guide");
      throw error;
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unexpected error occurred";

    log.error(
      { error, projectId, errorMessage },
      "Failed to fetch mood board images"
    );

    throw new ConvexError({
      code: 500,
      message: errorMessage,
      severity: "high",
    });
  }
};
/**
 * Preloads mood board images for a specific project.
 *
 * Fetches the image collection associated with the given project ID,
 * enabling server-side preloading for workspace pages. The mood board includes
 * visual references and inspiration images that drive the design
 * process and visual consistency across the design canvas.
 *
 * @param {string} projectId - String identifier of the project (cast to Convex Id type internally).
 *                    Must correspond to an existing project in the database.
 * @returns Object containing preloaded mood board images query handle for reactive updates.
 * @throws ConvexError with 500 status if authentication fails, project doesn't exist,
 *         or user lacks permission to access the project's mood board images.
 *
 * @remarks
 * - Accepts string parameter for flexibility but casts to typed Id for type safety
 * - Token-based auth ensures user has access rights to the requested project
 * - Images are returned as a preloaded query handle for automatic reactivity
 * - Does not validate project existence before query (Convex query will handle this)
 */
const MoodBoardImagesQuery = async (projectId: string) => {
  try {
    const images = await preloadQuery(
      api.moodboard.getMoodBoardImages,
      {
        projectId: projectId as Id<"projects">,
      },
      { token: await getToken() }
    );

    return { images };
  } catch (error) {
    if (error instanceof ConvexError) {
      log.error({ error, projectId }, "Failed to fetch mood board images");
      throw error;
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unexpected error occurred";

    log.error(
      { error, projectId, errorMessage },
      "Failed to fetch style guide"
    );

    throw new ConvexError({
      code: 500,
      message: errorMessage,
      severity: "high",
    });
  }
};
export {
  ProfileQuery,
  SubscriptionEntitlementQuery,
  ProjectsQuery,
  StyleGuideQuery,
  MoodBoardImagesQuery,
};
