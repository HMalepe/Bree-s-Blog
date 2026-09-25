#!/usr/bin/env node
// Packs the whole site into bree-site.json: every source file verbatim,
// design tokens parsed from styles.css, and a structured list of every
// animation. Re-run after any change:  node scripts/bundle.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(join(root, p), 'utf8');

const SOURCE_FILES = [
  'index.html', 'css/styles.css', 'js/main.js',
  'README.md', 'MOTION_SPEC.md', 'CLAUDE.md', '.cursorrules', 'PROMPTS.md', 'REBUILD_PROMPTS.md',
  'scripts/unpack.mjs',
];

// Vendored libs are third-party minified code; ship them as pinned CDN URLs
// (scripts/unpack.mjs downloads them back into js/vendor/).
const VENDOR = {
  'js/vendor/gsap.min.js': 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js',
  'js/vendor/ScrollTrigger.min.js': 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js',
  'js/vendor/lenis.min.js': 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js',
};

// :root custom properties -> { name: value }
const css = read('css/styles.css');
const rootBlock = css.match(/:root\{([\s\S]*?)\n\}/)[1].replace(/\/\*[\s\S]*?\*\//g, '');
const tokens = {};
for (const m of rootBlock.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) tokens[m[1]] = m[2].trim().replace(/\s+/g, ' ');

const animations = [
  { id: 'smooth-scroll', section: 'global', trigger: 'always', lib: 'Lenis',
    spec: { lerp: 0.085, wheelMultiplier: 1, driver: 'gsap.ticker', lagSmoothing: 0 } },
  { id: 'loader-curtain', section: '0 loader', trigger: 'document.fonts.ready + 250ms',
    steps: [
      { target: '.loader-word', to: { yPercent: -40, autoAlpha: 0 }, duration: 0.7, ease: 'power3.in' },
      { target: '.loader', to: { clipPath: 'inset(0% 0% 100% 0%)' }, duration: 1.1, ease: 'expo.inOut', position: '-=0.15' },
    ] },
  { id: 'hero-intro', section: '1 hero', trigger: 'after loader (same timeline)',
    steps: [
      { target: '.hero-bg .ph', from: { scale: 1.35 }, duration: 2.4, ease: 'expo.out', position: '-=0.75' },
      { target: '.hero-title words', from: { yPercent: 118 }, duration: 1.4, stagger: 0.08, ease: 'expo.out', position: '-=2.1' },
      { target: '.hero [data-fade]', from: { y: 26, autoAlpha: 0 }, duration: 1.1, stagger: 0.12, ease: 'power3.out', position: '-=1.1' },
    ] },
  { id: 'hero-parallax-out', section: '1 hero', trigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    steps: [
      { target: '.hero-bg .ph', to: { yPercent: 14 }, ease: 'none' },
      { target: '.hero-title, .hero-right', to: { y: -80, autoAlpha: 0.15 }, ease: 'none' },
    ] },
  { id: 'masked-word-rise', section: 'global primitive', selector: '[data-split]',
    trigger: { start: 'top 88%', once: true },
    spec: { markup: 'span.w(overflow:hidden) > span.wi', from: { yPercent: 118, rotate: 4 }, duration: 1.3, stagger: 0.07, ease: 'expo.out' } },
  { id: 'fade-up', section: 'global primitive', selector: '[data-fade]',
    trigger: { start: 'top 90%', once: true },
    spec: { from: { y: 28, autoAlpha: 0 }, duration: 1.1, ease: 'power3.out' } },
  { id: 'orbit-curve-draw', section: '2 about', selector: '#curve',
    trigger: { trigger: '#orbit', start: 'top 75%', end: 'bottom 60%', scrub: 1, invalidateOnRefresh: true },
    spec: { strokeDashoffset: 'L -> 0', note: 'L = measured on-screen path length (SVG is stretched + non-scaling-stroke, so pathLength=1 cannot be used)' } },
  { id: 'bubble-grow', section: '2 about', selector: '.bubble',
    trigger: { start: 'top 100%', end: 'top 40%', scrub: 1 },
    steps: [
      { target: '.bubble-media', fromTo: [{ scale: 0.3, autoAlpha: 0 }, { scale: 1, autoAlpha: 1 }], duration: 1, ease: 'power2.out', position: 0 },
      { target: '.bubble-inner', fromTo: [{ clipPath: 'circle(0% at 50% 100%)' }, { clipPath: 'circle(80% at 50% 100%)' }], duration: 1, position: 0.55 },
      { target: '.bubble-inner .ph', fromTo: [{ scale: 1.25 }, { scale: 1 }], duration: 1.4, position: 0 },
      { target: '.bubble-label', fromTo: [{ y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }], duration: 0.5, position: 1.1 },
    ] },
  { id: 'card-reveal', section: '3 featured / 4 notes', selector: '.reveal-card',
    trigger: { method: 'ScrollTrigger.batch', start: 'top 88%', once: true },
    steps: [
      { target: '.media', fromTo: [{ clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }], duration: 1.4, stagger: 0.12 },
      { target: '.media .ph', fromTo: [{ scale: 1.3 }, { scale: 1 }], duration: 1.8, stagger: 0.12 },
      { target: '.card-text', fromTo: [{ y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }], duration: 1.1, stagger: 0.12, delay: 0.25, ease: 'power3.out' },
    ] },
  { id: 'image-drift', section: '3 featured / 4 notes', selector: '.reveal-card .media .ph',
    trigger: { start: 'top bottom', end: 'bottom top', scrub: true },
    spec: { fromTo: [{ yPercent: -6 }, { yPercent: 6 }], ease: 'none', note: 'image is 118% tall (inset:-9% 0)' } },
  { id: 'soft-exit', section: '3 featured / 4 notes', selector: '.reveal-card',
    trigger: { start: 'bottom 30%', end: 'bottom -5%', scrub: true },
    spec: { to: { autoAlpha: 0.2, y: -30 }, ease: 'none' } },
  { id: 'gallery-sequence', section: '5 gallery', selector: '.gs',
    trigger: { trigger: '.gs', start: 'top top', end: '+= stageHeight * 7', pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true },
    timeline: [
      { t: 0, label: 'a', target: '.gs-title chars', to: { x: 'random ±25vw', y: 'random ±30% stage', rotate: 'random ±45', filter: 'blur(14px)', autoAlpha: 0 }, duration: 1.3, stagger: { each: 0.06, from: 'random' } },
      { t: 0.5, label: 'b', target: '.gs-col (x3)', fromTo: [{ y: 'H * (1.05 + |shift|)' }, { y: 'focusY + H * shift' }], duration: 3.2, ease: 'power1.out', note: 'data-shift: -0.22 / 0 / 0.16; focusY centres the focus tile' },
      { t: 3.6, label: 'c', target: '.gs-tile:not(.gs-focus)', to: { scale: 0.5, autoAlpha: 0 }, duration: 1, stagger: { each: 0.05, from: 'random' } },
      { t: 4.5, label: 'd', target: '.gs-frame rect', fromTo: [{ strokeDashoffset: 'perimeter 2(w+h)' }, { strokeDashoffset: 0 }], duration: 1 },
      { t: 5.4, label: 'e1', target: '.gs-menu', fromTo: [{ scale: 0.92, autoAlpha: 0 }, { scale: 1, autoAlpha: 1 }], duration: 0.35, ease: 'back.out(2)' },
      { t: 5.95, label: 'e2', target: '.gs-hl', to: { y: 'item 1 offset' }, duration: 0.3 },
      { t: 6.35, label: 'e3', target: '.gs-hl', to: { y: 'item 2 offset' }, duration: 0.3 },
      { t: 6.75, label: 'e4', target: '.gs-hl', to: { y: 'item 3 offset' }, duration: 0.3 },
      { t: 6.95, label: 'e5', target: '.gs-menu .it:nth(3)', to: { color: '#F0CF83' }, duration: 0.2 },
      { t: 7.35, label: 'f', target: '.gs-menu, .gs-frame rect / .gs-tint', to: { autoAlpha: 0, tintOpacity: 0.9 }, duration: '0.35 / 0.6' },
      { t: 7.9, label: 'g1', target: '.gs-full', fromTo: [{ clipPath: 'inset(<focus tile rect>)' }, { clipPath: 'inset(0px 0px 0px 0px)' }], duration: 1.2, ease: 'power2.inOut' },
      { t: 8.8, label: 'g2', target: '.gs-full-head > *', fromTo: [{ y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }], duration: 0.8, stagger: 0.15, ease: 'power2.out' },
      { t: 9.6, label: 'hold', target: null, duration: 0.5 },
    ] },
  { id: 'principles-rows', section: '6 principles', selector: '.plist li',
    trigger: { start: 'top 92%', once: true, delay: 'index * 0.04' },
    steps: [
      { target: '.rule', from: { scaleX: 0 }, duration: 1.4, transformOrigin: 'left' },
      { target: 'li > span', from: { y: 22, autoAlpha: 0 }, duration: 1, stagger: 0.08, ease: 'power3.out', position: 0.1 },
    ] },
  { id: 'do-title-focus', section: '7 what I do', selector: '.do-pin',
    trigger: { start: 'top top', end: '+=90%', pin: true, scrub: 1 },
    steps: [
      { target: '.do-title', fromTo: [{ filter: 'blur(18px)', autoAlpha: 0.12, scale: 0.88 }, { filter: 'blur(0px)', autoAlpha: 1, scale: 1 }], duration: 1, ease: 'power2.out' },
      { target: '.do-title', to: { y: '-12vh' }, duration: 0.4 },
    ] },
  { id: 'stair-steps', section: '7 what I do', selector: '.step',
    trigger: { start: 'top 95%', end: 'top 45%', scrub: 1 },
    steps: [
      { target: '.step-media', fromTo: [{ clipPath: 'inset(0% 100% 100% 0%)  (.rev: inset(0% 0% 100% 100%))' }, { clipPath: 'inset(0% 0% 0% 0%)' }], duration: 1 },
      { target: '.step-media .ph', fromTo: [{ scale: 1.3 }, { scale: 1 }], duration: 1.2, position: 0 },
      { target: '.step-txt', fromTo: [{ x: '-40 (.rev: 40)', autoAlpha: 0 }, { x: 0, autoAlpha: 1 }], duration: 0.6, position: 0.5 },
    ] },
  { id: 'quiz-rise', section: '8 quizzes', selector: '.quiz',
    trigger: { method: 'ScrollTrigger.batch', start: 'top 90%', once: true },
    spec: { fromTo: [{ y: 70, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }], duration: 1.2, stagger: 0.12, ease: 'expo.out' } },
  { id: 'quiz-tilt', section: '8 quizzes', selector: '.quiz', trigger: 'pointermove (hover-capable devices only)',
    spec: { rotationX: '±5deg', rotationY: '±5deg', method: 'gsap.quickTo', duration: 0.6, ease: 'power3.out', reset: 'pointerleave -> 0' } },
  { id: 'cta-arch-open', section: '10 cta', selector: '.cta-arch',
    trigger: { start: 'top 100%', end: 'top 5%', scrub: true, invalidateOnRefresh: true },
    spec: { fromTo: [{ '--r': 'min(30vw, 380px)', '--inset': '5%' }, { '--r': '0px', '--inset': '0%' }], ease: 'none' } },
  { id: 'cta-bg-scale', section: '10 cta', selector: '.cta-bg .ph',
    trigger: { trigger: '.cta-arch', start: 'top bottom', end: 'bottom bottom', scrub: true },
    spec: { fromTo: [{ scale: 1.35 }, { scale: 1.1 }], ease: 'none', note: 'bg is position:sticky, blurred 18px' } },
  { id: 'parallax-float', section: '2 about / 10 cta', selector: '[data-speed]',
    trigger: { start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
    spec: { fromTo: [{ y: '+vh*speed/2' }, { y: '-vh*speed/2' }], ease: 'none', floatCard: 'autoAlpha 0->1 over first 25%, 1->0 over last 25%',
            speeds: { '.b1': 0.08, '.b2': -0.06, '.b3': 0.1, '.b4': -0.05, '.fc1': 0.35, '.cta-card': 0.12, '.fc2': -0.2, '.fc3': 0.25 } } },
  { id: 'news-ink', section: '10 newsletter', selector: '.news',
    trigger: { start: 'top 85%', end: 'top 25%', scrub: true },
    steps: [
      { target: '.cta-pale', to: { opacity: 1 }, ease: 'none' },
      { target: '.cta-arch', fromTo: [{ '--news-ink': '#FFF8EE' }, { '--news-ink': '#6B1D22' }], ease: 'none' },
    ] },
  { id: 'footer-wordmark', section: '11 footer', selector: '.wordmark span',
    trigger: { trigger: 'footer', start: 'top 85%', end: 'bottom bottom', scrub: true },
    spec: { fromTo: [{ yPercent: 100 }, { yPercent: 0 }], ease: 'none' } },
  { id: 'css-loops', section: 'various', trigger: 'CSS keyframes',
    spec: { scrollCue: '2s translateY(-100%→100%) infinite', blob: '9s border-radius morph infinite', newsDot: '2.4s pulse scale .55 infinite',
            menuOverlay: 'clip-path circle(0%→150%) .9s cubic-bezier(.7,0,.2,1), links stagger .06s from .25s',
            linkUnderline: 'scaleX 1→0 .6s, origin right→left', navMarkHover: 'rotate 180deg 1.2s', loaderSafety: 'auto-hide after 5s' } },
];

const files = {};
for (const f of SOURCE_FILES) files[f] = read(f);

const bundle = {
  name: 'bree-site',
  description: 'Bree Mokoena creator site: static HTML/CSS/JS, GSAP 3.12.5 + ScrollTrigger + Lenis. Motion modelled on sign-memoire.webflow.io.',
  generated: new Date().toISOString().slice(0, 10),
  run: 'npx serve .   (or: python3 -m http.server 5173)',
  unpack: 'node scripts/unpack.mjs bree-site.json <out-dir>',
  stack: { html: 'static', css: 'plain, tokens in :root', js: 'vanilla', libs: VENDOR, fonts: 'Google Fonts: Libre Baskerville 400/700/400i, Inter Tight 300-600' },
  breakpoints: { mobile: '≤760px', tablet: '≤860px (principles, quizzes)', tested: ['390x844', '1280x800'] },
  pageOrder: ['loader', 'nav + overlay menu', '1 hero', '2 about (orbit + bubbles)', '3 featured', '4 notes', '5 gallery sequence (pinned)', '6 principles', '7 what I do (pinned title + stairs)', '8 quizzes', '9 faq', '10 cta arch + newsletter', '11 footer'],
  tokens,
  animations,
  vendor: VENDOR,
  files,
};

writeFileSync(join(root, 'bree-site.json'), JSON.stringify(bundle, null, 2) + '\n');
console.log(`bree-site.json: ${Object.keys(files).length} files, ${Object.keys(tokens).length} tokens, ${animations.length} animations`);
