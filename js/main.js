// HOLE19 GOLF LOUNGE — site interactions
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  const mobileClose = document.getElementById('mobileClose');

  const openNav = () => mobileNav.classList.add('open');
  const closeNav = () => mobileNav.classList.remove('open');

  navToggle?.addEventListener('click', openNav);
  mobileClose?.addEventListener('click', closeNav);
  mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));

  /* ---------- Active nav link on scroll ---------- */
  const navLinks = document.querySelectorAll('.main-nav a');
  const sections = Array.from(navLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const spy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === id);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(sec => spy.observe(sec));

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- Space items auto-reveal (added via JS since not marked in markup loop) ---------- */
  document.querySelectorAll('.sp-item').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  /* ---------- Rates promo dismiss (view regular prices) ---------- */
  document.querySelectorAll('.promo-dismiss').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.rate-card-wrap')?.classList.add('promo-off');
    });
  });

  /* ---------- Photo sliders (reusable: About + Reviews) ---------- */
  function initPhotoSlider(track, dots, prevBtn, nextBtn) {
    if (!track) return;
    const slides = Array.from(track.children);
    const currentIndex = () => {
      const pos = track.scrollLeft;
      let idx = 0, minDist = Infinity;
      slides.forEach((s, i) => {
        const dist = Math.abs(s.offsetLeft - pos);
        if (dist < minDist) { minDist = dist; idx = i; }
      });
      return idx;
    };
    const goTo = (i) => {
      i = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: slides[i].offsetLeft, behavior: 'smooth' });
    };
    const updateDots = () => {
      if (!dots || !dots.length) return;
      const idx = currentIndex();
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    };
    let scrollTimer;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(updateDots, 80);
    }, { passive: true });
    dots?.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
    prevBtn?.addEventListener('click', () => goTo(currentIndex() - 1));
    nextBtn?.addEventListener('click', () => goTo(currentIndex() + 1));
    window.addEventListener('resize', () => { track.scrollLeft = slides[currentIndex()].offsetLeft; });
  }

  initPhotoSlider(
    document.getElementById('aboutSliderTrack'),
    document.querySelectorAll('#aboutDots .dot'),
    document.getElementById('aboutPrev'),
    document.getElementById('aboutNext')
  );
  initPhotoSlider(
    document.getElementById('reviewSliderTrack'),
    null,
    document.getElementById('reviewPrev'),
    document.getElementById('reviewNext')
  );

  /* ---------- Menu tabs ---------- */
  const tabs = document.querySelectorAll('.menu-tab');
  const panels = document.querySelectorAll('.menu-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
    });
  });

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Language toggle (EN / KO) ---------- */
  const LANG_KEY = 'hole19_lang';
  const langEnBtn = document.getElementById('langEn');
  const langKoBtn = document.getElementById('langKo');

  function setLang(lang) {
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.lang = lang === 'ko' ? 'ko' : 'en';
    langEnBtn?.classList.toggle('active', lang === 'en');
    langKoBtn?.classList.toggle('active', lang === 'ko');
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  }

  let savedLang = 'en';
  try { savedLang = localStorage.getItem(LANG_KEY) || 'en'; } catch (e) {}
  if (savedLang === 'ko') setLang('ko');

  langEnBtn?.addEventListener('click', () => setLang('en'));
  langKoBtn?.addEventListener('click', () => setLang('ko'));

});
