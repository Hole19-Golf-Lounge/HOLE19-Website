// HOLE19 GOLF LOUNGE — site interactions
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Promo popup (tournament poster) ---------- */
  const promoModal = document.getElementById('promoModal');
  const promoSnoozeKey = 'hole19_promo_snooze_until';

  if (promoModal) {
    const isSnoozed = () => {
      let snoozeUntil = 0;
      try { snoozeUntil = parseInt(localStorage.getItem(promoSnoozeKey), 10) || 0; } catch (e) {}
      return Date.now() <= snoozeUntil;
    };

    if (!isSnoozed()) {
      promoModal.classList.add('open');
    }

    /* Header logo → reopen the popup (unless snoozed) when returning home */
    document.getElementById('headerLogoLink')?.addEventListener('click', () => {
      if (!isSnoozed()) promoModal.classList.add('open');
    });

    /* Flag toggle: EN default, switch poster image by language */
    const posterImg = document.getElementById('promoPosterImg');
    const flagBtns = document.querySelectorAll('.promo-flag-btn');
    flagBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        if (posterImg && posterImg.dataset[lang]) posterImg.src = posterImg.dataset[lang];
        flagBtns.forEach(b => b.classList.toggle('active', b === btn));
      });
    });

    const closePromo = () => promoModal.classList.remove('open');
    const snoozePromo = () => {
      try { localStorage.setItem(promoSnoozeKey, String(Date.now() + 2 * 60 * 60 * 1000)); } catch (e) {}
      closePromo();
    };

    document.getElementById('promoModalClose')?.addEventListener('click', closePromo);
    document.getElementById('promoModalSnooze')?.addEventListener('click', snoozePromo);
    document.getElementById('promoModalBackdrop')?.addEventListener('click', closePromo);

    /* Fullscreen poster lightbox */
    const promoLightbox = document.getElementById('promoLightbox');
    const promoLightboxImg = document.getElementById('promoLightboxImg');
    posterImg?.addEventListener('click', () => {
      promoLightboxImg.src = posterImg.src;
      promoLightboxImg.alt = posterImg.alt;
      promoLightbox.classList.add('open');
    });
    const closeLightbox = () => promoLightbox.classList.remove('open');
    document.getElementById('promoLightboxClose')?.addEventListener('click', closeLightbox);
    promoLightbox?.addEventListener('click', (e) => {
      if (e.target === promoLightbox) closeLightbox();
    });
  }

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

  /* ---------- Photo sliders (reusable: About + Reviews + Explore) ----------
     Auto-advances smoothly when idle; pauses on hover/touch/manual nav;
     loops seamlessly by duplicating the slide set once and wrapping the
     scroll position back when it crosses the halfway point. */
  function initPhotoSlider(track, dots, prevBtn, nextBtn, opts) {
    if (!track) return;
    opts = opts || {};
    const speed = opts.speed || 26; // px per second

    const originalSlides = Array.from(track.children);
    const originalCount = originalSlides.length;
    if (!originalCount) return;

    // Duplicate the set once so the loop can wrap without a visible jump
    if (originalCount > 1) {
      originalSlides.forEach(slide => {
        const clone = slide.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.querySelectorAll('a,button').forEach(el => el.setAttribute('tabindex', '-1'));
        track.appendChild(clone);
      });
    }

    const getSlides = () => Array.from(track.children);

    const currentIndex = () => {
      const pos = track.scrollLeft;
      let idx = 0, minDist = Infinity;
      getSlides().forEach((s, i) => {
        const dist = Math.abs(s.offsetLeft - pos);
        if (dist < minDist) { minDist = dist; idx = i; }
      });
      return idx;
    };

    const goTo = (i) => {
      const slides = getSlides();
      i = ((i % slides.length) + slides.length) % slides.length;
      track.scrollTo({ left: slides[i].offsetLeft, behavior: 'smooth' });
    };

    const updateDots = () => {
      if (!dots || !dots.length) return;
      const idx = currentIndex() % originalCount;
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    };

    const wrapCheck = () => {
      if (originalCount <= 1) return;
      const half = track.scrollWidth / 2;
      if (track.scrollLeft >= half - 1) track.scrollLeft -= half;
    };

    let scrollTimer;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => { updateDots(); wrapCheck(); }, 80);
    }, { passive: true });

    // Pause auto-advance on interaction, resume after a short idle delay.
    // Timestamp-based (not a paired pause/resume event toggle) so a missed
    // touchend/touchcancel on mobile can never leave it stuck paused forever.
    const idleDelay = opts.idleDelay || 2200;
    let lastInteraction = 0;
    let hovering = false;
    const markInteraction = (delay) => { lastInteraction = Date.now() + ((delay || idleDelay) - idleDelay); };
    const isPaused = () => hovering || (Date.now() - lastInteraction) < idleDelay;

    // NOTE: only bind to direct user-input events, never the 'scroll' event
    // itself — our own auto-scroll increments also fire 'scroll', and
    // treating those as "interaction" would permanently freeze the loop.
    track.addEventListener('pointerdown', () => markInteraction(), { passive: true });
    track.addEventListener('touchstart', () => markInteraction(), { passive: true });
    track.addEventListener('touchmove', () => markInteraction(), { passive: true });
    track.addEventListener('wheel', () => markInteraction(), { passive: true });

    // Hover-pause only where hover is a real pointer capability (skip touch,
    // where browsers can emit synthetic mouseenter with no matching mouseleave)
    if (window.matchMedia && window.matchMedia('(hover: hover)').matches) {
      track.addEventListener('mouseenter', () => { hovering = true; });
      track.addEventListener('mouseleave', () => { hovering = false; markInteraction(300); });
    }

    dots?.forEach((dot, i) => dot.addEventListener('click', () => { markInteraction(3000); goTo(i); }));
    prevBtn?.addEventListener('click', () => { markInteraction(3000); goTo(currentIndex() - 1); });
    nextBtn?.addEventListener('click', () => { markInteraction(3000); goTo(currentIndex() + 1); });

    // Continuous seamless auto-scroll
    if (originalCount > 1) {
      let inView = false;
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { inView = e.isIntersecting; });
      }, { threshold: 0.1 });
      io.observe(track);

      let lastTs = null;
      const tick = (ts) => {
        if (lastTs == null) lastTs = ts;
        const dt = ts - lastTs;
        lastTs = ts;
        if (!isPaused() && inView && !document.hidden) {
          track.scrollLeft += speed * (dt / 1000);
          const half = track.scrollWidth / 2;
          if (half > 0 && track.scrollLeft >= half) track.scrollLeft -= half;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
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
  initPhotoSlider(
    document.getElementById('exploreSliderTrack'),
    document.querySelectorAll('#exploreDots .dot'),
    document.getElementById('explorePrev'),
    document.getElementById('exploreNext')
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
