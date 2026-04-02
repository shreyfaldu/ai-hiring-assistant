"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function GoogleAuthButton() {
  return (
    <button
      type="button"
      onClick={() => {
        window.location.href = `${API_URL}/auth/google`;
      }}
      className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-brand-500"
    >
      Continue with Google
    </button>
  );
}
