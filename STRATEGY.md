# Rendering strategy

One line of reasoning per route. Every marker matches the `npm run build` output.

| Route              | Marker | Strategy Why                           |
| ------------------ | ------ | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `/`                | ○      | Static                                 | Every visitor sees the same specials, and they change rarely.                                                               |
| `/menu`            | ○      | ISR, `revalidate = 3600`               | Dishes change a few times a day, so an hour of staleness is acceptable.                                                     |
| `/menu/[id]`       | ●      | Static via `generateStaticParams`      | The 8 dish ids are known at build time. An unknown id calls `notFound()`.                                                   |
| `/cart`            | ○      | Static shell, client-rendered contents | The cart is private to one browser and lives in the client store, so the page is an empty shell and `CartView` fills it in. |
| `/checkout`        | ƒ      | Dynamic                                | It reads the `addis-cart` cookie for the guard, so it can never be static. Dynamic is correct here.                         |
| `/api/orders`      | ƒ      | Route handler (POST)                   | An endpoint for callers outside our pages. It validates with the shared schema.                                             |
| `/api/dishes/[id]` | ƒ      | Route handler (GET)                    | Read-only public endpoint. Nothing in our own app calls it.                                                                 |
| `/orders/[id]`     | ƒ      | Dynamic                                | Reads the `owner` cookie to check the viewer may see this order, so it can never be static.                                 |

Newer Next.js versions print `ƒ` for dynamic routes where older ones print `λ`. They mean the same thing.

## Decisions that changed while building

- `/checkout` was `○` while it was only a placeholder. It became `ƒ` once the guard read a cookie, and that change was intended.
- The category sidebar became a pill bar with a search box inside the menu page, not a layout-level sidebar. A layout can't share state with the list it sits beside, so the filter and search live in `CategoryBar`, which wraps the server-rendered `DishList` as `children`.
- Search does not use `searchParams` on purpose, because that would make `/menu` dynamic. It's a plain client-side text filter, so `/menu` stays static with ISR.
- `/cart` is marked `○` in the build even though its strategy is "client". The page file is static, and the client rendering happens inside `CartView`.
- `/api/dishes` and `/api/orders/[id]` were added as route handlers purely for the client's own polling and search, not for any outside caller — see `DATA.md` for how each query is used.
