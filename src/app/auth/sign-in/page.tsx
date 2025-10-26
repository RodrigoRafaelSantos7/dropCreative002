import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { signUpPath } from "@/paths";
import { SignInForm } from "./_components/sign-in-form";

const Page = () => (
  <section className="flex min-h-dvh w-full items-center justify-center">
    <Card className="mx-4 w-full max-w-sm pb-0 md:mx-auto">
      <CardContent>
        <SignInForm />
      </CardContent>

      {/* Footer*/}
      <CardFooter className="m-0.5 flex h-16 items-center justify-center rounded-xl border bg-muted">
        <p className="text-accent-foreground text-sm">
          Don't have an account ?
          <Link
            className={buttonVariants({ variant: "link", size: "sm" })}
            href={signUpPath()}
            prefetch
          >
            Sign Up
          </Link>
        </p>
      </CardFooter>
    </Card>
  </section>
);

export default Page;
