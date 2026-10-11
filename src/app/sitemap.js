import { getDishes } from "@/lib/dishes";

// Placeholder production URL from the sheet; we swap it for the real one when we deploy (Day 48).
const SITE_URL = "https://addiseats.et";

export default async function sitemap() {
  const dishes = await getDishes();

  return [
    { url: `${SITE_URL}/`, priority: 1 },
    { url: `${SITE_URL}/menu`, priority: 0.8 },
    ...dishes.map((dish) => ({
      url: `${SITE_URL}/menu/${dish.id}`,
    })),
  ];
}