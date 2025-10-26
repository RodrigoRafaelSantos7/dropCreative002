import Google from "@/components/icons/google";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const SignUpForm = () => (
  <form>
    <FieldGroup>
      <FieldSet>
        <FieldLegend>Create a DropCreative Account</FieldLegend>
        <FieldDescription>
          Welcome! Create an account to get started
        </FieldDescription>

        <Field>
          <Button type="button" variant="outline">
            <Google />
            Login with Google
          </Button>
        </Field>

        <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
          Or continue with
        </FieldSeparator>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" placeholder="m@example.com" required type="email" />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" required type="password" />
        </Field>

        <Button className="w-full">Continue</Button>
      </FieldSet>
    </FieldGroup>
  </form>
);

export { SignUpForm };
