import type { GenericCtx } from "@convex-dev/better-auth";
import { Autumn } from "@useautumn/convex";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";

export const autumn = new Autumn(components.autumn, {
  secretKey: process.env.AUTUMN_SECRET_KEY ?? "",
  identify: async (ctx: GenericCtx<DataModel>) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      return null;
    }

    return {
      customerId: user.subject as string,
      customerData: {
        name: user.name as string,
        email: user.email as string,
      },
    };
  },
});

export const {
  track,
  cancel,
  query,
  attach,
  check,
  checkout,
  usage,
  setupPayment,
  createCustomer,
  listProducts,
  billingPortal,
  createReferralCode,
  redeemReferralCode,
  createEntity,
  getEntity,
} = autumn.api();
