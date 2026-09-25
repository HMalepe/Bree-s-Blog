# Project rules (read by Claude Code; mirrored in .cursorrules)

- Static site: `index.html`, `css/styles.css`, `js/main.js`. No framework unless asked to port.
- All animation lives in `js/main.js` using GSAP + ScrollTrigger + Lenis. Choreography is documented in `MOTION_SPEC.md` — update it whenever you change motion.
- Create ScrollTriggers in DOM order. Anything with `pin: true` must be created before triggers below it (or call `ScrollTrigger.sort()` after).
- Never hide content with CSS for animation start states; set them with `gsap.set` / `fromTo` so the `.static` (reduced-motion / no-JS) mode stays readable.
- When a tween's parent starts `visibility:hidden`, use `fromTo` with explicit end values, not `from` (from() captures the inherited hidden state).
- Design tokens are the `:root` vars at the top of `styles.css`. Don't hardcode colours elsewhere.
- Fonts: Libre Baskerville (serif, headings) + Inter Tight (sans, UI).
- Image slots are `.ph` blocks; real photos go in `/assets` via `--img:url()` or `<img>` inside the same wrapper.
- Health content is educational — keep the "not medical advice" footer line.
- Test at 390px and 1280px wide; no horizontal scroll.
