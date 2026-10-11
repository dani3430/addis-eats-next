# AUTH.md — authentication and authorisation (Day 42)

## How a session works here

1. `src/lib/users.js` holds seeded demo accounts. Passwords are never stored —
   only a `bcrypt` hash (`passwordHash`), produced by `bcrypt.hashSync`.
2. On sign-in, `src/app/signin/actions.js`'s `signIn` checks the phone/password
   against that hash, then calls `createSessionToken(user)` from
   `src/lib/session.js`, which signs `{ sub, name, role, exp }` with an HMAC
   using `SESSION_SECRET` (an environment variable, not prefixed `NEXT_PUBLIC`,
   so it is never compiled into the browser bundle).
3. The signed token is set as a cookie named `session`, with
   `httpOnly: true`, `secure` (true in production), `sameSite: "lax"`, and a
   7-day `maxAge`.
4. Every page, action, and route handler that needs to know who is asking
   calls the one shared helper, `getSession()` — never reads or decodes the
   cookie itself.

## middleware.js → proxy.js

## middleware.js

The route guard lives in `src/middleware.js` (next to `app/`, inside `src/`).
It exports a function named `middleware` and a narrow `config.matcher` of
`["/checkout/:path*", "/orders/:path*"]`, so it only runs on the paths that
need it and never on images, static files, `/menu` or `/cart`.

Next.js 16 has deprecated the `middleware` file name in favour of `proxy`
(the file is meant to be a thin boundary in front of the app, not an
Express-style chain of application logic), so the dev server prints a
deprecation warning. The `middleware.js` convention still works, and it is the
version taught in the Day 42 sheet. It runs on the edge runtime, which fits the
sheet's rule: it may only read cookies, redirect and let a request through. It
cannot query a database or render anything. Here it checks one cheap thing, that a
`session` cookie exists, and nothing more. Migrating to `proxy.js` later would
be a rename of the file and the function, with the logic unchanged.

## Protected routes and their layers

