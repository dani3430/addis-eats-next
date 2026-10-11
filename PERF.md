# PERF.md — Making Addis Eats Fast (Day 43)

## How I measured

- Production build only: `npm run build`, then `npm run start`. Never the dev server.
- Chrome Incognito, Lighthouse, **Mobile**, Performance category only.
- Lighthouse applies its own simulated Slow 4G and CPU slowdown, so I added no extra throttling in DevTools.
- Lighthouse does not report INP. I used **TBT** (Total Blocking Time) as the closest lab measure.
- Run-to-run noise on my laptop is large (LCP varied between 1.7 s and 3.4 s on the same code), so later results are medians of three runs where I could.

## Before and after (home page `/`)

| Metric                    | Before | After all changes                                          |
| ------------------------- | ------ | ---------------------------------------------------------- |
| Performance score         | 71     | 92 (best run 94)                                           |
| LCP                       | 6.1 s  | 3.3 s (median of 3); 1.7 to 2.2 s on earlier clean runs    |
| CLS                       | 0      | 0                                                          |
| TBT                       | 310 ms | 100 ms (range 100 to 520 ms across runs, treated as noise) |
| FCP                       | 0.8 s  | 0.9 s                                                      |
| Page weight (transferred) | 1.2 MB | 602 kB (about 50% lighter)                                 |
| Requests                  | 47     | 46                                                         |

Notes on honesty:

- The "before" row is a single run. The "after" LCP is a spread, not one number, because the same code scored between 1.7 s and 3.4 s on different runs.
- I could not isolate why the last three runs sat at about 3.3 s while earlier runs were near 2 s. The font test below rules out the font. I suspect machine state (CPU load, battery mode), but I did not prove it.
- Even at the worst reading, LCP is about 45% better than the 6.1 s starting point. TBT changes are not claimed as improvements, because I changed no JavaScript.

## What caused each change (in the order I made them)

| #   | Change                                                                                                                                                                                          | Evidence                                                                                                                              | Effect                                                                                                      |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1   | Replaced `public/images/hero.jpg`. The old file was a 2500×2500 **PNG saved with a .jpg name**, 1.2 MB. New file: a real JPEG, 1600×1600, MozJPEG quality 75, about 300 kB (made with Squoosh). | Lighthouse named the hero image as the LCP element.                                                                                   | **The single change that did most of the work.** LCP 6.1 s to about 1.8 to 2.1 s, score 71 to 91.           |
| 2   | Added `sizes`, honest `width`/`height` and meaningful `alt` text to every `next/image` (home hero, `DishCard`, dish page).                                                                      | Lighthouse flagged "Improve image delivery" with an estimated 701 KiB saving. Page weight 1.2 MB to 602 kB.                           | Mainly a **bytes win** (about 50% lighter). Score 94 on that run. LCP stayed within the normal noise range. |
| 3   | Checked `priority`.                                                                                                                                                                             | A project search found exactly 2 uses: the home hero and the dish page image. None on `DishCard`.                                     | One `priority` per page, on the largest image visible without scrolling. No change in numbers.              |
| 4   | Replaced the Arial font rule with `next/font` (Inter, `latin` subset, `display: "swap"`).                                                                                                       | One self-hosted `.woff2` (48.7 kB) served from `localhost:3000/_next/static/media/`. No request to Google.                            | Privacy and no third-party connection. **No measurable change in LCP or CLS** (CLS was already 0).          |
| 5   | Third-party scripts.                                                                                                                                                                            | I searched for `<script` and `next/script`, and checked the Network tab. Every JavaScript file comes from localhost.                  | None existed, so nothing to convert.                                                                        |
| 6   | Environment setup.                                                                                                                                                                              | `.env.example` created. `git check-ignore -v` showed `.env*` ignores `.env.local`, and `!.env.example` keeps the example committable. | The only variable is `SESSION_SECRET`, with no `NEXT_PUBLIC_` prefix.                                       |
| 7   | `next.config.mjs`.                                                                                                                                                                              | Contains only `devIndicators: false`. All images are local files.                                                                     | No remote image hosts, so `remotePatterns` is not needed.                                                   |

## The font experiment (a result that did not go as I guessed)

After adding `next/font`, LCP read about 3.3 s. I tested whether the font was responsible:

| Setup                     | LCP across 3 runs |
| ------------------------- | ----------------- |
| Font on (default)         | 3.3, 3.2, 3.3 s   |
| Font on, `preload: false` | 3.1, 3.3, 3.4 s   |
| Font off                  | 3.1, 3.2, 2.2 s   |

