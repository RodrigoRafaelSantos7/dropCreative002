import Link from "next/link";
import { SignUpForm } from "@/components/auth/forms/sign-up-form";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { signInPath } from "@/paths";

const Page = () => (
  <section className="flex min-h-dvh w-full items-center justify-center">
    <Card className="mx-4 w-full max-w-sm pb-0 md:mx-auto">
      <CardContent>
        <SignUpForm />
      </CardContent>

      {/* Footer*/}
      <CardFooter className="m-0.5 flex h-16 items-center justify-center rounded-xl border bg-muted">
        <p className="text-accent-foreground text-sm">
          Already have an account ?
          <Link
            className={buttonVariants({ variant: "link", size: "sm" })}
            href={signInPath()}
            prefetch
          >
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  </section>
);

export default Page;
