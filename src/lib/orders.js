import { getDish } from "./dishes";
import { validateOrder } from "./validation";

// In-memory store, kept on globalThis so it survives hot reloads in dev.
const store = globalThis.__addisOrders ?? (globalThis.__addisOrders = new Map());

function publicOrder(order) {
  const { id, status, total, lines, createdAt } = order;
  return { id, status, total, lines, createdAt };
}

export async function createOrder(input, userId) {
  const result = validateOrder(input);
  if (!result.ok) {
    return { ok: false, status: 422, fieldErrors: result.fieldErrors };
  }

  const lines = [];
  for (const { id, qty } of result.data.items) {
    const dish = await getDish(id);
    if (!dish) {
      return { ok: false, status: 422, fieldErrors: { items: `Unknown dish: ${id}` } };
    }
    lines.push({ id: dish.id, name: dish.name, price: dish.price, qty });
  }

  const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  const order = {
    id: `ord_${crypto.randomUUID().slice(0, 8)}`,
    userId,
    name: result.data.name,
    phone: result.data.phone,
    address: result.data.address,
    lines,
    total,
    status: "received",
    createdAt: new Date().toISOString(),
  };

  store.set(order.id, order);
  return { ok: true, status: 201, order: publicOrder(order) };
}

export function getOrder(id) {
  return store.get(id) ?? null;
}

export function markCancelled(id) {
  const order = store.get(id);
  order.status = "cancelled";
  return publicOrder(order);
}

// The query is scoped to userId, not an id the caller supplies —
// so whatever the request says, only the real owner's order can match.
export function getOwnedOrder(id, userId) {
  const order = store.get(id);
  if (!order) {
    return { ok: false, status: 404, error: "Order not found" };
  }
  if (!userId || order.userId !== userId) {
    return { ok: false, status: 403, error: "Not allowed" };
  }
  return { ok: true, order: publicOrder(order) };
}

// Powers the /orders list page — always scoped to the session's own id.
export function getOrdersForUser(userId) {
  return [...store.values()]
    .filter((order) => order.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(publicOrder);
}