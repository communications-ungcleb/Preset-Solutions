// Preset Solutions — site behavior (vanilla JS, no build step)
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Year ---------- */
  document.querySelectorAll('.js-year').forEach(el => el.textContent = new Date().getFullYear());

  /* ---------- Active nav link ---------- */
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });

  /* ---------- Nav scroll state ---------- */
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 30) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');

    const toTop = document.querySelector('.back-to-top');
    if (toTop) toTop.classList.toggle('show', window.scrollY > 700);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const panel = document.querySelector('.mobile-panel');
  const closeBtn = document.querySelector('.mobile-panel-close');
  if (toggle && panel) {
    toggle.addEventListener('click', () => { panel.classList.add('is-open'); document.body.style.overflow = 'hidden'; });
  }
  if (closeBtn && panel) {
    closeBtn.addEventListener('click', () => { panel.classList.remove('is-open'); document.body.style.overflow = ''; });
  }
  panel?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    panel.classList.remove('is-open'); document.body.style.overflow = '';
  }));

  /* ---------- Back to top ---------- */
  document.querySelector('.back-to-top')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-scale');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach((el, i) => {
      el.style.setProperty('--i', el.closest('.stagger') ? Array.from(el.parentElement.children).indexOf(el) : 0);
      io.observe(el);
    });
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('.js-counter');
  if (counters.length && 'IntersectionObserver' in window) {
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10) || 0;
        const dur = 1400;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(eased * target).toLocaleString();
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = target.toLocaleString();
        };
        requestAnimationFrame(step);
        io2.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(el => io2.observe(el));
  }

  /* ---------- Client logo marquee ---------- */
  const marqueeTrack = document.querySelector('.js-marquee-track');
  if (marqueeTrack && typeof CLIENT_LOGOS !== 'undefined') {
    const list = CLIENT_LOGOS.slice(0, 40);
    const build = () => list.map(c =>
      `<img src="assets/img/clients/${encodeURIComponent(c.file)}" alt="${c.name}" loading="lazy">`
    ).join('');
    marqueeTrack.innerHTML = build() + build();
  }

  /* ---------- Full client logo wall (portfolio page) ---------- */
  const wall = document.querySelector('.js-logowall');
  if (wall && typeof CLIENT_LOGOS !== 'undefined') {
    wall.innerHTML = CLIENT_LOGOS.map(c =>
      `<div class="logo-cell"><img src="assets/img/clients/${encodeURIComponent(c.file)}" alt="${c.name}" loading="lazy" title="${c.name}"></div>`
    ).join('');
  }

  /* ---------- Product grid renderers ---------- */
  if (typeof PRODUCTS !== 'undefined') {
    document.querySelectorAll('.js-product-grid').forEach(grid => {
      const limit = parseInt(grid.dataset.limit, 10) || PRODUCTS.length;
      grid.innerHTML = PRODUCTS.slice(0, limit).map(p => `
        <a class="product-card ${p.accent} reveal" href="${p.page}" aria-label="${p.name} — ${p.tagline}">
          <div class="pc-img"><img src="${p.photo}" alt="" loading="lazy"></div>
          <div class="pc-body">
            <img class="pc-logo" src="${p.logoWhite}" alt="${p.name} logo">
            <p class="pc-tagline">${p.tagline}</p>
            <span class="pc-link" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </span>
          </div>
        </a>
      `).join('');
      grid.querySelectorAll('.reveal').forEach(el => {
        if ('IntersectionObserver' in window) {
          const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
          }, { threshold: 0.1 });
          obs.observe(el);
        } else el.classList.add('in');
      });
    });

    document.querySelectorAll('.js-related-products').forEach(box => {
      const exclude = box.dataset.exclude;
      const items = PRODUCTS.filter(p => p.slug !== exclude).slice(0, 4);
      box.innerHTML = items.map(p => `
        <a class="related-chip ${p.accent}" href="${p.page}">
          <img src="${p.logo}" alt="${p.name}"> ${p.name}
        </a>
      `).join('');
    });
  }

  /* ---------- Contact form (client-side only) ---------- */
  const form = document.querySelector('.js-contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const success = document.querySelector('.form-success');
      const btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      setTimeout(() => {
        form.reset();
        if (btn) { btn.disabled = false; btn.textContent = 'Send Message'; }
        success?.classList.add('show');
      }, 700);
    });
  }
});
