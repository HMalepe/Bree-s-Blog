# Rebuild prompts: reproduce this site from zero in your IDE

Two routes. **Route A** gets you the finished site in one minute. **Route B** has an AI agent (Claude Code, Cursor, Windsurf) rebuild it one section at a time. Use Route B to learn how the site works, or to port it to another stack.

`PROMPTS.md` is a different file. It covers what to do *after* the site exists: real photos, Next.js, the newsletter, quizzes and SEO.

---

## Route A: unpack the bundle

```
node scripts/unpack.mjs bree-site.json ./bree-site
cd bree-site && npx serve .
```
Or paste this into your IDE agent with `bree-site.json` open:
```
Read bree-site.json. Write every entry in "files" to disk at its key path, byte for byte.
Then download each URL in "vendor" to its key path. Create an empty /assets folder.
Serve the folder with `npx serve .` and confirm there are no console errors.
```

---

## Route B: step-by-step rebuild

Paste one prompt at a time, in order, and check the result in the browser before moving on. Each prompt gives exact values so the agent never has to guess. Keep `MOTION_SPEC.md` open in the IDE as reference.

### 0. Project rules (paste first, once)
```
We're building a static, motion-heavy editorial site. No framework, no build step.
Files: index.html, css/styles.css, js/main.js, js/vendor/{gsap.min.js,ScrollTrigger.min.js,lenis.min.js}, assets/.
Libraries (download into js/vendor/):
  https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js
  https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js
  https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js
Rules for the whole project:
- All motion lives in js/main.js, in one IIFE. Create ScrollTriggers in DOM order and call ScrollTrigger.sort() at the end.
- Never hide content in CSS as an animation start state. Set start states with gsap.set/fromTo so the page stays readable when JS or the libraries fail.
- If JS fails to load or the user prefers reduced motion, add class "static" to <html> and return before any GSAP code. Static mode has no pins and no scrubbing.
- Design tokens live only in :root at the top of styles.css. Never hardcode colours anywhere else.
- Test at 390px and 1280px wide. There must be no horizontal scroll at either width.
Create the file skeleton now: index.html loads Google Fonts (Libre Baskerville 400,700,400i; Inter Tight 300-600), then css/styles.css, and at the end of <body> the three vendor scripts followed by js/main.js. Put <script>document.documentElement.classList.add('js')</script> in <head>.
```

### 1. Tokens and base styles
```
In css/styles.css add these :root tokens:
--bg:#F7F7F5 --paper:#FFFFFF --ink:#1E1A17 --muted:#6F6862 --line:#E4E0DA --wine:#6B1D22 --wine-deep:#5A0F14
--gold:#B98A3E --gold-flat:#BC9645 --blush:#F3D9CF --cream:#FFF8EE
--serif:"Libre Baskerville",Georgia,serif  --sans:"Inter Tight",system-ui,sans-serif
--pad:clamp(16px,3.2vw,44px) --radius:4px --ease-out:cubic-bezier(.16,1,.3,1)
Placeholder photo gradients --g1..--g6 (warm radial/linear gradients in amber, blush, sand, gold and mauve).
Base styles:
- body: bg var(--bg), ink colour, Inter Tight 16px/1.55, antialiased, overflow-x:clip.
- Lenis helpers: html.lenis,html.lenis body{height:auto}; .lenis.lenis-smooth{scroll-behavior:auto!important}; .lenis.lenis-stopped{overflow:hidden}.
- .label: serif, wine, clamp(15px,1.3vw,18px), wrapped in "( " and " )" via ::before/::after.
- .link: 1px underline pseudo-element. On hover it scales to 0 over .6s var(--ease-out); the transform-origin flips from right to left, so the line exits in the direction you read.
- .ph placeholder: background-image is var(--img) layered over var(--grad). It gets a film-grain ::after (inline SVG feTurbulence, baseFrequency .9, opacity .18, mix-blend overlay). Classes .t1–.t6 set --grad to --g1–--g6.
- Split-text masks: .w{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.14em;margin-bottom:-.14em}; .wi,.ch{display:inline-block;will-change:transform}.
```

