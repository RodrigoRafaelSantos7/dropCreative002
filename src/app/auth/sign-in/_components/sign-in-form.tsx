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

const SignInForm = () => (
  <form>
    <FieldGroup>
      <FieldSet>
        <FieldLegend>Welcome Back</FieldLegend>
        <FieldDescription>
          Please enter your details to sign in.
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

export { SignInForm };
