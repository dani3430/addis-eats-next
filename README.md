# Addis Eats (Next.js)

Food-ordering app for the CodeOps Day 40 Next.js Foundations Project, rebuilt from the Day 35 React version with the App Router, server components, a route handler and a server action.

## Run it

```bash
npm install
npm run build
npm run start
```

Open http://localhost:3000. Always verify with the production build, not `npm run dev`.

## Routes

| Route              | Marker | What it does                                                |
| ------------------ | ------ | ----------------------------------------------------------- |
| `/`                | ○      | Landing page with today's specials                          |
| `/menu`            | ○ (1h) | Dishes, category filter, search                             |
| `/menu/[id]`       | ●      | One dish, add to order                                      |
| `/cart`            | ○      | Cart lines and running ETB total (client-rendered contents) |
| `/checkout`        | ƒ      | Guarded checkout form, server action                        |
| `/api/orders`      | ƒ      | POST: place an order (422 on invalid input)                 |
| `/api/dishes/[id]` | ƒ      | GET: one dish (404 if unknown)                              |

## Documentation

- [STRATEGY.md](./STRATEGY.md): rendering strategy and reasoning per route
- [BOUNDARY.md](./BOUNDARY.md): every component, server or client, and why

## Build output

Paste the output of `npm run build` here:

```
(paste your build output)
```

## Verifying the endpoints

On Windows PowerShell use `curl.exe`, and send JSON from files, since inline quoting breaks.

```bash
curl.exe -i localhost:3000/api/dishes/not-a-dish   # 404 and { "error": ... }
curl.exe -i localhost:3000/api/dishes/doro-wat     # 200 and the dish
curl.exe -i -X POST localhost:3000/api/orders -H "Content-Type: application/json" --data-binary "@bad-order.json"   # 422 and fieldErrors
```

## Data flow

| What               | How                                    | Why                                                   |
| ------------------ | -------------------------------------- | ----------------------------------------------------- |
| Menu and dish data | Server component reads `lib/dishes.js` | Read to render, so no endpoint is needed              |
| Placing an order   | Server action `placeOrder`             | A write from our own UI, works without JavaScript     |
| Order from outside | Route handler `/api/orders`            | Callable by things we do not control                  |
| Cart contents      | Client store (`localStorage`)          | Only ids and quantities reach the server, at checkout |

## Security notes

- The same schema (`lib/validation.js`) is enforced by both the route handler and the server action.
- Prices are recomputed on the server. The client never decides what something costs.
- `cancelOrder` checks ownership inside the action, using an httpOnly cookie the browser JavaScript cannot read.
- No secrets or environment variables exist in the client bundle.

## Verification results

- [ ] Every marker in the build output matches STRATEGY.md
- [ ] Six failure checks run on the production build
- [ ] `cancelOrder` attacked from the browser console with an id that is not mine
- [ ] Checkout works with JavaScript disabled
- [ ] Fresh clone builds and runs

## Bundle size (Day 35 vs today)

Fill in after measuring (see the instructions in chat).