### 2. Loader, nav and full-screen menu
```
Loader: a fixed full-screen wine layer (z 100) with "bree." centred in blush serif at clamp(44px,8vw,96px), letter-spacing -.04em. The "." is gold. Add a CSS safety animation that hides it after 5s even if JS dies. It is hidden in html:not(.js) and in .static.
Nav: fixed, flex space-between, padding 18px var(--pad), mix-blend-mode:difference, white.
- Left: a 34px sun-mark SVG (circle r7 plus 8 rays). It rotates 180deg on hover over 1.2s.
- Right: a 42px circular burger, 1.5px border, three 16px bars. With .menu-open on <html> the bars become an X.
Overlay menu: fixed wine panel, links bottom-aligned in serif at clamp(40px,8vw,104px).
- It opens with clip-path circle(0% → 150%) centred on the burger (calc(100% - 42px) 39px), .9s cubic-bezier(.7,0,.2,1).
- Links rise from translateY(60%) with transition-delays .25s, .31s, .37s, .43s, .49s. Hovered links turn italic.
In main.js add setMenu(open): toggle html.menu-open and aria-expanded/label/hidden, and stop/start Lenis (or lock body overflow when there's no Lenis). Escape closes the menu. Every a[href^="#"] closes the menu and scrolls with lenis.scrollTo(target,{duration:1.6}), falling back to scrollIntoView.
```

### 3. Motion core
```
In js/main.js:
- If gsap/ScrollTrigger are missing or the user prefers reduced motion, add html.static and return (after the menu and anchor code, which must always work).
- gsap.registerPlugin(ScrollTrigger); ScrollTrigger.config({ignoreMobileResize:true}); gsap.defaults({ease:'expo.out',duration:1.2}).
- Lenis: new Lenis({lerp:0.085, wheelMultiplier:1}); lenis.on('scroll',ScrollTrigger.update); gsap.ticker.add(t=>lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0).
- splitWords(el): walk the text nodes and wrap each word as span.w>span.wi. Keep <em>, <br> and nested spans intact. Set aria-label to the plain text.
- splitChars(el): wrap each character in span.ch aria-hidden (spaces become &nbsp;).
- Primitive "masked word rise": for every [data-split] except the hero, animate its words from yPercent:118, rotate:4 over 1.3s, stagger .07, triggered once at 'top 88%'.
- Primitive "fade-up": for every [data-fade] outside the hero, animate from y:28, autoAlpha:0 over 1.1s power3.out, triggered once at 'top 90%'.
- At the end: ScrollTrigger.sort(); refresh on window load.
```

### 4. Hero and intro timeline
```
Hero: min-height 100svh, 2-column grid (1 column under 760px), cream text over a full-bleed .hero-bg.
- The .hero-bg .ph sits at inset:-10% 0 with blur(1px), under a darkening gradient (rgba(0,0,0,.06) → .36).
- Title h1 [data-split="hero"]: "Bree" then a block line with a small italic "behind the" (.34em) and "Counter". Serif clamp(52px,8.2vw,124px), line-height .98, letter-spacing -.03em. Line 2 is indented .4em.
- Right column: "South Africa", then a 3-col justified grid of the words "Pharmacist by day, creator by night". Below it, a serif lead "Honest health notes, small rituals, and life between prescriptions." and a .link "Start reading". Both groups are [data-fade].
- Scroll cue: a 1px × 48px line at bottom-centre with a cream bar looping translateY(-100%→100%) every 2s.
Intro (paused timeline, played after document.fonts.ready + 250ms, then ScrollTrigger.refresh()):
 1 .loader-word → yPercent -40, autoAlpha 0, .7s power3.in
 2 .loader clipPath inset(0 0 100% 0), 1.1s expo.inOut at "-=.15", then display:none
 3 .hero-bg .ph from scale 1.35 over 2.4s at "-=.75"
 4 hero words (pre-set to yPercent 118) → 0, 1.4s, stagger .08 at "-=2.1"
 5 hero [data-fade] (pre-set y 26, autoAlpha 0) → rest, 1.1s, stagger .12, power3.out at "-=1.1"
Scroll-out (scrub true, trigger .hero, top top → bottom top): the bg moves to yPercent 14; the title and right column go to y -80, autoAlpha .15.
```

