"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createOrder, getOrder, markCancelled } from "@/lib/orders";

export async function placeOrder(prevState, formData) {
  // Authentication: re-checked here, since middleware only proved a
  // cookie exists, nothing more. If the session expired mid-checkout,
  // this sends the person back to sign in rather than trusting the form.
  const session = await getSession();
  if (!session) {
    redirect("/signin?next=/checkout");
  }

  let items = [];
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    items = [];
  }

  const values = {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    address: String(formData.get("address") ?? ""),
  };

  const result = await createOrder({ ...values, items }, session.id);

  if (!result.ok) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: result.fieldErrors,
      values,
    };
  }
  return { ok: true, message: "Order placed!", order: result.order };
}

// Authentication, then authorisation — two different questions.
// Passing the first tells you nothing about the second.
export async function cancelOrder(orderId) {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: "Not signed in" };
  }

  const order = getOrder(String(orderId));
  if (!order) {
    return { ok: false, error: "Order not found" };
  }
  if (order.userId !== session.id) {
    return { ok: false, error: "Not allowed" };
  }
  return { ok: true, order: markCancelled(order.id) };
}