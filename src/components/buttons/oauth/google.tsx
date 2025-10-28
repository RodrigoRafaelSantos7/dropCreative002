import Google from "@/components/icons/google";
import { Button } from "@/components/ui/button";

type GoogleButtonProps = {
  handler: () => void;
  label: string;
};
const GoogleButton = ({ handler, label }: GoogleButtonProps) => (
  <Button onClick={handler} type="button" variant="outline">
    <Google />
    {label}
  </Button>
);

export { GoogleButton };
