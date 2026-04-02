"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { api, isApiError } from "@/lib/api";

type Mode = "login" | "signup";

function setSessionFromAuth(token: string) {
  localStorage.setItem("hr_token", token);
  document.cookie = `hr_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const name = String(formData.get("name") || "");

    try {
      if (mode === "signup") {
        const res = await api.signup({ name, email, password });
        if ("token" in res) {
          setSessionFromAuth(res.token);
          router.push("/dashboard");
          return;
        }
        const pending = res;
        if (pending.devCode) {
          sessionStorage.setItem("verify_dev_code", pending.devCode);
        } else {
          sessionStorage.removeItem("verify_dev_code");
        }
        router.push(`/verify-email?email=${encodeURIComponent(pending.email)}`);
        return;
      }

      const res = await api.login({ email, password });
      setSessionFromAuth(res.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (isApiError(err) && err.status === 403 && err.payload?.code === "EMAIL_NOT_VERIFIED") {
        const em = typeof err.payload.email === "string" ? err.payload.email : email;
        router.push(`/verify-email?email=${encodeURIComponent(em)}`);
        setError("Please verify your email. We sent you to the verification page.");
        return;
      }
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card w-full max-w-md p-8">
      <h1 className="font-display text-3xl text-ink">{mode === "signup" ? "Create account" : "Welcome back"}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {mode === "signup"
          ? "Sign up, verify your email, then sign in anytime."
          : "Sign in to manage jobs, candidates, and your hiring pipeline."}
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        {mode === "signup" && (
          <input
            name="name"
            placeholder="Full name"
            required
            className="w-full rounded-xl border border-brand-100 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
          />
        )}
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full rounded-xl border border-brand-100 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          minLength={6}
          className="w-full rounded-xl border border-brand-100 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Please wait..." : mode === "signup" ? "Sign up" : "Login"}
        </button>
      </form>
      <div className="my-4 h-px bg-brand-100" />
      <GoogleAuthButton />
      <p className="mt-4 text-sm text-slate-600">
        {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
        <Link className="font-semibold text-brand-700" href={mode === "signup" ? "/login" : "/signup"}>
          {mode === "signup" ? "Login" : "Sign up"}
        </Link>
      </p>
    </div>
  );
}
