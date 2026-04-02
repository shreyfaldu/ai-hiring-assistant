"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("hr_token", token);
      document.cookie = `hr_token=${token}; path=/`;
      router.replace("/dashboard");
      return;
    }

    router.replace("/login?error=oauth_failed");
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <p className="text-sm text-slate-600">Signing you in...</p>
    </main>
  );
}
