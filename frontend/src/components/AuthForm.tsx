"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { api, API_URL, isApiError } from "@/lib/api";

type Mode = "login" | "signup";

function setSessionFromAuth(token: string) {
  localStorage.setItem("hr_token", token);
  document.cookie = `hr_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#00a4ef" d="M13 1h10v10H13z" />
      <path fill="#7fba00" d="M1 13h10v10H1z" />
      <path fill="#ffb900" d="M13 13h10v10H13z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  );
}

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-[#14221c] placeholder:text-slate-400 outline-none transition focus:border-[#9bc73a] focus:ring-2 focus:ring-[#c4f542]/35 dark:border-app-border dark:bg-app-input dark:text-app-text dark:placeholder:text-app-muted dark:focus:border-app-accent dark:focus:ring-app-accent/30";

  return (
    <div className="mx-auto w-full max-w-[400px]">
      <Link href="/" className="mb-10 flex items-center justify-center gap-2.5">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c4f542] shadow-sm">
          <svg className="h-6 w-6 text-[#14221c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </span>
        <span className="text-[1.35rem] font-semibold tracking-tight text-[#14221c] dark:text-app-text">hiring assistant</span>
      </Link>

      <h1 className="text-center text-3xl font-bold tracking-tight text-[#14221c] dark:text-app-text">
        {mode === "signup" ? "Create account" : "Log in"}
      </h1>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        {mode === "signup" && (
          <input
            name="name"
            placeholder="Full name"
            required
            autoComplete="name"
            className={inputClass}
          />
        )}
        <input
          name="email"
          type="email"
          placeholder="Email address"
          required
          autoComplete="email"
          className={inputClass}
        />
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-app-hover"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
        {error && <p className="text-center text-sm text-red-600 dark:text-app-danger">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#c4f542] py-3.5 text-sm font-semibold text-[#14221c] shadow-sm transition hover:bg-[#b8e836] disabled:opacity-60"
        >
          {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500 dark:text-app-muted">
        {mode === "signup" ? "or sign up with" : "or log in with"}
      </p>
      <div className="mt-4 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            window.location.href = `${API_URL}/auth/google`;
          }}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#c5edd4] bg-[#e8f8ec] text-[#14221c] transition hover:border-[#9dd9b8] hover:bg-[#dcf5e4] dark:border-app-border dark:bg-app-surface-2 dark:text-app-text dark:hover:border-app-border-strong dark:hover:bg-app-hover"
          aria-label="Continue with Google"
        >
          <GoogleIcon />
        </button>
        <button
          type="button"
          disabled
          title="Coming soon"
          className="flex h-12 w-12 cursor-not-allowed items-center justify-center rounded-xl border border-slate-200 bg-slate-50 opacity-45 dark:border-app-border dark:bg-app-surface-2"
          aria-label="Microsoft (coming soon)"
        >
          <MicrosoftIcon />
        </button>
        <button
          type="button"
          disabled
          title="Coming soon"
          className="flex h-12 w-12 cursor-not-allowed items-center justify-center rounded-xl border border-slate-200 bg-slate-50 opacity-45 dark:border-app-border dark:bg-app-surface-2"
          aria-label="GitHub (coming soon)"
        >
          <GitHubIcon />
        </button>
      </div>

      <p className="mt-10 text-center text-xs leading-relaxed text-slate-500 dark:text-app-muted">
        {mode === "signup" ? "By creating an account" : "By logging in"}, you agree to Hiring Assistant&apos;s{" "}
        <Link href="#" className="font-medium text-[#0f6b4a] underline-offset-2 hover:underline dark:text-app-success">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="#" className="font-medium text-[#0f6b4a] underline-offset-2 hover:underline dark:text-app-success">
          Privacy Policy
        </Link>
        .
      </p>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-app-muted">
        {mode === "signup" ? "Have an account? " : "Don&apos;t have an account? "}
        <Link
          href={mode === "signup" ? "/login" : "/signup"}
          className="font-semibold text-[#0f6b4a] hover:underline dark:text-app-nav-active-text"
        >
          {mode === "signup" ? "Log in" : "Sign up"}
        </Link>
      </p>
    </div>
  );
}
