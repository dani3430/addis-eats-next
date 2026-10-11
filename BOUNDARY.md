# Server and client boundary

One line per component. There are 6 client components, and each is defended below.

## Client components (`"use client"`)

| File                            | Why it must be client                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/Providers.js`       | Holds the cart in context with `useReducer`, and syncs it to `localStorage`.                           |
| `components/AddToCartButton.js` | `onClick` writes to the cart store.                                                                    |
| `components/CategoryBar.js`     | `components/CategoryBar.js`                                                                            | Holds the selected category, search text, and current page (synced with the URL via `useSearchParams`/`router.push`), and fetches `/api/dishes` with SWR. |
| `components/OrderStatus.js`     | Polls `/api/orders/[id]` with SWR (`refreshInterval: 5000`), and calls the `cancelOrder` action.       |
| `components/CartView.js`        | Reads the cart store, and handles the quantity buttons and the "Proceed to checkout" click.            |
| `components/CheckoutForm.js`    | `useActionState` for pending state and server errors, plus clearing the cart after a successful order. |
| `app/menu/error.js`             | Next.js requires error boundaries to be client components, and `reset` is a function.                  |

## Server components

| File                                                            | Why it stays on the server                                                             |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `app/layout.js`                                                 | Renders the navbar and footer, and passes `children` into `Providers`.                 |
| `app/page.js`, `app/menu/page.js`, `app/menu/[id]/page.js`      | They `await` dish data directly. No endpoint is needed to read our own data.           |
| `app/cart/page.js`                                              | A static shell that renders `CartView`.                                                |
| `app/checkout/page.js`                                          | Reads the cookie, applies the guard, and computes the summary with server-side prices. |
| `components/DishList.js`, `components/DishCard.js`              | Markup only, with no state and no events.                                              |
| `app/menu/layout.js`, `app/menu/loading.js`, `app/not-found.js` | Static markup.                                                                         |

## Server-only code

- `app/actions.js` (`"use server"`): `placeOrder` and `cancelOrder`. Authorisation for `cancelOrder` is checked inside the action, against the httpOnly `owner` cookie.
- `lib/orders.js`, `lib/dishes.js`, `lib/validation.js`: plain modules with no directive. They are only imported by server code, except `lib/cart.js`, which the client imports because it is pure logic with no secrets.

## What crosses the boundary

- `AddToCartButton` receives only `{ id, name, price }`. No functions and no full dish objects.
- `CategoryBar` receives a plain array of category names, plus server-rendered `children`. The search text never leaves the browser.
- `CheckoutForm` receives `[{ id, qty }]`. Prices are always recomputed on the server from `lib/dishes.js`, never trusted from the client.

## Search implementation note

Search is a client-side text filter over the already-rendered `DishList`, not a new query to the server. It works together with the category pills, filtering by both at once. This keeps `/menu` static with ISR (`revalidate = 3600`), since adding search via `searchParams` and server-side filtering would have forced the route to be dynamic.
