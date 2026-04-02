import { Suspense } from "react";
import OAuthCallbackClient from "./OAuthCallbackClient";

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center px-4">
          <p className="text-sm text-slate-600">Signing you in...</p>
        </main>
      }
    >
      <OAuthCallbackClient />
    </Suspense>
  );
}
