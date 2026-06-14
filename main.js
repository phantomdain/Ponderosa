/* ================================================================
   PONDEROSA EVENTS PLACE – Main JavaScript
   ================================================================ */

// ── Footer year ─────────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ── Sticky header ────────────────────────────────────────────────
const header = document.getElementById('site-header');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  const isDesktop = window.innerWidth > 768;

  header.classList.add('scrolled');

  if (isDesktop) {
    if (currentScrollY > lastScrollY && currentScrollY > 80) {
      header.classList.add('nav--hidden');
    } else {
      header.classList.remove('nav--hidden');
    }
  }

  lastScrollY = currentScrollY;
}, { passive: true });

// ── Mobile nav toggle ────────────────────────────────────────────
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  header.classList.toggle('nav-open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    header.classList.remove('nav-open');
    document.body.style.overflow = '';
  });
});

// ── Active nav link on scroll ────────────────────────────────────
const sections = document.querySelectorAll('section[id], div[id]');
const navItems = document.querySelectorAll('.nav__links a');

const observerOptions = { rootMargin: '-40% 0px -40% 0px', threshold: 0 };
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(a => {
        a.style.color = '';
        a.style.borderBottomColor = '';
      });
      const active = document.querySelector(`.nav__links a[href="#${entry.target.id}"]`);
      if (active && !active.classList.contains('nav__cta')) {
        active.style.color = 'var(--clr-gold)';
      }
    }
  });
}, observerOptions);

sections.forEach(s => sectionObserver.observe(s));

// ── Scroll reveal ────────────────────────────────────────────────
const revealElements = [
  '.section-header',
  '.about__media',
  '.about__text',
  '.venue-card',
  '.event-tile',
  '.why__item',
  '.gallery__item',
  '.contact__info',
  '.contact__form-wrap',
  '.footer__brand',
  '.footer__links',
  '.footer__contact',
];

