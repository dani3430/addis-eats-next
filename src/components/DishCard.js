import Image from "next/image";
import Link from "next/link";

export default function DishCard({ dish }) {
  return (
    <article
      data-category={dish.category}
      className="group flex flex-col overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative overflow-hidden">
        <Image
          src={dish.image}
          alt={`Plate of ${dish.name}`}
          width={640}
          height={360}
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
          className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800 shadow">
          {dish.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-semibold">{dish.name}</h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-stone-600">
          {dish.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-stone-900">
            {dish.price}{" "}
            <span className="text-sm font-medium text-stone-500">ETB</span>
          </span>
          <Link
            href={`/menu/${dish.id}`}
            className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
          >
            View <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}