"use client";

import { API_URL } from "@/lib/api";

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
