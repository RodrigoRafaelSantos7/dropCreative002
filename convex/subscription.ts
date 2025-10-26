import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { autumn } from "./autumn";

/**
 * Checks if the authenticated user has an active entitlement for a specific feature.
 *
 * Queries the Autumn entitlement system to verify whether the current user holds
 * a valid license or subscription for the requested feature. This is the primary
 * guard for premium feature access.
 *
 * @param {string} featureId - The unique identifier of the feature to check
 *                             (e.g., "premium_dashboard", "analytics_export")
 * @returns {boolean} True if the user has an active entitlement, false otherwise
 * @throws {ConvexError} 404 severity - User is not authenticated or session is invalid
 * @throws {ConvexError} 404 severity - Autumn returned an invalid or empty response
 */
export const hasEntitlement = query({
  args: {
    featureId: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, { featureId }) => {
    // Fetch entitlement data from Autumn for the requested feature
    const { data, error } = await autumn.check(ctx, {
      featureId,
    });

    // Reject unauthenticated requests; Autumn sets error when no valid session exists
    if (error) {
      throw new ConvexError({
        code: 404,
        message: "There is no authenticated user. Please sign in to continue.",
        severity: "high",
      });
    }

    // Ensure we received valid entitlement data from Autumn
    if (!data) {
      throw new ConvexError({
        code: 404,
        message: "No data found for entitlement check.",
        severity: "high",
      });
    }

    return data.allowed;
  },
});
