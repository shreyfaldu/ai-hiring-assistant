"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";

function setSessionFromAuth(token: string) {
  localStorage.setItem("hr_token", token);
  document.cookie = `hr_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export default function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [devHint, setDevHint] = useState<string | null>(null);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
    const stored = sessionStorage.getItem("verify_dev_code");
    if (stored) {
      setDevHint(`Development: your code is ${stored} (SMTP not configured).`);
    }
  }, [emailParam]);

  const onVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResendMsg(null);
    setLoading(true);
    try {
      const res = await api.verifyEmail({ email: email.trim(), code: code.trim() });
      setSessionFromAuth(res.token);
      sessionStorage.removeItem("verify_dev_code");
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setError(null);
    setResendMsg(null);
    setLoading(true);
    try {
      const res = await api.resendVerification({ email: email.trim() });
      setResendMsg(res.message);
      if (res.devCode) {
        setDevHint(`Development: new code is ${res.devCode}`);
        sessionStorage.setItem("verify_dev_code", res.devCode);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card w-full max-w-md p-8">
      <h1 className="font-display text-3xl text-ink">Verify your email</h1>
      <p className="mt-2 text-sm text-slate-600">
        Enter the 6-digit code we sent to your inbox. After verification you can open the dashboard.
      </p>
      {devHint && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{devHint}</p>
      )}
      <form className="mt-6 space-y-4" onSubmit={onVerify}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-brand-100 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
        />
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="6-digit code"
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="w-full rounded-xl border border-brand-100 px-4 py-3 text-sm tracking-widest focus:border-brand-500 focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {resendMsg && <p className="text-sm text-green-700">{resendMsg}</p>}
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Please wait..." : "Verify and continue"}
        </button>
      </form>
      <button
        type="button"
        disabled={loading || !email.trim()}
        onClick={onResend}
        className="mt-4 w-full rounded-xl border border-brand-100 px-4 py-3 text-sm font-semibold text-ink hover:bg-slate-50 disabled:opacity-60"
      >
        Resend code
      </button>
      <p className="mt-6 text-center text-sm text-slate-600">
        <Link href="/login" className="font-semibold text-brand-700">
          Back to login
        </Link>
      </p>
    </div>
  );
}
