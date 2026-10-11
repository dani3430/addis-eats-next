import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
export const metadata = {
  title: "Kitchen",
  description: "Staff view of incoming Addis Eats orders.",
};

export default async function KitchenPage() {
  const session = await getSession();

  // Authentication first: who is this?
  if (!session) {
    redirect("/signin?next=/kitchen");
  }

  // Authorisation second, a separate question: are they staff?
  // This is the real check — a hidden link alone would not stop this page from rendering.
  if (session.role !== "staff") {
    redirect("/");
  }

  return (
    <section>
      <h1 className="mb-5 text-2xl font-bold">Kitchen</h1>
      <p className="text-stone-600">
        Signed in as <strong>{session.name}</strong> (role: {session.role}).
      </p>
      <p className="mt-2 text-stone-600">
        This is a staff-only view. A real build would list incoming orders
        here, scoped across all customers rather than one session&apos;s own
        orders — reasonable for staff, and exactly why this route needs its
        own role check rather than the ownership check used elsewhere.
      </p>
    </section>
  );
}