revealElements.forEach(selector => {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 0.07}s`;
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Inquiry form ─────────────────────────────────────────────────
const form    = document.getElementById('inquiry-form');
const success = document.getElementById('form-success');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Client-side validation
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#e06060';
        valid = false;
      }
    });
    if (!valid) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        success.hidden = false;
        form.reset();
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const data = await res.json();
        const msg = data.errors ? data.errors.map(e => e.message).join(', ') : 'Something went wrong. Please try again.';
        alert(msg);
      }
    } catch {
      alert('Network error. Please check your connection and try again.');
    } finally {
      btn.textContent = 'Send Inquiry';
      btn.disabled = false;
    }
  });
}

// ── Venue carousels ──────────────────────────────────────────────
document.querySelectorAll('[data-carousel]').forEach(carousel => {
  const track = carousel.querySelector('.venue-carousel__track');
  const imgs  = track.querySelectorAll('img');
  const dots  = carousel.querySelectorAll('.venue-carousel__dot');
  let current = 0;

  function goTo(index) {
    current = (index + imgs.length) % imgs.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  carousel.querySelector('.venue-carousel__btn--prev').addEventListener('click', () => goTo(current - 1));
  carousel.querySelector('.venue-carousel__btn--next').addEventListener('click', () => goTo(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
});

// ── Gallery images pool ───────────────────────────────────────────
const galleryImages = [
  'img/gallery/ZVE00237-1.jpg',
  'img/gallery/ZVE00974-3.jpg',
  'img/gallery/ZVE04847.jpg',
  'img/gallery/ZVE06002.jpg',
  'img/gallery/ZVE06595.jpg',
  'img/gallery/ZVE07087.jpg',
  'img/gallery/ZVE07220.jpg',
  'img/gallery/ZVE07289.jpg',
  'img/gallery/ZVE07541.jpg',
  'img/gallery/ZVE07694.jpg',
  'img/gallery/ZVE08267.jpg',
];

// Shared shuffle: first 9 go to gallery, 10th and 11th to section images
const shuffledPool = [...galleryImages].sort(() => Math.random() - 0.5);

// ── Hero background slideshow ────────────────────────────────────
(function heroSlideshow() {
  const container = document.querySelector('.hero__slides');
  if (!container) return;

  const images = [...galleryImages].sort(() => Math.random() - 0.5);

  images.forEach((src, i) => {
    const slide = document.createElement('div');
    slide.className = 'hero__slide';
    if (i === 0) slide.classList.add('active');
    slide.style.backgroundImage = `url('${src}')`;
    container.appendChild(slide);
  });

  const slides = container.querySelectorAll('.hero__slide');
  let current = 0;

  setInterval(() => {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 5000);
})();

// ── Section images (About + Bienvenido) ──────────────────────────
(function randomSectionImages() {
  function fadeImg(img, src) {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.7s ease';
    const reveal = () => { img.style.opacity = '1'; };
    img.onload  = reveal;
    img.onerror = reveal;
    img.src = src;
  }

  const aboutImg = document.querySelector('.about__img-frame img');
  if (aboutImg) fadeImg(aboutImg, shuffledPool[9]);

  const bienImg = document.querySelector('.venue-card--featured .venue-card__img-wrap > img');
  if (bienImg) fadeImg(bienImg, shuffledPool[10]);
})();

// ── Gallery shuffle + staggered entrance ─────────────────────────
(function shuffleGallery() {
  const items = document.querySelectorAll('#gallery-grid .gallery__mason-item');
  if (!items.length) return;
  const picked = shuffledPool.slice(0, 9);

  // Set all srcs first so lightbox has the full list immediately
  items.forEach((item, i) => { item.querySelector('img').src = picked[i]; });

  // Staggered fade-in on load
  items.forEach((item, i) => {
    const img = item.querySelector('img');
    const show = () => setTimeout(() => item.classList.add('gallery--visible'), i * 90);
    img.onload  = show;
    img.onerror = show;
    // If already cached and loaded, trigger manually
    if (img.complete) show();
  });
})();

// ── Lightbox ──────────────────────────────────────────────────────────
(function initLightbox() {
  // Inject markup
  const lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.innerHTML = `
    <button class="lightbox__close" aria-label="Close">&times;</button>
    <button class="lightbox__nav lightbox__nav--prev" aria-label="Previous">&#8249;</button>
    <button class="lightbox__nav lightbox__nav--next" aria-label="Next">&#8250;</button>
    <img class="lightbox__img" src="" alt="Ponderosa Events Place" />
    <div class="lightbox__counter"></div>
  `;
  document.body.appendChild(lb);

  const lbImg     = lb.querySelector('.lightbox__img');
  const lbCounter = lb.querySelector('.lightbox__counter');
  let srcs    = [];
  let current = 0;

  function showImg(src) {
    lbImg.style.opacity = '0';
    lbImg.onload = () => { lbImg.style.opacity = '1'; };
    lbImg.src = src;
  }

  function open(index) {
    current = (index + srcs.length) % srcs.length;
    showImg(srcs[current]);
    lbCounter.textContent = `${current + 1} / ${srcs.length}`;
    lb.classList.add('lightbox--open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lb.classList.remove('lightbox--open');
    document.body.style.overflow = '';
  }

  lb.querySelector('.lightbox__close').addEventListener('click', close);
  lb.querySelector('.lightbox__nav--prev').addEventListener('click', () => open(current - 1));
  lb.querySelector('.lightbox__nav--next').addEventListener('click', () => open(current + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('lightbox--open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  open(current - 1);
    if (e.key === 'ArrowRight') open(current + 1);
  });

  // Called after gallery shuffle sets final srcs
  window._attachLightbox = function() {
    const items = document.querySelectorAll('#gallery-grid .gallery__mason-item');
    srcs = [...items].map(item => item.querySelector('img').src);
    items.forEach((item, i) => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => open(i));
    });
  };
})();

// ── Attach lightbox to gallery (runs after initLightbox is defined) ──
if (window._attachLightbox) window._attachLightbox();

// ── Smooth scroll for browsers that don't support CSS scroll-behavior ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
