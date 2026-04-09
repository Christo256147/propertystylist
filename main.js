/* ============================================================
   Tracey Masters Property Stylist — main.js
   Nav scroll, mobile menu, scroll animations, testimonials carousel, form
============================================================ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────────────────
     NAV: Background on scroll
  ────────────────────────────────────────────────────────── */
  const nav = document.getElementById('site-nav');

  function handleNavScroll() {
    if (window.scrollY > 80) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // run once on load in case page is already scrolled


  /* ──────────────────────────────────────────────────────────
     MOBILE MENU
  ────────────────────────────────────────────────────────── */
  const hamburger    = document.getElementById('hamburger');
  const mobileNav    = document.getElementById('mobile-nav');
  const mobileClose  = document.getElementById('mobile-nav-close');
  const mobileLinks  = document.querySelectorAll('.mobile-nav-link');

  function openMobileNav() {
    mobileNav.classList.add('is-open');
    mobileNav.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openMobileNav);
  mobileClose.addEventListener('click', closeMobileNav);

  mobileLinks.forEach(function (link) {
    link.addEventListener('click', closeMobileNav);
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
      closeMobileNav();
      hamburger.focus();
    }
  });


  /* ──────────────────────────────────────────────────────────
     SCROLL ANIMATIONS — IntersectionObserver
  ────────────────────────────────────────────────────────── */
  const animatedElements = document.querySelectorAll('.animate-fade');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    animatedElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show all immediately
    animatedElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }


  /* ──────────────────────────────────────────────────────────
     TESTIMONIALS CAROUSEL
  ────────────────────────────────────────────────────────── */
  const track       = document.getElementById('testimonials-track');
  const prevBtn     = document.getElementById('prev-testimonial');
  const nextBtn     = document.getElementById('next-testimonial');
  const dots        = document.querySelectorAll('.testimonial-dots .dot');
  const testimonials = document.querySelectorAll('.testimonial');
  let current = 0;
  const total = testimonials.length;

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = 'translateX(-' + (current * 100 / total) + '%)';

    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
      dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });
  }

  if (track && total > 0) {
    // Set up track to hold all slides in a row
    track.style.display = 'flex';
    track.style.width = (total * 100) + '%';

    testimonials.forEach(function (t) {
      t.style.width = (100 / total) + '%';
      t.style.flexShrink = '0';
    });

    prevBtn.addEventListener('click', function () {
      goTo(current - 1);
    });

    nextBtn.addEventListener('click', function () {
      goTo(current + 1);
    });

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        goTo(i);
      });
    });

    // Auto-advance every 6 seconds
    let autoplay = setInterval(function () {
      goTo(current + 1);
    }, 20000);

    // Pause on interaction
    function resetAutoplay() {
      clearInterval(autoplay);
      autoplay = setInterval(function () {
        goTo(current + 1);
      }, 20000);
    }

    prevBtn.addEventListener('click', resetAutoplay);
    nextBtn.addEventListener('click', resetAutoplay);
    dots.forEach(function (dot) {
      dot.addEventListener('click', resetAutoplay);
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
      const carousel = document.querySelector('.testimonials-carousel');
      if (!carousel) return;
      if (e.key === 'ArrowLeft') { goTo(current - 1); resetAutoplay(); }
      if (e.key === 'ArrowRight') { goTo(current + 1); resetAutoplay(); }
    });

    // Initialise
    goTo(0);
  }


  /* ──────────────────────────────────────────────────────────
     CONTACT FORM — Formspree + client-side validation
  ────────────────────────────────────────────────────────── */
  const form       = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Honeypot check — bots fill this, humans don't
      const honeypot = form.querySelector('#website').value;
      if (honeypot) {
        // Silently fake success so bots don't know they were caught
        showStatus('success', 'Thank you — Tracey will be in touch shortly.');
        form.reset();
        return;
      }

      // Basic client-side validation
      const name    = form.querySelector('#name').value.trim();
      const email   = form.querySelector('#email').value.trim();
      const message = form.querySelector('#message').value.trim();

      if (!name || !email || !message) {
        showStatus('error', 'Please fill in all required fields.');
        return;
      }

      if (!isValidEmail(email)) {
        showStatus('error', 'Please enter a valid email address.');
        return;
      }

      const submitBtn = form.querySelector('.btn-submit');
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          showStatus('success', 'Thank you — Tracey will be in touch shortly.');
          form.reset();
        } else {
          const data = await response.json().catch(function () { return {}; });
          if (data.errors) {
            showStatus('error', data.errors.map(function (err) { return err.message; }).join(', '));
          } else {
            showStatus('error', 'Something went wrong. Please try again or email directly.');
          }
        }
      } catch (err) {
        showStatus('error', 'Something went wrong. Please try again or email directly.');
      } finally {
        submitBtn.textContent = 'Send Enquiry';
        submitBtn.disabled = false;
      }
    });
  }

  function showStatus(type, message) {
    formStatus.textContent = message;
    formStatus.className = 'form-status ' + type;
    formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

})();