Conclusion: the font is not the cause. The differences are smaller than the run-to-run spread. The LCP element is the hero image, and the real (non-simulated) breakdown on my laptop was tiny: time to first byte 10 ms, resource load delay 30 ms, load duration 10 ms, render delay 130 ms. I put the font back with default settings.

## Answers to the check-yourself questions

- **Did LCP improve, and what single change did most of it?** Yes. Replacing the oversized hero file did most of it.
- **Does the page still jump as it loads?** No. CLS was 0 in every run, because the images have dimensions and the layout reserves space.
- **Am I measuring `npm run start`, throttled?** Yes. Production build, Lighthouse mobile with simulated Slow 4G.
- **Can a stranger clone the repository and know which variables to set?** Yes. `.env.example` lists `SESSION_SECRET`.
- **Anything in the browser bundle I would not want published?** No. `SESSION_SECRET` is server-only and has no `NEXT_PUBLIC_` prefix.

## Not measured (stated honestly)

- **First Load JS** per route from the `npm run build` output was not recorded. I changed no JavaScript, so it would not differ before and after.
- **Baseline for `/menu`** was not taken before the image edits. After the changes, `/menu` loaded 44 requests and 503 kB transferred.
- **INP** was not measured by Lighthouse (see TBT above).

## Notes

- `priority` on `next/image` still works, but the Next.js 16 docs say it is deprecated in favour of the `preload` prop. I kept `priority` because it matches the Day 43 reading sheet.
- If I add a third-party script later (analytics, a chat widget), the right setting is `strategy="lazyOnload"`.
- If I add images from another site later, its host must be listed in `images.remotePatterns` in `next.config.mjs`.

## Day 45: performance budget

| Measure                            | Target       | Before (Day 43 baseline)                                  | Day 45 start                                         | After (local production build)     | After (deployed)  |
| ---------------------------------- | ------------ | --------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------- | ----------------- |
| LCP, throttled (home page)         | under 2.5 s  | 6.1 s                                                     | 3.3 s (median of 3; range 1.7 to 3.4 s)              | 2.9 s (median of 3: 2.6, 3.0, 2.9) | to fill in Step 8 |
| CLS                                | under 0.1    | 0                                                         | 0                                                    | 0                                  | to fill in Step 8 |
| JavaScript downloaded on `/menu`   | under 120 kB | not recorded                                              | 171 kB                                               | 171 kB                             | to fill in Step 8 |
| Largest image served               | under 150 kB | 1.2 MB (the original hero file; served size not recorded) | 66.0 kB (hero on `/`); 52.7 kB (doro-wat on `/menu`) | 66.0 kB (hero on `/`)              | to fill in Step 8 |
| Lighthouse performance (home page) | 90 or better | 71                                                        | 92 (best run 94)                                     | 87                                 | to fill in Step 8 |

How these were measured:

- LCP and the performance score: Chrome Incognito, Lighthouse, Mobile, on a production build (`npm run build`, then `npm run start`).
- JavaScript: Network tab, production build, cache disabled, no throttling, **JS** filter, the "transferred" total for the page. This replaces "First Load JS", because Next.js 16 removed those numbers from the `next build` output.
- Largest image: Network tab, **Img** filter, sorted by size. These are the sizes actually served after `next/image` optimisation.

### What changed each number

- **LCP, 6.1 s to about 2.9 s:** the biggest change was replacing the oversized hero file (a 2500x2500 PNG saved as `.jpg`, 1.2 MB) with a real 1600x1600 JPEG. Adding `sizes` cut the page weight from 1.2 MB to about 600 kB. Adding `fetchPriority="high"` to the hero moved the median LCP from 3.3 s to 2.9 s, after Lighthouse reported that the image was discoverable but not marked high priority.
- **Largest image:** met. The served hero is 66.0 kB against a 150 kB limit.
- **CLS:** met in every run. The images have `width` and `height`, and the font is loaded with `next/font`.

### Targets not met, and why

- **LCP (2.9 s against 2.5 s).** I could not bring it under the target on this machine. Lighthouse's simulated slow-phone estimate varies by about half a second between identical runs here. The unthrottled breakdown on the laptop is tiny (time to first byte 10 ms, resource load delay 30 ms, load duration 10 ms, element render delay 130 ms), so the remaining time comes from the simulation, not from a slow resource. I will re-measure on the deployed build, where a real server and CDN replace `localhost`.
- **JavaScript on `/menu` (171 kB against 120 kB).** This cannot be reached by changing Addis Eats's own code. I compared three pages with very different amounts of my own code: `/` sends 165 kB, `/cart` 171 kB and `/menu` 171 kB, so only 6 kB separate them. The three largest files on `/menu` are 72, 36 and 10 kB (118 kB together), which are the shared framework chunks (most likely React and the Next.js client runtime) that every Next.js page ships before any application code.
