import { preloadQuery } from "convex/nextjs";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { getToken } from "@/lib/auth-server";
import { logger } from "@/lib/logger";
import { type ConvexRawUser, normalizeProfile } from "@/types/user";

const log = logger.child({ module: "ConvexQuery" });

const ProfileQuery = async () => {
  try {
    const token = await getToken();
    return await preloadQuery(api.auth.getCurrentUser, {}, { token });
  } catch (error) {
    log.error(error);
    const errorMessage =
      error instanceof ConvexError
        ? (error.data as { message: string }).message
        : "Unexpected error occurred";
    toast.error(errorMessage);
  }
};

const SubscriptionEntitlementQuery = async () => {
  const rawProfile = await ProfileQuery();
  const profile = normalizeProfile(
    rawProfile?._valueJSON as unknown as ConvexRawUser | null
  );
};

export { SubscriptionEntitlementQuery };
