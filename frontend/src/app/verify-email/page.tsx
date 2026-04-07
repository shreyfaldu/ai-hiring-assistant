import { Suspense } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import VerifyEmailForm from "./VerifyEmailForm";

export default function VerifyEmailPage() {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center bg-app-page px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Suspense
        fallback={
          <div className="card w-full max-w-md p-8 text-center text-sm text-app-muted">Loading…</div>
        }
      >
        <VerifyEmailForm />
      </Suspense>
    </main>
  );
}
