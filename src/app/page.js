import Image from "next/image";
import Link from "next/link";
import DishList from "@/components/DishList";
import { getDishes, getSpecials } from "@/lib/dishes";

// Static: everyone sees the same specials, and they change rarely.
export default async function HomePage() {
  const specials = await getDishes();

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-xl">
        <Image
          src="/images/hero.jpg"
          alt="Ethiopian food spread"
          width={1600}
          height={1600}
          sizes="(min-width: 1024px) 992px, 100vw"
          priority
          fetchPriority="high"
          className="h-64 w-full object-cover sm:h-80"
        />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
          <h1 className="text-3xl font-bold">Ethiopian food, ordered fast.</h1>
          <Link
            href="/menu"
            className="mt-3 w-fit rounded bg-amber-600 px-4 py-2 text-sm font-medium hover:bg-amber-700"
          >
            See the full menu
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-5 text-2xl font-bold">Today&apos;s specials</h2>
        <DishList dishes={specials} />
      </section>
    </div>
  );
}