### 5. About: orbit curve and bubbles
```
Section .about: a label "About", an h2 [data-split] "The pharmacist you'd text <em>if you could.</em>" (wine, em in ink), and a muted blurb. Grid 1fr 2fr.
.orbit: position relative, height clamp(1000px,140vw,1500px). It contains an absolute SVG, viewBox 0 0 1000 1400, preserveAspectRatio="none", with one path #curve:
  M1000 40 C 780 60, 820 260, 560 300 S 120 330, 150 520 S 700 640, 820 760 S 520 980, 260 1040 S 60 1250, 420 1380
  stroke var(--gold), width 2, vector-effect:non-scaling-stroke, no fill.
Four .bubble blocks, absolutely placed (b1 top 2% right 4%, b2 top 28% left 3%, b3 top 52% right 7%, b4 top 77% left 12%). Each has:
- a round .bubble-media, clamp(150px,20vw,270px), with two .ph layers (outer + .bubble-inner) and a centred label (small caption + serif italic word)
- a serif wine side-heading [data-split]. b1/b3 put the text on the left (row-reverse); b2/b4 on the right. Under 760px they stack in a column.
Bubbles and labels: Health/Notes "Explain it like a friend", Series/Myths "Myths, gently busted", Play/Quizzes "Test what you know", Off duty/Rituals "Life off the clock". data-speed: .08, -.06, .1, -.05.
Motion:
- Curve draw, scrubbed (trigger #orbit, top 75% → bottom 60%, scrub 1, invalidateOnRefresh): strokeDashoffset L → 0.
  IMPORTANT: do NOT use pathLength="1". The SVG is stretched with a non-scaling stroke, so Chrome lays out dashes in screen pixels. Measure L in JS: sample 400 points with getPointAtLength, scale dx by svg.clientWidth/1000 and dy by svg.clientHeight/1400, sum the segment lengths, then ceil +2. Set strokeDasharray = L and use a function value so it re-measures on refresh.
- Each bubble runs a scrubbed timeline (top 100% → top 40%, scrub 1, ease none):
  media scale .3/autoAlpha 0 → 1 (dur 1, power2.out, at 0)
  inner clipPath circle(0% at 50% 100%) → circle(80% at 50% 100%) (dur 1, at .55): an arch rising from the bottom
  inner .ph scale 1.25 → 1 (dur 1.4, at 0)
  label y 26/autoAlpha 0 → rest (dur .5, at 1.1)
- [data-speed] parallax: y goes from +vh*speed/2 to -vh*speed/2 across the viewport (scrub true, invalidateOnRefresh).
```

### 6. Featured and Notes cards
```
Shared .section: padding clamp(80px,10vw,150px) var(--pad), 1px top border. .head is flex space-between: a label, then an h2 [data-split] (serif clamp(34px,5vw,72px), em in wine) and an optional .link.
Featured ("Start <em>here</em>"): grid 1.1fr/.9fr. Left is one tall card (media 4:5). Right stacks two wide cards (16:11). Below, a 3-column row of square cards with a top border. Every card is a.card.reveal-card containing .media>.ph (the .ph sits at inset:-9% 0, so it's 118% tall) and .card-text (a muted row "Category · N min read" and a serif h3).
Notes ("Latest from <em>the journal</em>"): a 2-column grid of article.note.reveal-card. Each has media 16:10, a wine serif h3, a wine serif <time>, and a dl with Category/Tags.
Hover: .ph filter saturate(1.15) brightness(1.04), transition .8s. Everything goes to 1 column under 760px.
Motion:
- Pre-set: .media clipPath inset(100% 0 0 0), .media .ph scale 1.3, .card-text y 24 / autoAlpha 0.
- ScrollTrigger.batch('.reveal-card', start 'top 88%', once). On enter: media clip to inset(0) 1.4s stagger .12; ph scale 1 1.8s stagger .12; text to rest 1.1s stagger .12 delay .25 power3.out.
- Drift: each card's .ph moves yPercent -6 → 6, scrubbed from top bottom to bottom top.
- Soft exit: each card goes to autoAlpha .2, y -30, scrubbed from bottom 30% to bottom -5%.
```

