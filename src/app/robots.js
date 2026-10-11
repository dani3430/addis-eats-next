// Placeholder production URL from the sheet; we swap it for the real one when we deploy (Day 48).
const SITE_URL = "https://addiseats.et";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/cart",
        "/checkout",
        "/orders",
        "/kitchen",
        "/signin",
        "/api/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}