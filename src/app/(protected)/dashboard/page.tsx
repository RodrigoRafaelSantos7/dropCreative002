import { SignOutButton } from "@/components/auth/sign-out-button";
import { PricingTable } from "@/components/autumn/pricing-table";
import { UpgradeButton } from "@/components/autumn/upgrade-button";
import { SubscriptionEntitlementQuery } from "@/components/convex/query.config";

// TODO: Add a subscription billing logic here
const Page = async () => {
  const { entitlement } =
    await SubscriptionEntitlementQuery("premium_dashboard");

  if (!entitlement) {
    return (
      <div>
        You do not have access to this feature. Please upgrade to a paid plan.
        <UpgradeButton />
        <PricingTable />
      </div>
    );
  }
  return (
    <div>
      Dashboard
      <SignOutButton />
    </div>
  );
};

export default Page;