| Route                    | Middleware (`middleware.js`)                                               | Page-level check                                                                                                           | Action/handler check                                                                                                               |
| ------------------------ | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --- |
| `/checkout`              | In the matcher — redirects if no `session` cookie exists                   | `getSession()` re-checked at the top of the page; redirects to `/signin?next=/checkout` if missing                         | `placeOrder` re-checks `getSession()` before creating the order                                                                    |
| `/cart`                  | **Not** in the matcher, on purpose — open to everyone                      | None needed — the cart lives in the browser (`localStorage`) and holds no private data; nothing is saved to an account     | — (the order is only created at `/checkout`, which is protected at every layer)                                                    |     |
| `/orders`                | In the matcher — same cookie-existence redirect                            | `getSession()` checked; query (`getOrdersForUser`) scoped to `session.id`, never an id from the request                    | — (read-only page)                                                                                                                 |
| `/orders/[id]`           | In the matcher — same cookie-existence redirect                            | `getSession()` checked; `getOwnedOrder(id, session.id)` returns 403/404 unless `order.userId === session.id`               | `cancelOrder` re-checks both: `if (!session) return "Not signed in"`, then `if (order.userId !== session.id) return "Not allowed"` |
| `/api/orders/[id]` (GET) | Not in the matcher (it's an API route, not a page the person navigates to) | —                                                                                                                          | `getSession()` + `getOwnedOrder` — same ownership rule as the page                                                                 |
| `/kitchen`               | **Not** in the matcher, on purpose                                         | `getSession()` checked first (redirect to `/signin` if missing); then `session.role !== "staff"` redirects silently to `/` | —                                                                                                                                  |
| `/signin`                | n/a — this is the public page everything else redirects to                 | Reads `?next=` from the URL, validated by `safeNext()` before use                                                          | `signIn` validates credentials against `bcrypt` hash                                                                               |

The navbar shows an **Orders** link to everyone, signed in or not. Signed-out
visitors who click it are redirected to `/signin?next=/orders` by the
middleware. The link is only a convenience; the protection is the middleware
redirect, the `getSession()` check on the page, and the query scoped to
`session.id`. A hidden or visible link proves nothing. |

`/api/orders` (POST, the plain public endpoint from Day 40) is deliberately
**not** in this table — it still accepts anonymous orders by design, tagged
with `userId: "api"`, which matches no real session and therefore can never
appear on `/orders` or be opened via `/orders/[id]`.

## What each layer actually proves

- **Middleware**: a `session` cookie exists. Nothing about whether it's
  valid, expired, or tampered with — it can't verify a signature, since the
  matcher only checks `request.cookies.get(...)`. This is a cheap, free
  redirect that avoids rendering a page for a signed-out visitor; it is
  explicitly **not** security.
- **Page/layout check**: the cookie is real — `getSession()` verifies the
  HMAC signature and checks `exp`. This is "partly" security: it proves
  _who_ is asking, but not yet what they're allowed to touch.
- **Action/handler check**: both who (`getSession()`) and what they may
  touch (`order.userId === session.id`, or `role === "staff"`). This is the
  layer that actually matters — it's the one that can't be bypassed by
  skipping the UI entirely.

## The `next` parameter

Middleware sets `?next=<path>` to the page that redirected the visitor.
`signin/actions.js`'s `safeNext()` only accepts a value that starts with a
single `/` and rejects anything starting with `//` as well — blocking both
`https://evil.com` (an absolute URL) and `//evil.com` (a protocol-relative
URL browsers would treat as `https://evil.com`). Anything that fails this
check falls back to `/`.

## The three attacks (Day 45)

Each attack, what happened, and the exact line that refused it.

| #   | Attack                                                                                                                                                                             | Result                                                            | The line that stopped it                                                                                                                                                                                                 |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Call the `cancelOrder` server action from the console while signed out. Replayed with its `Next-Action` id and a **fake `session` cookie**, so the request got past the middleware | `{"ok":false,"error":"Not signed in"}`                            | `src/lib/session.js`: `verifyToken` rejects the fake token's signature, so `getSession()` returns `null`. Then `src/app/actions.js`, in `cancelOrder`: `if (!session) { return { ok: false, error: "Not signed in" }; }` |
| 2   | Signed in as Biruk, call `cancelOrder` with Almaz's order id                                                                                                                       | `{"ok":false,"error":"Not allowed"}`; Almaz's order was untouched | `src/app/actions.js`, in `cancelOrder`: `if (order.userId !== session.id) { return { ok: false, error: "Not allowed" }; }`                                                                                               |
| 3   | Sign in through `/signin?next=https://example.com`, and again through `/signin?next=//example.com`                                                                                 | Landed on `/` both times, never left the site                     | `src/app/signin/actions.js`, in `safeNext`: `!next.startsWith("/")` rejects the first, `next.startsWith("//")` rejects the second, and the function returns `"/"`                                                        |

Also tried: signed in as Biruk and changed the id in `/orders/<id>` to Almaz's order id. Result: the not-found page, and Biruk's `/orders` list only shows his own orders. Stopped by `getOwnedOrder(id, session.id)` and `getOrdersForUser(session.id)` in `src/lib/orders.js`, because the query is scoped to the session, never to an id from the request.

One more finding, fixed in Day 45: `POST /api/orders` originally had no session check, so a signed-out caller could create an order saved under the made-up user `"api"`. It now returns 401 when signed out (`if (!session)` in `src/app/api/orders/route.js`) and saves the order under `session.id`.

## Check yourself (from the reading sheet)

- Can any script on the page read the session cookie? **No** — `httpOnly: true`.
- Does the orders page work if the id in the URL is swapped for someone
  else's? **No** — see attack 2.
- Does middleware run on image files? **No** — the matcher only lists
  `/checkout/:path*` and `/orders/:path*`.
- Did all three attacks fail, and can you name the line that stopped each? **Yes** — see the table in "The three attacks (Day 45)" above.
- Is the staff link merely hidden, or actually refused server-side? **Refused
  server-side** — `/kitchen` redirects based on `session.role`, checked
  before any markup renders, regardless of whether the navbar link was shown.
- Is the signing secret absent from the JavaScript the browser downloads?
  **Yes** — `SESSION_SECRET` lives in `.env.local`, is read only inside
  `src/lib/session.js` (a server-only module), and is never prefixed
  `NEXT_PUBLIC`.

## Day 45: who may see what

| Route or action        | Protected by                            | What that proves                                                                                                                         |
| ---------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `/menu`, `/menu/[id]`  | Nothing                                 | Public, and should stay indexable                                                                                                        |
| `/cart`                | Nothing                                 | Public: the cart lives in the browser and holds no private data                                                                          |
| `/orders`              | Middleware + page + scoped query        | Middleware: a session cookie exists. Page: the session verifies. Query: `getOrdersForUser(session.id)` only returns this person's orders |
| `/orders/[id]`         | Middleware + page + scoped query        | Same layers. `getOwnedOrder(id, session.id)` means another account's id gives a 404                                                      |
| `/checkout`            | Middleware + page + `placeOrder` action | Signed in. The write re-checks the session and saves the order under `session.id`                                                        |
| `/kitchen`             | Page + role check                       | Signed in AND `role === "staff"`. Not in the middleware matcher; the page itself refuses everyone else                                   |
| `cancelOrder` action   | Session + ownership check               | Signed in, and `order.userId === session.id`                                                                                             |
| `GET /api/orders/[id]` | Session + ownership check               | Signed in, and the order belongs to this person                                                                                          |
| `POST /api/orders`     | Session check in the handler            | Signed in. The order is saved under `session.id`; a signed-out call gets 401                                                             |