### 7. Gallery sequence (the signature piece)
```
Section .gs#gallery > .gs-stage (100svh, overflow hidden, bg var(--bg)). The stage contains:
- h2.gs-title "Gallery": absolutely centred, serif wine clamp(64px,13vw,210px), z 3.
- .gs-cols: absolute, top 0, left 50%, translateX(-50%), width min(100%,1280px,125vh). Grid 1fr 1.25fr 1fr (1fr 1.5fr 1fr on mobile), gap clamp(8px,1vw,14px). Three .gs-col flex columns with data-shift -0.22 / 0 / 0.16.
  Left column tiles: portrait, square, portrait, square. Centre: square, wide(4:3), .gs-focus (portrait 3:4), square. Right: square, portrait, square, portrait.
- Inside .gs-focus:
  - .gs-tint (gold-flat, opacity 0)
  - svg.gs-frame: 7px outside the tile, overflow visible, containing <rect x=0 y=0 width=100% height=100%>. No viewBox, so it's sized in px. Stroke gold, width 2, stroke-dasharray:0 100000 so it's hidden until JS sets it.
  - .gs-menu: a frosted "right-click" menu at left 58% top 52%. rgba(38,28,22,.5), backdrop blur 12px, radius 6, 4 items 38px tall ("Open in new tab", "Save to favourites", "Follow @mokoena_bree", "See what I stand for"), plus a .gs-hl highlight bar. Hidden by default.
- .gs-full: absolute inset 0, z 5, gold-flat bg with a subtle sheen gradient. Contains a label "Principles" (cream) and an h2 "What I stand for <em>on every post</em>". Hidden, clip-path inset(50%).
Motion: ONE timeline, ease none, scrollTrigger {trigger .gs, start 'top top', end: () => '+=' + stageHeight*7, pin true, scrub 1, invalidateOnRefresh, anticipatePin 1}. Positions are in timeline seconds:
 a 0.0  title chars (splitChars) → random x ±25vw, y ±30% stage, rotate ±45, blur(14px), autoAlpha 0; dur 1.3, stagger {each .06, from 'random'}
 b 0.5  each column fromTo y: H*(1.05+|shift|) → focusY + H*shift; dur 3.2, power1.out. focusY = H/2 - (focus.offsetTop + focus.offsetHeight/2), so the focus tile lands dead-centre.
 c 3.6  every tile except the focus → scale .5, autoAlpha 0; dur 1, stagger {each .05, from 'random'}
 d 4.5  frame rect fromTo strokeDashoffset P → 0, dur 1. P = ceil(2*(w+h))+2 from the svg's getBoundingClientRect. Also set strokeDasharray = P. Use a function value.
 e 5.4  menu (pre-set scale .92, origin 0 0) → autoAlpha 1, scale 1, .35s back.out(2); the highlight bar steps to items 1, 2, 3 at 5.95, 6.35, 6.75 (.3s each); item 4 turns #F0CF83 at 6.95
 f 7.35 menu + frame → autoAlpha 0 (.35); tint → opacity .9 (.6)
 g 7.9  set .gs-full visible with clipPath equal to the focus tile's exact on-screen box (compute the inset from colsWrap/centre column/focus offsets), then animate to inset(0px 0px 0px 0px) over 1.2s power2.inOut. At 8.8 the head items rise from y 50 (.8s, stagger .15, power2.out). Finish with a .5s hold.
The next section (.principles) has the same flat gold background, so the unpin is invisible.
Static mode: the stage becomes auto height; frame, menu and tint are hidden; .gs-full shows as a normal block.
```

