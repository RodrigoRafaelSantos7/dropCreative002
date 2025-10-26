import { preloadQuery } from "convex/nextjs";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import { getToken } from "@/lib/auth-server";
import { logger } from "@/lib/logger";
import { type ConvexRawUser, normalizeProfile } from "@/types/user";

const log = logger.child({ module: "ConvexQuery" });

/**
 * Fetches and preloads the current authenticated user's profile.
 *
 * Retrieves a fresh authentication token and queries the server for the
 * authenticated user's profile data. The result is preloaded for optimal
 * performance in client components. Comprehensive error handling ensures
 * user-friendly error messages are displayed.
 *
 * @returns Preloaded profile data for the authenticated user
 * @throws {ConvexError} 500 severity - Token retrieval failed or profile fetch failed
 *
 * @side-effects
 *   - Logs token retrieval and profile fetch events for debugging
 *   - Displays error toast notifications on failure
 */
const ProfileQuery = async () => {
  try {
    // Obtain fresh authentication token for secure server communication
    log.info("Fetching token");
    const token = await getToken();
    log.info("Token fetched successfully");

    // Preload user profile from the server using authenticated token
    const profile = await preloadQuery(api.auth.getCurrentUser, {}, { token });
    log.info("Profile fetched successfully");
    return profile;
  } catch (error) {
    // Capture and log the error for troubleshooting
    log.error(error);

    // Extract error message; provide sensible default for non-Convex errors
    const errorMessage =
      error instanceof ConvexError
        ? (error.data as { message: string }).message
        : "Unexpected error occurred";

    // Wrap error in ConvexError for consistent error handling upstream
    throw new ConvexError({
      code: 500,
      message: errorMessage,
      severity: "high",
    });
  }
};

/**
 * Fetches user profile and validates entitlement for a specific premium feature.
 *
 * Orchestrates a multi-step process: obtains auth token, loads user profile,
 * normalizes profile data, and verifies feature entitlement via Autumn.
 * Returns both entitlement status and user name for permission-based UI rendering.
 *
 * @param {string} featureId - The unique identifier of the feature to check access for
 *                             (e.g., "premium_dashboard", "analytics_export")
 * @returns Object containing entitlement status and user profile name
 * @throws {ConvexError} 500 severity - Profile fetch, normalization, or entitlement check fails
 *
 * @side-effects
 *   - Logs each step of the entitlement check flow
 *   - Displays error toast on failure
 *   - Calls ProfileQuery which has its own side effects
 */
const SubscriptionEntitlementQuery = async (featureId: string) => {
  try {
    // Obtain fresh authentication token for server requests
    log.info("Fetching token");
    const token = await getToken();
    log.info("Token fetched successfully");

    // Load user profile data
    log.info("Fetching profile");
    const rawProfile = await ProfileQuery();
    log.info("Profile fetched successfully");

    // Transform raw profile into type-safe normalized format for consumption
    log.info("Normalizing profile");
    const profile = normalizeProfile(
      rawProfile?._valueJSON as unknown as ConvexRawUser | null
    );
    log.info("Profile normalized successfully");

    // Query Autumn system to verify user's entitlement for the requested feature
    log.info("Fetching entitlement");
    const entitlement = await preloadQuery(
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
    // Capture and log error for troubleshooting
    log.error(error);

    // Extract error message; provide sensible default for non-Convex errors
    const errorMessage =
      error instanceof ConvexError
        ? (error.data as { message: string }).message
        : "Unexpected error occurred";

    // Wrap error in ConvexError for consistent error handling upstream
    throw new ConvexError({
      code: 500,
      message: errorMessage,
      severity: "high",
    });
  }
};

export { SubscriptionEntitlementQuery };
