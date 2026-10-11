import SignInForm from "@/components/SignInForm";
export const metadata = {
  title: "Sign in",
  description: "Sign in to Addis Eats to check out and follow your orders.",
};

export default async function SignInPage({ searchParams }) {
  const params = await searchParams;
  const next = typeof params?.next === "string" ? params.next : "/";

  return (
    <section className="mx-auto max-w-sm">
      <h1 className="mb-5 text-2xl font-bold">Sign in</h1>
      <SignInForm next={next} />
      <div className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-stone-600">
        <p className="font-medium">Demo accounts</p>
        <ul className="mt-1 space-y-1">
          <li>0912345678 / password123 (customer)</li>
          <li>0922334455 / password123 (customer)</li>
          <li>0900000000 / staffpass (staff)</li>
        </ul>
      </div>
    </section>
  );
}