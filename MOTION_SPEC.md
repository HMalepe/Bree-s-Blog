# Motion spec

Source of truth for every animation in `js/main.js`. Hand this file to an AI IDE when porting (e.g. to Next.js) so the feel survives the rewrite.

## Global
| Setting | Value |
|---|---|
| Smooth scroll | Lenis, `lerp: 0.085`, driven by `gsap.ticker`, `lagSmoothing(0)` |
| Default ease / duration | `expo.out`, 1.2s |
| Scrubbed timelines | `ease: 'none'` + `scrub: 1` (1s catch-up = the "weighty" feel) |
| Trigger order | Created in DOM order, then `ScrollTrigger.sort()`; refresh after fonts + `load` |
| Reduced motion | `.static` class, no pins, all content visible |
| Mobile | `ScrollTrigger.config({ ignoreMobileResize: true })`, `svh` units |

## Reusable primitives
1. **Masked word rise** (`[data-split]`): each word is wrapped in `span.w > span.wi`, where `.w` has `overflow:hidden`. `.wi` goes from `yPercent:118, rotate:4` to 0 over 1.3s, stagger 0.07. Fires once at `top 88%`.
2. **Fade-up** (`[data-fade]`): `y:28, autoAlpha:0` to rest over 1.1s with `power3.out`, at `top 90%`.
3. **Card reveal** (`.reveal-card`, via `ScrollTrigger.batch`):
   - media `clipPath: inset(100% 0 0 0)` to `inset(0)` over 1.4s
   - inner image `scale 1.3 → 1` over 1.8s
   - text `y:24` fades up with a 0.25s delay
   - stagger 0.12 between cards
4. **Image drift**: the image inside `.media` is 118% tall. `yPercent -6 → 6` is scrubbed across the viewport.
5. **Soft exit**: a card goes to `autoAlpha .2, y -30` as its bottom passes from 30% of the viewport to -5% (scrubbed). Images fade *out* as well as in.
6. **Parallax float** (`[data-speed]`): `y` goes from `+vh*speed/2` to `-vh*speed/2` across the viewport. `.float-card` also fades in over the first 25% and out over the last 25%.

## Section choreography
### 0. Loader and hero (on load, after `document.fonts.ready`)
1. The "bree." word lifts and fades (0.7s, `power3.in`).
2. The wine curtain wipes up (`clipPath inset(0 0 100% 0)`, 1.1s, `expo.inOut`).
3. The hero bg goes from `scale 1.35` to 1 (2.4s). It overlaps step 2 by 0.75s.
4. Hero title words rise, stagger 0.08. Then the right column fades up.
5. On scroll: the bg drifts `yPercent 14`. The text goes to `y -80`, fading to 0.15.

### 2. About: the orbit
- The gold SVG path is drawn with `strokeDashoffset L → 0`, scrubbed from `top 75%` to `bottom 60%`. `L` is the path's **on-screen** length, measured in JS and re-measured on refresh. Don't use `pathLength=1` here: the SVG is stretched (`preserveAspectRatio="none"`) with `vector-effect: non-scaling-stroke`, so Chrome lays dashes out in screen pixels and a unit-length dash never reaches the end of the path.
- Each bubble runs a scrubbed timeline from `top 100%` to `top 40%`:
  - the circle goes from `scale .3, opacity 0` to 1
  - the inner image reveals as an arch, `circle(0% at 50% 100%)` to `circle(80%)`
  - the label fades up last

### 3–4. Featured and Notes
The card reveal, image drift and soft exit primitives.

### 5. Gallery sequence
The section is pinned, and one scrubbed timeline lasts 7 viewport heights. The step values below are timeline time units (0 → ~10).

| Step | Time | What happens |
|---|---|---|
| a | 0 → 1.3 | Each letter of "Gallery" flies to a random x/y/rotation, blurs 14px and fades. Random stagger |
| b | 0.5 → 3.7 | Three masonry columns rise from below the fold. Each column has its own `data-shift` offset, so they land at different heights (column parallax). The centre column lands with the focus tile exactly centred |
| c | 3.6 → 4.6 | Every tile except the focus tile goes to `scale .5, opacity 0`, in random order |
| d | 4.5 → 5.5 | The gold frame (an SVG rect, sized in px) traces clockwise around the focus tile. The dash length is its measured perimeter `2(w+h)`; CSS keeps it hidden (`stroke-dasharray: 0 100000`) until JS sets it |
| e | 5.4 → 7.0 | A frosted "right-click" menu pops in (`back.out`). The highlight bar steps down the items, and the last item turns gold |
| f | 7.35 | The menu and frame fade out, and a gold tint fills the tile |
| g | 7.9 → 9.1 | The gold panel's `clip-path` expands from the tile's exact rect to full-bleed. Then the Principles heading rises in |

The unpin is seamless because the next section (`.principles`) has the same flat gold background.

### 6. Principles
Each row: the rule draws `scaleX 0 → 1` (1.4s), then the number, key and value rise with a stagger.

### 7. What I do
- `.do-pin` is pinned for 90% of the viewport height. The title goes from `blur 18px, opacity .12, scale .88` to sharp, then nudges up.
- Stair steps are scrubbed from `top 95%` to `top 45%`:
  - the image wipes in from its top corner (`inset(0 100% 100% 0)` to 0)
  - the inner image goes from `scale 1.3` to 1
  - the label slides in from the outer side

### 8. Quizzes
The cards rise 70px, stagger 0.12. On hover-capable devices they tilt toward the pointer (±5°, `gsap.quickTo`).

### 10. CTA arch and newsletter
- The arch's top border radius, `var(--r)` (≈30vw), animates to 0. Its side inset animates from 5% to 0, scrubbed as it enters.
- A sticky blurred bg stays behind the content. Its scale goes from 1.35 to 1.1 across the section.
- Floating cards use the parallax float primitive with different speeds. The centre card has a CSS blob that morphs its border radius on a 9s loop.
- Newsletter (scrubbed from `top 85%` to `top 25%`):
  - the pale layer fades in over the warm bg
  - `--news-ink` tweens from cream to wine **on `.cta-arch`**, so the newsletter text and the float-card labels follow the background (`.cta-card` stays cream on its gold panel)
  - the dot pulses on a CSS loop

### 11. Footer
The giant "bree." wordmark goes from `yPercent 100` to 0 as the footer scrolls in. It rises out of the bottom edge.

## Tuning knobs
- Gallery length: `end: '+=' + H() * 7` → lower = faster
- Column parallax: `data-shift` on each `.gs-col`
- Scrub weight: `scrub: 1` → `scrub: 0.5` feels snappier, `2` feels floatier
- Smoothness: Lenis `lerp` (0.05 = very floaty, 0.15 = nearly native)
