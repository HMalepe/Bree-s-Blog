# Bree — creator site (static, motion-heavy)

Editorial site for Bree Mokoena (@mokoena_bree). Pure HTML/CSS/JS, no build step.
Motion: **GSAP 3.12 + ScrollTrigger** (scroll-linked animation) and **Lenis** (smooth scroll), vendored in `js/vendor/` so it works offline.

## Run it
```bash
# any static server works; opening index.html directly also works
npx serve .          # or: python3 -m http.server 5173
```

## Structure
```
index.html          markup, one <section> per block (numbered comments)
css/styles.css      tokens at the top (:root), then sections in page order
js/main.js          all motion, initialised in DOM order (important for pins)
js/vendor/          gsap.min.js, ScrollTrigger.min.js, lenis.min.js
assets/             drop real photos here
MOTION_SPEC.md      choreography of every animation (timings, triggers, eases)
PROMPTS.md          copy-paste prompts for Claude Code / Cursor next steps
REBUILD_PROMPTS.md  step-by-step prompts to rebuild the whole site from zero
CLAUDE.md           project rules the AI IDE reads automatically
bree-site.json      whole site in one file: sources, tokens, every animation
scripts/            bundle.mjs (regenerate bree-site.json), unpack.mjs (rebuild from it)
```

## The JSON bundle
`bree-site.json` holds every source file verbatim, the `:root` design tokens, a
structured list of every animation (trigger, from/to values, duration, ease) and
pinned CDN URLs for the three libraries.
```bash
node scripts/bundle.mjs                            # regenerate after any change
node scripts/unpack.mjs bree-site.json ./copy      # rebuild the site from it
```

## Photos
Every image slot is a `.ph` block with the photo set inline over its fallback gradient:
`<div class="ph t2" style="background-image:url('assets/x.jpg'),var(--grad)"></div>`.
The 12 photos (AI-generated in Canva) and where each one is used are listed in
`assets/README.md`. Until a file is in `/assets` its slot shows the gradient.
To use a different photo, drop it in `/assets` with the same filename, or change the path.
Keep the `url()` inline: a relative `url()` passed through a CSS custom property resolves
against `css/`, not the page.

## Before launch
- Replace `hello@example.com` (3 places)
- Wire the newsletter form in `main.js` (look for `TODO`)
- Replace sample notes/quizzes with real content
- Add real `<meta property="og:*">` tags + favicon

## Accessibility / fallbacks
- `prefers-reduced-motion` → `.static` mode: no pins, no scrubbing, everything readable
- If the libraries fail to load → same static mode
- Loader auto-hides after 5s even if JS dies

## Deploy
Live on Vercel (project `bree-s-blog`, linked to this repo; every push to the production branch redeploys).
No build command, output dir = root. `.vercelignore` keeps the docs, prompts, JSON bundle and scripts out of the public site.