### 8. Principles
```
.principles: gold-flat bg, cream text, padding 0 var(--pad) clamp(90px,11vw,160px). An ol.plist, right-aligned, width min(100%,62%) (full width under 860px).
Each li is a grid 56px/1fr/1.4fr with: a serif number "01".."05", a key in 12px uppercase tracking .14em, a value in uppercase clamp(15px,1.4vw,19px), and an absolute i.rule (1px, cream 55%, origin left).
Rows: Language / Clarity over jargon · Evidence / Science over trends · Honesty / Useful first, sponsored second · Care / Know when to say "see your doctor" · Tone / Warm, never preachy.
Motion per row (trigger 'top 92%', once, delay i*.04): rule from scaleX 0 over 1.4s; then the three spans from y 22 / autoAlpha 0, 1s, stagger .08, power3.out, at .1.
```

### 9. What I do: pinned blur title and stair steps
```
.do-pin: 100svh, centred h2.do-title "What I <em>do</em>" (em on its own line). Serif wine clamp(56px,12vw,190px), letter-spacing -.04em.
Pinned timeline (trigger .do-pin, top top, end '+=90%', pin, scrub 1): title fromTo {blur 18px, autoAlpha .12, scale .88} → {blur 0, 1, 1} (dur 1, power2.out), then y → -12vh (dur .4).
.stairs: a 12-col grid. Each .step sits on its own row, placed with inline --c (grid-column) and --ar (media aspect ratio), so the steps descend like stairs:
 Pharmacy/Retail dispensary (1/6, 4:3) · Content/TikTok & Instagram (4/11, 16:10) · .rev Explainers/Health, in plain words (7/13, 1:1) · .rev Collaborations/Brands & campaigns (4/10, 4:3) · Quizzes/Free & premium (1/7, 16:10).
The step media is 62% wide, with the text beside it (.rev flips the side and right-aligns). On mobile every step is full width and even steps get margin-left 18%.
Motion per step (top 95% → top 45%, scrub 1, ease none): media clipPath from inset(0 100% 100% 0) (.rev: inset(0 0 100% 100%)) → inset(0) (dur 1); inner .ph scale 1.3 → 1 (dur 1.2, at 0); text x ∓40 / autoAlpha 0 → rest (dur .6, at .5).
```

### 10. Quizzes and FAQ
```
Quizzes: label, h2 "Test what <em>you know</em>", .link "All quizzes". A 3-column grid (1 column under 860px) with perspective 1000px.
Each a.quiz is a paper card with a 1px line border, min-height 320, transform-style preserve-3d, and on hover a box-shadow 0 30px 60px -30px rgba(107,29,34,.35). It holds a pill tag (Free, or Premium in solid wine), a serif h3, a muted p and a foot row "N questions →".
Cards: Myth or fact: the medicine cabinet edition (Free, 10) · What's your skincare personality? (Free, 8) · Pharmacy student exam prep (Premium, 50+).
Motion: pre-set y 70, autoAlpha 0. ScrollTrigger.batch at top 90%, once → rest, 1.2s, stagger .12. On (hover:hover) devices only, add pointer tilt with gsap.quickTo on rotationX/rotationY (.6s power3.out): ±5deg from the pointer position, reset on pointerleave.
FAQ: centred head "Asked Often" / "Questions from <em>the comments</em>". A 980px column of <details data-fade> with serif summaries. A wine "+" rotates 45deg when open. Four Q&As: what to take (see your own pharmacist/doctor), brand work (selectively), how content started, whether premium is worth it.
```

