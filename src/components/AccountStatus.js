"use client";

import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { signOut } from "@/app/signin/actions";

export default function AccountStatus() {
  const { data, isLoading } = useSWR("/api/session", fetcher);

  if (isLoading) {
    return <span className="px-3 py-2 text-sm text-stone-400">…</span>;
  }

  if (!data?.user) {
    return (
      <Link
        href="/signin"
        className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-amber-600 hover:text-white"
      >
        Sign in
      </Link>
    );
  }

    return (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm text-stone-600 sm:inline">
        Hi, {data.user.name.split(" ")[0]}
      </span>
      {data.user.role === "staff" && (
        <Link
          href="/kitchen"
          className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-amber-600 hover:text-white"
        >
          Kitchen
        </Link>
      )}
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-amber-600 hover:text-white"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}