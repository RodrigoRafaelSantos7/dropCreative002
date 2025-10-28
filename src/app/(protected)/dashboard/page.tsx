import { redirect } from "next/navigation";
import { SubscriptionEntitlementQuery } from "@/components/convex/query.config";
import { combinedSlug } from "@/lib/utils";
import { billingPath, userDashboardPath } from "@/paths";

const Page = async () => {
  const { entitlement, profileName } =
    await SubscriptionEntitlementQuery("premium_dashboard");

  // TODO: Add a better error handling here/see what we can do with the error
  if (!profileName) {
    throw new Error("Profile name not found");
  }

  if (!entitlement) {
    redirect(billingPath(combinedSlug(profileName)));
  }

  redirect(userDashboardPath(combinedSlug(profileName)));
};

export default Page;
