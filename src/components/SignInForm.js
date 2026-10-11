"use client";

import { useActionState } from "react";
import { signIn } from "@/app/signin/actions";

const initialState = { ok: false, message: "", values: { phone: "" } };

export default function SignInForm({ next }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-amber-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="next" value={next} />

      {state.message && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-800">
          {state.message}
        </p>
      )}

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-stone-700">
          Phone number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="username"
          defaultValue={state.values.phone}
          className="mt-1 w-full rounded-lg border border-amber-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-stone-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-amber-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-amber-600 px-5 py-3 font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}