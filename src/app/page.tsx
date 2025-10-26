import Link from "next/link";

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      Hello World
      <Link href="/auth/sign-in">Sign In</Link>
      <Link href="/auth/sign-up">Sign Up</Link>
    </div>
  );
}
