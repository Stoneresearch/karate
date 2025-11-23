import { SignUp } from '@clerk/nextjs';

const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function Page() {
  if (!pk) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16">
        <div className="text-sm text-zinc-600 dark:text-zinc-300">
          Authentication is disabled. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in frontend/.env.local.
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center py-16">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
      />
    </div>
  );
}


