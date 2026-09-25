# Prompts for Claude Code / Cursor

Open the `bree-site` folder in your IDE first so the agent can read `CLAUDE.md` and `MOTION_SPEC.md`. Paste one prompt at a time.

---

### 1. Drop in real photos
```
I've added photos to /assets (list them). Every .ph slot already has an inline
style="background-image:url('assets/NAME.jpg'),var(--grad)" (see assets/README.md for the map).
Point each slot at the best-fitting photo: hero bg → widest warm shot, .gs-focus → best portrait,
bubble inners → square crops, cards → the rest. Keep the url() inline (never via a CSS custom
property). Compress anything over 400KB to WebP. Don't touch main.js motion logic.
```

### 2. Port to Next.js (App Router) without losing the motion
```
Port this static site to Next.js 15 (App Router, TypeScript, plain CSS modules or global CSS).
Rules:
- Follow MOTION_SPEC.md exactly; it's the source of truth for timings/eases/triggers.
- Install gsap and lenis from npm. Use @gsap/react's useGSAP() with scope refs so
  everything cleans up on unmount. Register ScrollTrigger once in a client component.
- One component per section (Hero, About, Featured, Notes, GallerySequence, Principles,
  WhatIDo, Quizzes, Faq, Cta, Footer). All animated components are 'use client'.
- Create a SmoothScroll provider wrapping Lenis, synced to ScrollTrigger via gsap.ticker.
- Keep prefers-reduced-motion → static mode.
- Use next/image for photos, next/font for Libre Baskerville + Inter Tight.
Verify at 390px and 1280px with no horizontal scroll and no console errors.
```

### 3. Wire the newsletter
```
Wire #newsForm to [Mailchimp / ConvertKit / Supabase table "subscribers"].
Validate the email, show inline success/error in #newsMsg, disable the button while sending,
and prevent duplicate submits. Keep the existing styling. No page reload.
```

### 4. Build the quiz system (free + premium)
```
Add a quiz engine:
- quizzes defined as JSON in /data/quizzes/*.json (id, title, tier: free|premium,
  questions[{q, options[], answer, explanation}]).
- /quiz.html?id=... renders one question at a time with the site's design tokens,
  animated with the same masked word-rise + card reveal from MOTION_SPEC.md.
- Score screen with shareable result text for TikTok/IG.
- Premium quizzes show the first 3 questions, then a paywall card (placeholder button
  for PayFast/Paystack — I'll wire payment separately).
Link the three quiz cards on the homepage to real quiz ids.
```

### 5. Blog/notes from Markdown
```
Turn the Notes section into a real blog: posts as Markdown in /posts with front-matter
(title, date, category, tags, cover, readTime). Generate /notes/<slug>.html pages with the
site's typography, and have the homepage Featured + Notes grids pull the latest posts.
Keep the card reveal animation. Add a "not medical advice" note on every post.
```

### 6. Tweak the feel
```
Make the gallery sequence ~30% faster, soften Lenis (lerp 0.1), and give the masked
word-rise a slightly longer stagger (0.09). Update MOTION_SPEC.md to match.
```

### 7. Performance pass
```
Audit performance: Lighthouse mobile ≥ 90. Lazy-load below-the-fold images, add
width/height to avoid CLS, preload the hero image and fonts, make sure pinned sections
use will-change only while active, and check no ScrollTrigger is created twice.
```

### 8. SEO + socials
```
Add OpenGraph/Twitter meta (title, description, og:image 1200x630 using the hero shot),
a favicon set from the sun mark in the nav SVG, JSON-LD Person schema for Bree with her
TikTok and Instagram as sameAs, sitemap.xml and robots.txt.
```
