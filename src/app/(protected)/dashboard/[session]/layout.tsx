import { redirect } from "next/navigation";
import { SubscriptionEntitlementQuery } from "@/components/convex/query.config";
import Navbar from "@/components/navbar";
import { combinedSlug } from "@/lib/utils";
import { billingPath } from "@/paths";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = async ({ children }: LayoutProps) => {
  const { profileName, entitlement } =
    await SubscriptionEntitlementQuery("premium_dashboard");

  if (!profileName) {
    throw new Error("Profile name not found");
  }

  if (!entitlement) {
    redirect(billingPath(combinedSlug(profileName)));
  }
  return (
    <main className="grid grid-cols-1">
      <Navbar />
      {children}
    </main>
  );
};

export default Layout;
