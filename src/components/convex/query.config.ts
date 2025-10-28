import { fetchAction, preloadQuery } from "convex/nextjs";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getToken } from "@/lib/auth-server";
import { logger } from "@/lib/logger";
import { type ConvexRawUser, normalizeProfile } from "@/types/user";

const log = logger.child({ module: "ConvexQuery" });

/**
 * Retrieves authenticated user profile with error handling.
 * Used for preloading user data in server components.
 */
const ProfileQuery = async () => {
  try {
    log.info("Fetching token");
    const token = await getToken();
    log.info("Token fetched successfully");

    const profile = await preloadQuery(api.auth.getCurrentUser, {}, { token });
    log.info("Profile fetched successfully");
    return profile;
  } catch (error) {
    log.error(error);

    const errorMessage =
      error instanceof ConvexError
        ? (error.data as { message: string }).message
        : "Unexpected error occurred";

    log.error(errorMessage);
    return null;
  }
};

/**
 * Checks feature entitlement for the current user.
 * Normalizes profile data before calling Autumn to ensure consistent schema.
 *
 * @param featureId - Autumn feature identifier
 * @returns Entitlement status and user name
 * @throws ConvexError on auth, fetch, or entitlement check failures
 */
const SubscriptionEntitlementQuery = async (featureId: string) => {
  try {
    log.info("Fetching token");
    const token = await getToken();
    log.info("Token fetched successfully");

    log.info("Fetching profile");
    const rawProfile = await ProfileQuery();
    log.info("Profile fetched successfully");

    log.info("Normalizing profile");
    const profile = normalizeProfile(
      rawProfile?._valueJSON as unknown as ConvexRawUser | null
    );
    log.info("Profile normalized successfully");

    log.info("Fetching entitlement");
    const entitlement = await fetchAction(
      api.subscription.hasEntitlement,
      {
        featureId,
      },
      {
        token,
      }
    );
    log.info("Entitlement fetched successfully");

    return { entitlement, profileName: profile?.name };
  } catch (error) {
    log.error(error);

    const errorMessage =
      error instanceof ConvexError
        ? (error.data as { message: string }).message
        : "Unexpected error occurred";

    throw new ConvexError({
      code: 500,
      message: errorMessage,
      severity: "high",
    });
  }
};

const ProjectsQuery = async () => {
  try {
    log.info("Starting ProjectsQuery");
    log.info("Fetching profile");
    const rawProfile = await ProfileQuery();
    log.info("Profile fetched successfully");

    log.info("Normalizing profile");
    const profile = normalizeProfile(
      rawProfile?._valueJSON as unknown as ConvexRawUser | null
    );
    log.info("Profile normalized successfully");

    if (!profile) {
      log.error("Profile not found");
      return { projects: null, profile: null };
    }

    log.info("Fetching token");
    const token = await getToken();
    log.info("Token fetched successfully");

    log.info("Fetching User Projects from Convex");
    const projects = await preloadQuery(
      api.projects.getUserProjects,
      {
        userId: profile.id,
      },
      { token }
    );
    log.info("User Projects fetched successfully");
    return { projects, profile };
  } catch (error) {
    log.error(error);

    const errorMessage =
      error instanceof ConvexError
        ? (error.data as { message: string }).message
        : "Unexpected error occurred";

    throw new ConvexError({
      code: 500,
      message: errorMessage,
      severity: "high",
    });
  }
};

const StyleGuideQuery = async (projectId: string) => {
  try {
    log.info("Starting StyleGuideQuery");

    log.info("Fetching token");
    const token = await getToken();
    log.info("Token fetched successfully");

    log.info("Fetching project");
    const styleGuide = await preloadQuery(
      api.projects.getProjectStyleGuide,
      {
        projectId: projectId as Id<"projects">,
      },
      { token }
    );

    log.info(`StyleGuide fetched successfully for project ${projectId}`);
    return { styleGuide };
  } catch (error) {
    log.error(error);

    const errorMessage =
      error instanceof ConvexError
        ? (error.data as { message: string }).message
        : "Unexpected error occurred";

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
};
