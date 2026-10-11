# DATA.md — client-side queries (Day 41)

Every `useSWR` call in the app, its key, its refresh rule, and why.

| Component          | Key                                                                  | Refresh rule                                                                 | Why                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------ | -------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OrderStatus.js`   | `` `/api/orders/${id}` ``                                            | `refreshInterval: 5000` (poll every 5s)                                      | An order's status can change from elsewhere, so the page needs to notice without a manual refresh. `fallbackData` is the server-rendered order, so there is no spinner on first paint.                                                                                                                                                                                                                                                |
| `CategoryBar.js`   | `` `/api/dishes?page=${page}&category=${category}&q=${debounced}` `` | Default SWR revalidation (no interval) + `keepPreviousData: true`            | Dishes change at most a few times a day, so there is no need to poll. `keepPreviousData` keeps the previous results visible while the next request is in flight, so the grid never flashes empty when searching, filtering, or changing page. `fallbackData` is supplied only for the exact default key (page 1, category All, empty search), using the server-rendered first page, so the menu shows data immediately on first load. |
| `AccountStatus.js` | `"/api/session"`                                                     | Default SWR revalidation (re-checks when the tab regains focus), no interval | The navbar must show "Sign in" or the person's name, but reading the cookie in the layout would make every page dynamic and break the static `/menu`. So the navbar asks once on the client. There is no `fallbackData`, so a short `…` shows on arrival. This is a deliberate trade-off (see the Day 45 table below).                                                                                                                |

## Debouncing

The search box's value is debounced by 300ms (`useDebouncedValue`) before it joins the key above. Typing "tib" then "tibs" quickly produces one request, for the final value — the key only changes once typing pauses, and SWR guarantees the data shown matches the current key, so an old response can never overwrite a newer one.

## Null key

An earlier version of the search used `null` as the SWR key whenever the search box was empty, so no request fired at all for nothing to search. That same principle — skip the request when there is nothing meaningful to ask for — is why `OrderStatus.js` is only ever rendered with a known order `id`.

## Mutation after a write

`OrderStatus.js` calls the `cancelOrder` server action, and on success calls `mutate({ order: result.order }, false)` to update the cache immediately, instead of waiting up to 5 seconds for the next scheduled poll — the same "tell the cache what changed" pattern the sheet describes for writes.

## Paging

The page number lives in the URL's query string (`/menu?page=2`), read via `useSearchParams()` and changed via `router.push()`, so a specific page is linkable and shareable. `/menu`'s own Server Component never reads `searchParams` — only `CategoryBar`, a client component inside a `<Suspense>` boundary, does — so the route's rendering strategy is unaffected: `/menu` still prerenders as static with `revalidate: 3600`. Visiting `/menu?page=2` directly briefly shows the server-rendered page 1 before the client reads the URL and fetches page 2 — a deliberate trade-off to keep the base route static rather than making the whole page dynamic just to support deep-linked pages.

## What the Network tab shows while typing

Typing a search term shows **debounced** requests to `/api/dishes`, roughly one per 300ms pause rather than one per keystroke. Clearing the search box, changing category, or changing page shows the same single request per action, each resolving before the next is fired for that key. The grid never goes blank between requests, because of `keepPreviousData`.

## Day 45: where data is fetched

| Data                    | Where, and why                                                                                                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Menu and dishes         | Server: public, indexable, cacheable. `/menu` is static with `revalidate: 3600`, and dish pages are pre-rendered                                                                                         |
| Order history           | Server: private, scoped to the session with `getOrdersForUser(session.id)`                                                                                                                               |
| Order status            | Server first (the page renders the order), then polled on the client every 5 seconds with `fallbackData`, so there is no spinner                                                                         |
| Menu search             | Client: triggered by typing, debounced by 300 ms, seeded with the server-rendered first page                                                                                                             |
| Cart                    | Client store (`localStorage`): it never leaves the browser                                                                                                                                               |
| Signed-in user (navbar) | Client, `/api/session`. A deliberate trade-off: reading the cookie in the root layout would make every route dynamic and break the static menu, so the navbar fetches it once and shows `…` for a moment |

## Day 45: live-data checks (Network tab)

| Check                                                 | How I tested it                                                 | Result                                                                                                                                                                   | The code responsible                                                                                   |
| ----------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Search sends one request per pause, not per keystroke | Network tab, Fetch/XHR filter, typing in the `/menu` search box | Typing `kitfo` slowly (pausing longer than 300 ms) sent 3 requests (`kit`, `kif`, `kitfo`) for 5 keystrokes. Typing `shiro` and `kitfo` each in one burst sent 1 request | `useDebouncedValue(term, 300)` in `src/components/CategoryBar.js`, defined in `src/lib/useDebounce.js` |
| The order page shows data on arrival, no spinner      | View source, then reload on Slow 4G                             | The dish names are in the page source (rendered on the server). "Loading order…" never appeared, even on Slow 4G                                                         | `fallbackData: initial` in `src/components/OrderStatus.js`, seeded by `src/app/orders/[id]/page.js`    |
| The order status is polled                            | Network tab, Fetch/XHR filter, waited 12 seconds                | 2 requests to `/api/orders/<id>` in 12 seconds, one every 5 seconds                                                                                                      | `refreshInterval: 5000` in `src/components/OrderStatus.js`                                             |
