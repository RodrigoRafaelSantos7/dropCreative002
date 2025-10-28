import { fetchAction, preloadQuery } from "convex/nextjs";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
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

export { ProfileQuery, SubscriptionEntitlementQuery };
