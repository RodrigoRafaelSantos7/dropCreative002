import { CheckoutDialog, useCustomer } from "autumn-js/react";
import { Button } from "@/components/ui/button";

const UpgradeButton = () => {
  const { checkout } = useCustomer();
  return (
    <Button
      onClick={() =>
        checkout({
          productId: "pro",
          dialog: CheckoutDialog,
        })
      }
    >
      Upgrade to Pro
    </Button>
  );
};

export { UpgradeButton };
