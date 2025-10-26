import Google from "../icons/google";
import { Button } from "../ui/button";

type GoogleButtonProps = {
  handler: () => void;
};
const GoogleButton = ({ handler }: GoogleButtonProps) => (
  <Button onClick={handler} type="button" variant="outline">
    <Google />
    Continue with Google
  </Button>
);

export { GoogleButton };
