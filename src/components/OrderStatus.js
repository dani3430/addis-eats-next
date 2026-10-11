"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { cancelOrder } from "@/app/actions";

export default function OrderStatus({ id, initial }) {
  // fallbackData is the server-rendered order: no spinner on first paint.
  // refreshInterval polls every 5s, as the sheet requires.
  const { data, error, isLoading, mutate } = useSWR(`/api/orders/${id}`, fetcher, {
    fallbackData: initial,
    refreshInterval: 5000,
  });
  const [cancelling, setCancelling] = useState(false);

  if (error) {
    return (
      <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
        Could not load this order.
      </p>
    );
  }
  if (isLoading && !data) {
    return <p className="text-stone-500">Loading order…</p>;
  }

  const order = data.order;

  async function handleCancel() {
    setCancelling(true);
    const result = await cancelOrder(order.id);
    if (result.ok) {
      // Tell the cache what changed now, instead of waiting up to 5s for the next poll.
      mutate({ order: result.order }, false);
    }
    setCancelling(false);
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Order {order.id}</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
            order.status === "cancelled"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {order.status}
        </span>
      </div>

      <ul className="mt-4 divide-y divide-amber-100 text-sm">
        {order.lines.map((line) => (
          <li key={line.id} className="flex justify-between py-2">
            <span>{line.qty} × {line.name}</span>
            <span className="tabular-nums">{line.price * line.qty} ETB</span>
          </li>
        ))}
      </ul>

      <p className="mt-3 flex justify-between border-t border-amber-200 pt-3 font-bold">
        <span>Total</span>
        <span className="text-amber-700">{order.total} ETB</span>
      </p>

      {order.status !== "cancelled" && (
        <button
          type="button"
          onClick={handleCancel}
          disabled={cancelling}
          className="mt-5 rounded-lg border-2 border-red-600 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
        >
          {cancelling ? "Cancelling…" : "Cancel this order"}
        </button>
      )}

      <p className="mt-4 text-xs text-stone-400">
        This page refreshes automatically every 5 seconds.
      </p>
    </div>
  );
}