### 11. CTA arch and newsletter
```
.cta: a right-aligned wine h2 [data-split] "A moment to connect <em>before the next post</em>" (em on its own line, max 20ch).
.cta-arch sets the custom properties --r:0px, --inset:0%, --news-ink:var(--cream). It has margin-inline var(--inset), border-radius 50% 50% 0 0 / var(--r) var(--r) 0 0, overflow hidden, min-height 250vh, color var(--news-ink), isolation isolate. Inside it:
- .cta-bg: position sticky, top 0, 100svh, margin-bottom -100svh, z -1. It holds a .ph (blur 18px, saturate 1.1, scale 1.15) and a .cta-pale layer (linear #EFE6DA → #E4D6C4, opacity 0).
- Three a.float-card (clamp(130px,15vw,200px) wide, 4:3 image + caption): fc1 right/top 14vh speed .35, fc2 left/top 95vh speed -.2, fc3 right+4vw/top 140vh speed .25.
- .cta-card: centred, margin-top 48vh, width min(86%,380px), bg rgba(190,150,70,.78), colour cream, speed .12. Holds the h3 "Let's make something worth sharing.", a .link "Get in touch" (mailto) and a .blob whose border-radius morphs on a 9s loop.
- .news: margin-top ~70vh, width min(100% - 2*pad, 520px). Holds a pulsing dot (2.4s), an h2 [data-split] "One honest note <em>a week</em>" (em indented 1.4em), and a form (email input + "→" button, bottom border currentColor) with a small#newsMsg.
Motion:
- The arch opens: fromTo {'--r': min(30vw,380px), '--inset':'5%'} → {'--r':'0px','--inset':'0%'}, trigger top 100% → top 5%, scrub true, invalidateOnRefresh.
- The bg .ph goes scale 1.35 → 1.1 across the arch (top bottom → bottom bottom).
- [data-speed] parallax as in step 5. Float cards also fade autoAlpha 0 → 1 over the first 25% and 1 → 0 over the last 25%.
- Newsletter (trigger .news, top 85% → top 25%, scrub): .cta-pale opacity → 1, and '--news-ink' on .cta-arch goes from #FFF8EE to #6B1D22. The newsletter text AND the float-card labels switch from cream to wine as the background turns pale; the .cta-card keeps cream.
- The form submit is preventDefault'd and shows "You're on the list. First note lands soon." (TODO: wire a provider).
```

### 12. Footer
```
Footer: wine-deep bg, colour #EDE7DF. A 3-column grid (1fr 1fr 2fr; 2 columns under 760px, with the fine print spanning both):
- "( Explore )" links: About, Notes, Gallery, Quizzes
- "( Follow )" links: TikTok, Instagram, Email
- Fine print on the right: "Content is educational, not medical advice." / "Built by SOLUPAIR"
Then a giant .wordmark "bree." (serif, clamp(110px,27vw,420px), letter-spacing -.06em, cream, gold ".", line-height .8), inside an overflow-hidden wrapper.
A bottom bar has "© <year> Bree Mokoena" (year filled by JS) and "Back to top ↑".
Motion: .wordmark span goes yPercent 100 → 0, trigger footer, top 85% → bottom bottom, scrub true. It rises out of the bottom edge.
```

### 13. Static mode and QA pass
```
Add the static-mode CSS: .static .gs-stage (auto height, visible overflow, padding), .gs-title static, .gs-cols static, no transform; hide the frame, menu and tint; show .gs-full as a normal block. Give .do-pin auto height. Give .cta-arch auto min-height and hide the float cards. Also add @media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}.
Then QA with Playwright (or by hand):
1. Load at 1280x800 and 390x844. Expect no console errors, and scrollWidth === innerWidth at both sizes.
2. Scroll through the gallery pin at 2/30/45/60/88/100% and screenshot. The frame must be invisible before step d and fully closed after it.
3. Scroll past the orbit. The gold curve must reach its end point (420,1380 in SVG units).
4. With reducedMotion:'reduce', html gets .static and every section is readable.
Fix anything that fails, then update MOTION_SPEC.md if any value changed.
```
