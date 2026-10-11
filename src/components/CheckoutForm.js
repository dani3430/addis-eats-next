"use client";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { placeOrder, cancelOrder } from "@/app/actions";
import { useCart } from "./Providers";

const initialState = {
  ok: false,
  message: "",
  fieldErrors: {},
  values: { name: "", phone: "", address: "" },
};

function Field({ id, label, type = "text", defaultValue, error, autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-stone-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-1 w-full rounded-lg border px-3 py-2.5 transition focus:outline-none focus:ring-2 focus:ring-amber-500 ${
          error
            ? "border-red-400 bg-red-50"
            : "border-amber-300 bg-white hover:border-amber-400"
        }`}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export default function CheckoutForm({ items }) {
  const [state, formAction, pending] = useActionState(placeOrder, initialState);
  const { dispatch } = useCart();
  const [cancelResult, setCancelResult] = useState(null);

  // After a successful order, empty the cart and expire the checkout cookie.
  useEffect(() => {
    if (state.ok) {
      dispatch({ type: "clear" });
      document.cookie = "addis-cart=; path=/; max-age=0";
    }
  }, [state.ok, dispatch]);

  async function handleCancel() {
    setCancelResult(await cancelOrder(state.order.id));
  }

  if (state.ok) {
    const cancelled = cancelResult?.ok;
    return (
      <div
        role="status"
        className="rounded-xl border border-green-300 bg-green-50 p-6 text-center sm:text-left"
      >
        <p className="text-4xl">✅</p>
        <h2 className="mt-2 text-xl font-bold text-green-800">{state.message}</h2>
        <dl className="mt-4 space-y-1 text-sm text-green-900">
          <div className="flex justify-between gap-4">
            <dt>Order</dt>
            <dd className="font-semibold">{state.order.id}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Total</dt>
            <dd className="font-semibold">{state.order.total} ETB</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Status</dt>
            <dd className="font-semibold capitalize">
              {cancelled ? "cancelled" : state.order.status}
            </dd>
          </div>
        </dl>
<Link
  href={`/orders/${state.order.id}`}
  className="mt-4 inline-block text-sm font-medium text-amber-700 underline"
>
  Track this order →
</Link>
        {!cancelled && (
          <button
            type="button"
            onClick={handleCancel}
            className="mt-5 rounded-lg border-2 border-red-600 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            Cancel this order
          </button>
        )}
        {cancelResult && !cancelResult.ok && (
          <p role="alert" className="mt-2 text-sm font-medium text-red-700">
            {cancelResult.error}
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      className="space-y-5 rounded-xl border border-amber-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      {state.message && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-800">
          {state.message}
        </p>
      )}
      {state.fieldErrors.items && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {state.fieldErrors.items}
        </p>
      )}

      <Field id="name" label="Full name" autoComplete="name"
        defaultValue={state.values.name} error={state.fieldErrors.name} />
      <Field id="phone" label="Phone number" type="tel" autoComplete="tel"
        defaultValue={state.values.phone} error={state.fieldErrors.phone} />
      <Field id="address" label="Delivery address" autoComplete="street-address"
        defaultValue={state.values.address} error={state.fieldErrors.address} />

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-amber-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-amber-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Placing order…" : "Place order"}
      </button>
    </form>
  );
}