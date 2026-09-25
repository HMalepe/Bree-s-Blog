/* =====================================================================
   BREE — main.js
   Motion system: GSAP 3 + ScrollTrigger (scroll-linked), Lenis (smooth
   scroll). Sections are initialised in DOM order, which matters for pins.
   See MOTION_SPEC.md for the choreography of every section.
   ===================================================================== */
(() => {
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);

  $('#yr').textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     Basics that work with or without motion
     ------------------------------------------------------------------ */
  let lenis = null;
  const burger = $('#burger'), overlay = $('#overlay');
  const setMenu = open => {
    root.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    overlay.setAttribute('aria-hidden', !open);
    if (lenis) open ? lenis.stop() : lenis.start();
    else document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
  addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));

  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const target = id.length > 1 ? $(id) : document.body;
    if (!target) return;
    e.preventDefault();
    setMenu(false);
    if (lenis) lenis.scrollTo(target, { duration: 1.6 });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));

  $('#newsForm').addEventListener('submit', e => {
    e.preventDefault();               // TODO: POST to Mailchimp / ConvertKit / Supabase
    $('#newsMsg').textContent = "You're on the list. First note lands soon.";
    e.target.reset();
  });

  if (!hasGSAP || reduce) {           // readable, static version
    root.classList.add('static');
    return;
  }

  /* ------------------------------------------------------------------
     Setup
     ------------------------------------------------------------------ */
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.defaults({ ease: 'expo.out', duration: 1.2 });

  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const vw = () => innerWidth;
  const vh = () => innerHeight;

  /* Split helpers ----------------------------------------------------- */
  // Wraps every word in <span.w><span.wi>word</span></span>; keeps <em>, <br>, nested spans.
  function splitWords(el) {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('span'); i.className = 'wi'; i.textContent = part;
            w.appendChild(i); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    return $$('.wi', el);
  }
  function splitChars(el) {
    const text = el.textContent;
    el.setAttribute('aria-label', text);
    el.innerHTML = [...text].map(c => `<span class="ch" aria-hidden="true">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
    return $$('.ch', el);
  }

  /* ------------------------------------------------------------------
     1. LOADER + HERO INTRO
     ------------------------------------------------------------------ */
  const heroWords = splitWords($('.hero-title'));
  gsap.set(heroWords, { yPercent: 118 });
  gsap.set('.hero [data-fade]', { y: 26, autoAlpha: 0 });

  // Always open at the top with scrolling locked until the curtain has lifted,
  // otherwise a wheel flick (or a restored scroll position) plays the intro off-screen.
  // (history.scrollRestoration is set to 'manual' inline in <head>, before Chrome restores)
  scrollTo(0, 0);
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  const lockScroll = on => lenis ? (on ? lenis.stop() : lenis.start()) : (document.body.style.overflow = on ? 'hidden' : '');
  lockScroll(true);

  const intro = gsap.timeline({ paused: true })
    .to('.loader-word', { yPercent: -40, autoAlpha: 0, duration: .7, ease: 'power3.in' })
    .to('.loader', { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'expo.inOut' }, '-=.15')
    .set('.loader', { display: 'none' })
    .call(() => {
      lockScroll(false);
      const target = location.hash.length > 1 && document.querySelector(location.hash);
      if (target && lenis) lenis.scrollTo(target, { duration: 1.6 });
    })
    .from('.hero-bg .ph', { scale: 1.35, duration: 2.4 }, '-=.75')
    .to(heroWords, { yPercent: 0, duration: 1.4, stagger: .08 }, '-=2.1')
    .to('.hero [data-fade]', { y: 0, autoAlpha: 1, duration: 1.1, stagger: .12, ease: 'power3.out' }, '-=1.1');

  // Lift the curtain only once fonts AND the hero photo are ready (decoded, so the
  // zoom starts on the photo, not the fallback gradient), but never wait > 3.5s.
  const heroSrc = (getComputedStyle($('.hero-bg .ph')).backgroundImage.match(/url\(["']?([^"')]+)/) || [])[1];
  const imageReady = src => new Promise(res => {
    const img = new Image();
    img.onload = () => (img.decode ? img.decode() : Promise.resolve()).then(res, res);
    img.onerror = res;
    img.src = src;
  });
  Promise.race([
    Promise.all([document.fonts ? document.fonts.ready : null, heroSrc ? imageReady(heroSrc) : null]),
    new Promise(res => setTimeout(res, 3500)),
  ]).then(() => setTimeout(() => { intro.play(); ScrollTrigger.refresh(); }, 250));

  // hero parallax out
  gsap.to('.hero-bg .ph', { yPercent: 14, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to(['.hero-title', '.hero-right'], { y: -80, autoAlpha: .15, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ------------------------------------------------------------------
     GENERIC: split headings (masked word rise) + fades
     ------------------------------------------------------------------ */
  $$('[data-split]').forEach(el => {
    if (el.dataset.split === 'hero') return;
    const words = splitWords(el);
    gsap.from(words, {
      yPercent: 118, rotate: 4, duration: 1.3, stagger: .07,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });
  $$('[data-fade]').forEach(el => {
    if (el.closest('.hero')) return;
    gsap.from(el, { y: 28, autoAlpha: 0, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });

  /* ------------------------------------------------------------------
     2. ABOUT — curve draws with scroll, bubbles grow + arch-reveal
     ------------------------------------------------------------------ */
  // The SVG is stretched (preserveAspectRatio="none") with a non-scaling
  // stroke, so dashes are laid out in screen pixels. pathLength can't be
  // used; measure the on-screen length instead and redo it on refresh.
  // getPointAtLength is slow (≈150–250ms for 400 calls), so the path is
  // sampled once here, while the loader still covers the page; re-measuring
  // on refresh is then pure arithmetic and never stalls a scroll frame.
  const curve = $('#curve');
  const curvePts = (() => {
    const total = curve.getTotalLength(), N = 240, pts = [];
    for (let i = 0; i <= N; i++) { const pt = curve.getPointAtLength(total * i / N); pts.push([pt.x, pt.y]); }
    return pts;
  })();
  const curveLen = () => {
    const svg = curve.ownerSVGElement, vb = svg.viewBox.baseVal;
    const sx = svg.clientWidth / vb.width, sy = svg.clientHeight / vb.height;
    let len = 0;
    for (let i = 1; i < curvePts.length; i++)
      len += Math.hypot((curvePts[i][0] - curvePts[i - 1][0]) * sx, (curvePts[i][1] - curvePts[i - 1][1]) * sy);
    len = Math.ceil(len * 1.002) + 4;   // chords slightly undershoot the true arc length
    curve.style.strokeDasharray = len;
    return len;
  };
  gsap.fromTo(curve, { strokeDashoffset: curveLen }, { strokeDashoffset: 0, ease: 'none',
    scrollTrigger: { trigger: '#orbit', start: 'top 75%', end: 'bottom 60%', scrub: 1, invalidateOnRefresh: true } });

  $$('.bubble').forEach(b => {
    const media = $('.bubble-media', b), inner = $('.bubble-inner', b), label = $('.bubble-label', b);
    gsap.timeline({ defaults: { ease: 'none' },
      scrollTrigger: { trigger: b, start: 'top 100%', end: 'top 40%', scrub: 1 } })
      .fromTo(media, { scale: .3, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1, ease: 'power2.out' })
      // the portrait rises as an arch from the bottom until it fully replaces the scenic outer photo
      .fromTo(inner, { clipPath: 'circle(0% at 50% 100%)' }, { clipPath: 'circle(101% at 50% 100%)', duration: 1 }, .55)
      .fromTo($('.ph', inner.parentNode), { scale: 1.25 }, { scale: 1, duration: 1.4 }, 0)
      .fromTo(label, { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .5 }, 1.1);
  });

  /* ------------------------------------------------------------------
     3+4. CARDS — clip reveal from below, image un-zoom, parallax drift,
     and a soft fade-out as they leave the top of the screen
     ------------------------------------------------------------------ */
  const cards = $$('.reveal-card');
  cards.forEach(c => {
    gsap.set($('.media', c), { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set($('.media .ph', c), { scale: 1.3 });
    gsap.set($('.card-text', c), { y: 24, autoAlpha: 0 });
  });
  ScrollTrigger.batch(cards, {
    start: 'top 88%', once: true,
    onEnter: batch => {
      gsap.to(batch.map(c => $('.media', c)), { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, stagger: .12 });
      gsap.to(batch.map(c => $('.media .ph', c)), { scale: 1, duration: 1.8, stagger: .12 });
      gsap.to(batch.map(c => $('.card-text', c)), { y: 0, autoAlpha: 1, duration: 1.1, stagger: .12, delay: .25, ease: 'power3.out' });
    }
  });
  cards.forEach(c => {
    gsap.fromTo($('.media .ph', c), { yPercent: -6 }, { yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.to(c, { autoAlpha: .2, y: -30, ease: 'none',
      scrollTrigger: { trigger: c, start: 'bottom 30%', end: 'bottom -5%', scrub: true } });
  });

  /* ------------------------------------------------------------------
     5. GALLERY SEQUENCE — one pinned, scrubbed timeline
     ------------------------------------------------------------------ */
  const gs = $('.gs');
  if (gs) {
    const stage = $('.gs-stage', gs);
    const colsWrap = $('.gs-cols', gs);
    const cols = $$('.gs-col', gs);
    const center = $('.gs-col--c', gs);
    const focus = $('.gs-focus', gs);
    const others = $$('.gs-tile:not(.gs-focus)', gs);
    const frame = $('.gs-frame rect', gs);
    const menu = $('.gs-menu', gs);
    const hl = $('.gs-hl', menu);
    const items = $$('.it', menu);
    const tint = $('.gs-tint', gs);
    const full = $('.gs-full', gs);
    const fullHead = $$('.gs-full-head > *', gs);
    const chars = splitChars($('.gs-title', gs));

    const H = () => stage.offsetHeight;
    // y for the centre column so the focus tile sits dead-centre of the stage
    const focusY = () => H() / 2 - (focus.offsetTop + focus.offsetHeight / 2);
    // clip-path inset that exactly matches the focus tile's on-screen box
    const focusInset = () => {
      const left = colsWrap.offsetLeft - colsWrap.offsetWidth / 2 + center.offsetLeft + focus.offsetLeft; // cols are translateX(-50%)
      const top = (H() - focus.offsetHeight) / 2;
      const right = stage.offsetWidth - left - focus.offsetWidth;
      const bottom = H() - top - focus.offsetHeight;
      return `inset(${top}px ${right}px ${bottom}px ${left}px)`;
    };
    const itemStep = i => items[i].offsetTop - items[0].offsetTop;

    gsap.set(menu, { scale: .92, transformOrigin: '0% 0%' });

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: gs, start: 'top top', end: () => '+=' + H() * 7,
        pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1
      }
    });

    // a) title letters scatter, blur and vanish
    tl.to(chars, {
      x: () => gsap.utils.random(-vw() * .25, vw() * .25),
      y: () => gsap.utils.random(-H() * .3, H() * .3),
      rotate: () => gsap.utils.random(-45, 45),
      filter: 'blur(14px)', autoAlpha: 0,
      duration: 1.3, stagger: { each: .06, from: 'random' }
    }, 0);

    // b) masonry columns rise from below at different speeds
    cols.forEach(col => {
      const shift = parseFloat(col.dataset.shift || 0);
      tl.fromTo(col,
        { y: () => H() * (1.05 + Math.abs(shift)) },
        { y: () => focusY() + H() * shift, duration: 3.2, ease: 'power1.out' }, .5);
    });

    // c) everything except the focus tile shrinks away
    tl.to(others, { scale: .5, autoAlpha: 0, duration: 1, stagger: { each: .05, from: 'random' } }, 3.6);

    // d) gold frame traces around the focus tile
    //    (rect is sized in px, so its perimeter is the dash length)
    const frameLen = () => {
      const r = frame.ownerSVGElement.getBoundingClientRect();
      const len = Math.ceil(2 * (r.width + r.height)) + 2;
      frame.style.strokeDasharray = len;
      return len;
    };
    tl.fromTo(frame, { strokeDashoffset: frameLen }, { strokeDashoffset: 0, duration: 1 }, 4.5);

    // e) context menu pops, highlight walks down the items
    tl.to(menu, { autoAlpha: 1, scale: 1, duration: .35, ease: 'back.out(2)' }, 5.4)
      .to(hl, { y: () => itemStep(1), duration: .3 }, 5.95)
      .to(hl, { y: () => itemStep(2), duration: .3 }, 6.35)
      .to(hl, { y: () => itemStep(3), duration: .3 }, 6.75)
      .to(items[3], { color: '#F0CF83', duration: .2 }, 6.95);

    // f) menu + frame fade, image tints gold
    tl.to([menu, frame], { autoAlpha: 0, duration: .35 }, 7.35)
      .to(tint, { opacity: .9, duration: .6 }, 7.35);

    // g) gold panel expands from the tile to full-bleed
    tl.set(full, { autoAlpha: 1, clipPath: focusInset }, 7.9)
      .to(full, { clipPath: 'inset(0px 0px 0px 0px)', duration: 1.2, ease: 'power2.inOut' }, 7.9)
      .fromTo(fullHead, { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .8, stagger: .15, ease: 'power2.out' }, 8.8)
      .to({}, { duration: .5 });
  }

  /* ------------------------------------------------------------------
     6. PRINCIPLES — rules draw left→right, rows rise
     ------------------------------------------------------------------ */
  $$('.plist li').forEach((li, i) => {
    gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 92%', once: true }, delay: i * .04 })
      .from($('.rule', li), { scaleX: 0, duration: 1.4 })
      .from($$('span', li), { y: 22, autoAlpha: 0, duration: 1, stagger: .08, ease: 'power3.out' }, .1);
  });

  /* ------------------------------------------------------------------
     7. WHAT I DO — pinned title sharpens from blur, steps clip-reveal
     ------------------------------------------------------------------ */
  gsap.timeline({ scrollTrigger: { trigger: '.do-pin', start: 'top top', end: '+=90%', pin: true, scrub: 1 } })
    .fromTo('.do-title', { filter: 'blur(18px)', autoAlpha: .12, scale: .88 },
                         { filter: 'blur(0px)', autoAlpha: 1, scale: 1, ease: 'power2.out', duration: 1 })
    .to('.do-title', { y: () => -vh() * .12, duration: .4 });

  $$('.step').forEach(step => {
    const rev = step.classList.contains('rev');
    gsap.timeline({ defaults: { ease: 'none' },
      scrollTrigger: { trigger: step, start: 'top 95%', end: 'top 45%', scrub: 1 } })
      .fromTo($('.step-media', step),
        { clipPath: rev ? 'inset(0% 0% 100% 100%)' : 'inset(0% 100% 100% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 })
      .fromTo($('.step-media .ph', step), { scale: 1.3 }, { scale: 1, duration: 1.2 }, 0)
      .fromTo($('.step-txt', step), { x: rev ? 40 : -40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: .6 }, .5);
  });

  /* ------------------------------------------------------------------
     8. QUIZZES — staggered rise + pointer tilt
     ------------------------------------------------------------------ */
  const quizzes = $$('.quiz');
  gsap.set(quizzes, { y: 70, autoAlpha: 0 });
  ScrollTrigger.batch(quizzes, { start: 'top 90%', once: true,
    onEnter: b => gsap.to(b, { y: 0, autoAlpha: 1, duration: 1.2, stagger: .12 }) });
  if (matchMedia('(hover:hover)').matches) quizzes.forEach(q => {
    const rx = gsap.quickTo(q, 'rotationX', { duration: .6, ease: 'power3.out' });
    const ry = gsap.quickTo(q, 'rotationY', { duration: .6, ease: 'power3.out' });
    q.addEventListener('pointermove', e => {
      const r = q.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - .5) * 10);
      rx(-((e.clientY - r.top) / r.height - .5) * 10);
    });
    q.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });

  /* ------------------------------------------------------------------
     10. CTA — arch opens, cards float + fade, bg fades to pale,
         newsletter ink shifts from cream to wine
     ------------------------------------------------------------------ */
  // The arch opens through clip-path only: animating margin + border-radius
  // re-laid-out and repainted the whole 250vh arch on every frame.
  const arch = $('.cta-arch');
  const archClip = (side, r) => `inset(0% ${side}% 0% ${side}% round 50% 50% 0% 0% / ${r}px ${r}px 0px 0px)`;
  gsap.fromTo(arch,
    { clipPath: () => archClip(5, Math.round(Math.min(vw() * .3, 380))) },
    { clipPath: archClip(0, 0), ease: 'none',
      scrollTrigger: { trigger: arch, start: 'top 100%', end: 'top 5%', scrub: true, invalidateOnRefresh: true } });
  gsap.fromTo('.cta-bg .ph', { scale: 1.35 }, { scale: 1.1, ease: 'none',
    scrollTrigger: { trigger: arch, start: 'top bottom', end: 'bottom bottom', scrub: true } });

  $$('[data-speed]').forEach(el => {
    const speed = parseFloat(el.dataset.speed);
    const tl = gsap.timeline({ defaults: { ease: 'none' },
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
    tl.fromTo(el, { y: () => vh() * speed * .5 }, { y: () => -vh() * speed * .5, duration: 1 }, 0);
    if (el.matches('.float-card')) {
      tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: .25 }, 0)
        .to(el, { autoAlpha: 0, duration: .25 }, .75);
    }
  });

  gsap.timeline({ defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.news', start: 'top 85%', end: 'top 25%', scrub: true } })
    .to('.cta-pale', { opacity: 1 }, 0)
    // on .cta-arch so the float-card labels follow the ink too
    .fromTo('.cta-arch', { '--news-ink': '#FFF8EE', '--label-shadow': 'rgba(40,20,10,0.55)' },
                         { '--news-ink': '#6B1D22', '--label-shadow': 'rgba(40,20,10,0)' }, 0);

  /* ------------------------------------------------------------------
     11. FOOTER — wordmark rises out of the bottom edge
     ------------------------------------------------------------------ */
  gsap.fromTo('.wordmark span', { yPercent: 100 }, { yPercent: 0, ease: 'none',
    scrollTrigger: { trigger: 'footer', start: 'top 85%', end: 'bottom bottom', scrub: true } });

  /* ------------------------------------------------------------------ */
  ScrollTrigger.sort();
  addEventListener('load', () => ScrollTrigger.refresh());
})();
