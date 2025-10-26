import { ConvexError, v } from "convex/values";
import { action } from "./_generated/server";
import { autumn } from "./autumn";

/**
 * Checks user entitlement for a feature via Autumn.
 *
 * @param featureId - Feature identifier to check access for
 * @returns True if user has active entitlement
 * @throws ConvexError 404 - User not authenticated or Autumn check failed
 */
export const hasEntitlement = action({
  args: {
    featureId: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, { featureId }) => {
    const { data, error } = await autumn.check(ctx, {
      featureId,
    });

    if (error) {
      throw new ConvexError({
        code: 404,
        message: "There is no authenticated user. Please sign in to continue.",
        severity: "high",
      });
    }

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
