import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getOrdersForUser } from "@/lib/orders";
export const metadata = {
  title: "Your orders",
  description: "See the orders you have placed with Addis Eats.",
};

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) {
    redirect("/signin?next=/orders");
  }

  const orders = getOrdersForUser(session.id);

  return (
    <section>
      <h1 className="mb-5 text-2xl font-bold">Your orders</h1>
      {orders.length === 0 ? (
        <p className="text-stone-500">You haven&apos;t placed any orders yet.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white p-4 shadow-sm transition hover:border-amber-400"
              >
                <span className="font-medium">{order.id}</span>
                <span className="text-sm capitalize text-stone-500">{order.status}</span>
                <span className="font-semibold">{order.total} ETB</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}