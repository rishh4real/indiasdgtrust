/* Page-wide interaction enhancements. */
(() => {
  const overviewMode = new URLSearchParams(window.location.search).has('overview');
  const reduce = overviewMode || matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ═══════════════════════════════════════════════════
     0. INJECT CSS
  ═══════════════════════════════════════════════════ */
  const css = `
  /* ── Scroll-reveal base ── */
  .sr {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity .75s cubic-bezier(.2,.8,.2,1), transform .75s cubic-bezier(.2,.8,.2,1);
    will-change: opacity, transform;
  }
  .sr.sr-left  { transform: translateX(-48px); }
  .sr.sr-right { transform: translateX(48px); }
  .sr.sr-scale { transform: scale(.92); }
  .sr.is-visible {
    opacity: 1 !important;
    transform: none !important;
  }

  /* ── Stagger children ── */
  .sr-group > * {
    opacity: 0;
    transform: translateY(32px);
    transition: opacity .65s cubic-bezier(.2,.8,.2,1), transform .65s cubic-bezier(.2,.8,.2,1);
  }
  .sr-group.is-visible > *:nth-child(1) { transition-delay:.08s }
  .sr-group.is-visible > *:nth-child(2) { transition-delay:.18s }
  .sr-group.is-visible > *:nth-child(3) { transition-delay:.28s }
  .sr-group.is-visible > *:nth-child(4) { transition-delay:.38s }
  .sr-group.is-visible > * { opacity:1; transform:none; }

  /* ── Area-card hover lift ── */
  .area-card {
    transition: transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s ease;
    cursor: default;
  }
  .area-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 28px 56px rgba(7,89,121,.14);
  }
  .area-image img {
    transition: transform .55s cubic-bezier(.2,.8,.2,1);
  }
  .area-card:hover .area-image img {
    transform: scale(1.06);
  }

  /* ── Scroll progress bar ── */
  #lp-progress {
    position: fixed;
    top: 0; left: 0;
    height: 3px;
    width: 0%;
    background: linear-gradient(90deg, #e7ac52, #075979);
    z-index: 9999;
    pointer-events: none;
    transition: width .1s linear;
    border-radius: 0 2px 2px 0;
  }

  /* ── Ambient leaf accent (hero left edge) ── */
  .lp-leaf-accent {
    position: absolute;
    left: 0; top: 0;
    width: min(7vw,100px);
    pointer-events: none;
    z-index: 5;
    opacity: .62;
    animation: lpLeafSway 8s ease-in-out infinite alternate;
    transform-origin: 50% 100%;
  }
  @keyframes lpLeafSway {
    0%  { transform: rotate(-2deg) translateX(0); }
    100%{ transform: rotate(3deg) translateX(4px); }
  }

  /* ── Cursor glow (desktop) ── */
  #lp-cursor {
    position: fixed;
    width: 36px; height: 36px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(231,172,82,.55) 0%, transparent 70%);
    pointer-events: none;
    z-index: 9998;
    transform: translate(-50%,-50%);
    transition: width .2s, height .2s, opacity .3s;
    opacity: 0;
    mix-blend-mode: multiply;
  }
  #lp-cursor.active { opacity: 1; }


  /* ── Scroll-cue bounce ── */
  .scroll-cue .scroll-arrow {
    display: inline-block;
    animation: lpBounce 1.8s ease-in-out infinite;
  }
  @keyframes lpBounce {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(6px); }
  }

  /* ── Section divider pulse line ── */
  .lp-divider {
    display: block;
    height: 2px;
    width: 0;
    background: linear-gradient(90deg, var(--amber), transparent);
    border-radius: 999px;
    transition: width 1.1s cubic-bezier(.2,.8,.2,1);
    margin-top: .5rem;
  }
  .lp-divider.is-visible { width: 96px; }

  /* reduced-motion: neutralise everything */
  @media (prefers-reduced-motion: reduce) {
    .sr, .sr-group > * { opacity:1!important; transform:none!important; transition:none!important; }
    .lp-leaf-accent, .scroll-cue .scroll-arrow { animation:none!important; }
    #lp-cursor { display:none; }
  }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ═══════════════════════════════════════════════════
     1. SCROLL PROGRESS BAR
  ═══════════════════════════════════════════════════ */
  const bar = document.createElement('div');
  bar.id = 'lp-progress';
  document.body.prepend(bar);
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });

  /* ═══════════════════════════════════════════════════
     2. CURSOR GLOW (fine pointer only)
  ═══════════════════════════════════════════════════ */
  if (!reduce && matchMedia('(pointer:fine)').matches) {
    const cur = document.createElement('div');
    cur.id = 'lp-cursor';
    document.body.appendChild(cur);
    let frameId = 0;
    let x = -200;
    let y = -200;
    window.addEventListener('mousemove', e => {
      x = e.clientX;
      y = e.clientY;
      cur.classList.add('active');
      if (frameId) return;
      frameId = requestAnimationFrame(() => {
        cur.style.left = x + 'px';
        cur.style.top = y + 'px';
        frameId = 0;
      });
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════
     3. INTERSECTION OBSERVER: scroll reveals
  ═══════════════════════════════════════════════════ */
  function observe(el, options = {}) {
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: options.threshold || 0.15, rootMargin: options.rootMargin || '0px 0px -60px 0px' });
    io.observe(el);
  }

  // Apply sr classes
  if (!reduce) {
    // Areas heading
    const areasH = document.querySelector('.areas-heading');
    if (areasH) { areasH.classList.add('sr'); observe(areasH); }

    // Area cards stagger
    const areasGrid = document.querySelector('.areas-grid');
    if (areasGrid) { areasGrid.classList.add('sr-group'); observe(areasGrid, { threshold: 0.08 }); }

    // Section headings
    document.querySelectorAll('.section-heading, .intro-section .section-heading').forEach(el => {
      el.classList.add('sr'); observe(el);
    });

    // About composition and purpose panels
    const aboutCopy = document.querySelector('.about-copy');
    const aboutVisual = document.querySelector('.about-visual');
    const aboutPillars = document.querySelector('.about-pillars');
    if (aboutCopy) { aboutCopy.classList.add('sr', 'sr-left'); observe(aboutCopy, { threshold: 0.08 }); }
    if (aboutVisual) { aboutVisual.classList.add('sr', 'sr-right'); observe(aboutVisual, { threshold: 0.08 }); }
    if (aboutPillars) { aboutPillars.classList.add('sr-group'); observe(aboutPillars, { threshold: 0.1 }); }

    // Programme overview
    const programmeHeading = document.querySelector('.programmes-heading');
    const programmeGrid = document.querySelector('.programmes-grid');
    const programmeStrengths = document.querySelector('.programme-strengths');
    if (programmeHeading) { programmeHeading.classList.add('sr'); observe(programmeHeading, { threshold: 0.08 }); }
    if (programmeGrid) { programmeGrid.classList.add('sr-group'); observe(programmeGrid, { threshold: 0.08 }); }
    if (programmeStrengths) { programmeStrengths.classList.add('sr'); observe(programmeStrengths, { threshold: 0.1 }); }

    // Partnership showcase
    const partnersHeading = document.querySelector('.partners-heading');
    const partnerCarousel = document.querySelector('.partner-carousel');
    if (partnersHeading) { partnersHeading.classList.add('sr'); observe(partnersHeading, { threshold: 0.08 }); }
    if (partnerCarousel) { partnerCarousel.classList.add('sr', 'sr-scale'); observe(partnerCarousel, { threshold: 0.06 }); }

    // Eyebrow dividers
    document.querySelectorAll('.section .eyebrow, .areas-heading .eyebrow, .partners-heading > .eyebrow').forEach(el => {
      const d = document.createElement('span');
      d.className = 'lp-divider';
      el.after(d);
      observe(d, { threshold: 0.8 });
    });
  }

  /* ═══════════════════════════════════════════════════
     5. RIPPLE on primary buttons
  ═══════════════════════════════════════════════════ */
  document.querySelectorAll('.button-primary').forEach(btn => {
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.addEventListener('click', function(e) {
      const r = btn.getBoundingClientRect();
      const rip = document.createElement('span');
      rip.style.cssText = `position:absolute;width:8px;height:8px;border-radius:50%;
        background:rgba(255,255,255,.55);pointer-events:none;
        left:${e.clientX - r.left - 4}px;top:${e.clientY - r.top - 4}px;
        animation:lpRipple .6s ease-out forwards`;
      btn.appendChild(rip);
      rip.addEventListener('animationend', () => rip.remove());
    });
  });
  const ripCSS = document.createElement('style');
  ripCSS.textContent = `@keyframes lpRipple{to{transform:scale(28);opacity:0}}`;
  document.head.appendChild(ripCSS);

  /* ═══════════════════════════════════════════════════
     6. SUBTLE 3D CARD RESPONSE
  ═══════════════════════════════════════════════════ */
  if (!reduce && matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.area-card, .programme-card').forEach(card => {
      const image = card.querySelector('.area-image img, .programme-media img');

      card.addEventListener('pointermove', event => {
        const bounds = card.getBoundingClientRect();
        const px = (event.clientX - bounds.left) / bounds.width;
        const py = (event.clientY - bounds.top) / bounds.height;
        const rotateX = (0.5 - py) * 7;
        const rotateY = (px - 0.5) * 8;

        card.style.transform = `perspective(1050px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
        card.style.setProperty('--shine-x', `${(px * 100).toFixed(1)}%`);
        card.style.setProperty('--shine-y', `${(py * 100).toFixed(1)}%`);
        card.style.setProperty('--shine-opacity', '1');

        if (image) {
          const dx = (px - 0.5) * 12;
          const dy = (py - 0.5) * 8;
          image.style.transform = `scale(1.06) translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
        }
      });

      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
        card.style.removeProperty('--shine-x');
        card.style.removeProperty('--shine-y');
        card.style.removeProperty('--shine-opacity');
        if (image) image.style.transform = '';
      });
    });
  }

  /* ═══════════════════════════════════════════════════
     7. SMOOTH ACTIVE NAV HIGHLIGHT on scroll
  ═══════════════════════════════════════════════════ */
  const sections = [...document.querySelectorAll('main > section[id], main > section > section[id]')];
  const navLinks = [...document.querySelectorAll('.immersive-nav-links a')];
  if (sections.length && navLinks.length) {
    const onScroll = () => {
      const scrollMid = window.scrollY + window.innerHeight * 0.4;
      let active = sections[0];
      sections.forEach(s => { if (s.offsetTop <= scrollMid) active = s; });
      navLinks.forEach(a => {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + active.id);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ═══════════════════════════════════════════════════
     8. POINTER-RESPONSIVE GLOW on About purpose panels
  ═══════════════════════════════════════════════════ */
  if (!reduce) {
    document.querySelectorAll('.about-pillar').forEach(card => {
      const placeGlow = event => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty('--blob-x', `${event.clientX - bounds.left}px`);
        card.style.setProperty('--blob-y', `${event.clientY - bounds.top}px`);
      };

      card.addEventListener('pointerenter', event => {
        placeGlow(event);
        card.classList.add('is-active');
      });
      card.addEventListener('pointermove', placeGlow, { passive: true });
      card.addEventListener('pointerdown', event => {
        placeGlow(event);
        card.classList.add('is-active');
      });
      card.addEventListener('pointerleave', () => card.classList.remove('is-active'));
      card.addEventListener('pointercancel', () => card.classList.remove('is-active'));
      card.addEventListener('pointerup', event => {
        if (event.pointerType !== 'mouse') {
          window.setTimeout(() => card.classList.remove('is-active'), 500);
        }
      });
    });
  }

  /* ═══════════════════════════════════════════════════
     9. FOOTER FADE-UP
  ═══════════════════════════════════════════════════ */
  const footer = document.querySelector('.dithered-footer');
  if (footer && !reduce) {
    footer.classList.add('sr');
    observe(footer, { threshold: 0.3 });
  }

})();
