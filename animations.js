/**
 * saferspaces – Scroll Animations & CountUp
 * IntersectionObserver-basiert, performant, a11y-respecting
 */

(function() {
  'use strict';

  // Respect reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== SCROLL REVEAL =====
  function initScrollReveal() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (!elements.length) return;

    if (prefersReducedMotion) {
      // Show everything immediately
      elements.forEach(el => el.classList.add('animate-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-visible');
          observer.unobserve(entry.target); // Only trigger once
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
  }

  // ===== COUNT UP ANIMATION =====
  function initCountUp() {
    const statsBar = document.getElementById('statsBar');
    if (!statsBar) return;

    // Handle static stat numbers (no count-up animation)
    statsBar.querySelectorAll('.stat-number[data-static]').forEach(el => {
      el.textContent = el.dataset.static;
    });

    // Make stat numbers with data-source clickable
    statsBar.querySelectorAll('.stat-number[data-source]').forEach(el => {
      el.addEventListener('click', () => window.open(el.dataset.source, '_blank'));
    });

    const numbers = statsBar.querySelectorAll('.stat-number[data-target]');
    if (!numbers.length) return;

    let hasCounted = false;

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function animateNumber(el) {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const duration = 1500; // ms
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutExpo(progress);
        const current = Math.round(easedProgress * target);

        el.textContent = prefix + current + (progress >= 1 ? suffix : '');

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = prefix + target + suffix;
          // Small pop effect
          el.style.transform = 'scale(1.05)';
          setTimeout(() => { el.style.transform = 'scale(1)'; }, 200);
        }
      }

      requestAnimationFrame(update);
    }

    if (prefersReducedMotion) {
      // Show final values immediately
      numbers.forEach(el => {
        const target = el.dataset.target || '0';
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        el.textContent = prefix + target + suffix;
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasCounted) {
          hasCounted = true;
          numbers.forEach((el, i) => {
            // Stagger the start of each number
            setTimeout(() => animateNumber(el), i * 150);
          });
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.5
    });

    observer.observe(statsBar);
  }

  // ===== LIVE SCAN TICKER =====
  function initLiveTicker() {
    const tickerEl = document.getElementById('heroTickerNumber');
    if (!tickerEl) return;

    let currentValue = 4127893;

    function formatNumber(num) {
      return num.toLocaleString('de-DE');
    }

    // Set initial display
    tickerEl.textContent = formatNumber(currentValue);

    if (prefersReducedMotion) return;

    function tick() {
      const increment = Math.floor(Math.random() * 5) + 1;
      currentValue += increment;
      tickerEl.textContent = formatNumber(currentValue);

      const nextDelay = 2000 + Math.floor(Math.random() * 2000);
      setTimeout(tick, nextDelay);
    }

    setTimeout(tick, 1500);
  }

  // ===== NAV SCROLL EFFECT =====
  function initNavScroll() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // ===== REF CAROUSEL – Touch/Drag + Arrow Buttons =====
  function initRefCarousels() {
    document.querySelectorAll('.ref-carousel-wrapper').forEach(wrapper => {
      // Wrap in outer container for arrow positioning if not already
      if (!wrapper.parentElement.classList.contains('ref-carousel-outer')) {
        const outer = document.createElement('div');
        outer.className = 'ref-carousel-outer';
        wrapper.parentNode.insertBefore(outer, wrapper);
        outer.appendChild(wrapper);
      }
      const outer = wrapper.parentElement;

      // Create arrow buttons
      const prevBtn = document.createElement('button');
      prevBtn.className = 'ref-carousel-btn ref-carousel-btn--prev';
      prevBtn.innerHTML = '&#8249;';
      prevBtn.setAttribute('aria-label', 'Zurück');

      const nextBtn = document.createElement('button');
      nextBtn.className = 'ref-carousel-btn ref-carousel-btn--next';
      nextBtn.innerHTML = '&#8250;';
      nextBtn.setAttribute('aria-label', 'Weiter');

      outer.appendChild(prevBtn);
      outer.appendChild(nextBtn);

      // Update arrow visibility
      function updateButtons() {
        prevBtn.disabled = wrapper.scrollLeft <= 10;
        nextBtn.disabled = wrapper.scrollLeft >= wrapper.scrollWidth - wrapper.clientWidth - 10;
      }
      updateButtons();
      wrapper.addEventListener('scroll', updateButtons);

      // Arrow click handlers
      const scrollAmount = 380;
      prevBtn.addEventListener('click', () => {
        wrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });
      nextBtn.addEventListener('click', () => {
        wrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });

      // Mouse drag support
      let isDragging = false;
      let startX, scrollStart;

      wrapper.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX;
        scrollStart = wrapper.scrollLeft;
        wrapper.style.scrollBehavior = 'auto';
      });
      wrapper.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        wrapper.scrollLeft = scrollStart - (e.pageX - startX);
      });
      wrapper.addEventListener('mouseup', () => {
        isDragging = false;
        wrapper.style.scrollBehavior = 'smooth';
      });
      wrapper.addEventListener('mouseleave', () => {
        isDragging = false;
        wrapper.style.scrollBehavior = 'smooth';
      });
    });
  }

  // ===== INIT =====
  function init() {
    initScrollReveal();
    initCountUp();
    initLiveTicker();
    initNavScroll();
    initRefCarousels();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
