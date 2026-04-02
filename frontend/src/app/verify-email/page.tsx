import { Suspense } from "react";
import VerifyEmailForm from "./VerifyEmailForm";

export default function VerifyEmailPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-10">
      <Suspense
        fallback={
          <div className="card w-full max-w-md p-8 text-center text-sm text-slate-600">Loading…</div>
        }
      >
        <VerifyEmailForm />
      </Suspense>
    </main>
  );
}
