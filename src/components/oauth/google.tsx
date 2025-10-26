import Google from "../icons/google";
import { Button } from "../ui/button";

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
