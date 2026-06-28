import { initBackgroundVideo } from './video.js';
import { initGallery } from './gallery.js';

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. MOBILE BURGER NAVIGATION TOGGLE ---
  const burgerBtn = document.querySelector('.burger-menu-btn');
  const nav = document.querySelector('.nav');

  if (burgerBtn && nav) {
    burgerBtn.addEventListener('click', () => {
      const isOpen = burgerBtn.classList.toggle('open');
      nav.classList.toggle('open', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
    });
  }

  // --- 2. REVEAL ON SCROLL (INTERSECTION OBSERVER) ---
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
      revealObserver.observe(el);
    });
  } else {
    // Fallback if IntersectionObserver is not supported
    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
      el.classList.add('visible');
    });
  }

  // --- 3. BACKGROUND HERO VIDEO LOOPS ---
  const videoContainer = document.querySelector('.hero-video-container');
  if (videoContainer) {
    const videoUrl = videoContainer.getAttribute('data-video-src');
    const fallbackUrl = videoContainer.getAttribute('data-fallback-src');
    initBackgroundVideo(videoUrl, fallbackUrl);
  }

  // --- 4. EXPOSITIONS GALERIE INITIALISIEREN ---
  const hasGalleryCards = document.querySelector('.gallery-item-card');
  if (hasGalleryCards) {
    initGallery();
  }

  // --- 5. PARALLAX EFFECT FOR ART BACKGROUNDS ---
  const art1 = document.querySelector('.bg-art-1');
  const art2 = document.querySelector('.bg-art-2');
  const art3 = document.querySelector('.bg-art-3');
  
  if (art1 || art2 || art3) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          if (art1) art1.style.transform = `translateY(${scrollY * 0.15}px) rotate(${scrollY * 0.01}deg)`;
          if (art2) art2.style.transform = `translateY(${scrollY * -0.1}px) rotate(${scrollY * -0.005}deg)`;
          if (art3) art3.style.transform = `translateY(${scrollY * 0.05}px)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
  // --- 6. READ MORE / COLLAPSE STATEMENTS TOGGLE ---
  const readMoreButtons = document.querySelectorAll('.btn-read-more');
  readMoreButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.statement-item');
      if (card) {
        const isExpanded = card.classList.toggle('expanded');
        btn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      }
    });
  });

  // Make statement images/wrappers interactive: clicking them expands/collapses the text
  const statementImages = document.querySelectorAll('.statement-image-wrapper, .statement-card-img');
  statementImages.forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
      const card = img.closest('.statement-item');
      if (card) {
        const btn = card.querySelector('.btn-read-more');
        if (btn) {
          btn.click();
        }
      }
    });
  });

  // --- 7. VITA TIMELINE SLIDER CONTROLS ---
  const sliderContainer = document.querySelector('.vita-highlights-container');
  if (sliderContainer) {
    const viewport = sliderContainer.querySelector('.vita-highlights-viewport');
    const btnLeft = sliderContainer.querySelector('.arrow-left');
    const btnRight = sliderContainer.querySelector('.arrow-right');

    if (viewport && btnLeft && btnRight) {
      const scrollStep = 360;

      btnLeft.addEventListener('click', () => {
        viewport.scrollBy({ left: -scrollStep, behavior: 'smooth' });
      });

      btnRight.addEventListener('click', () => {
        viewport.scrollBy({ left: scrollStep, behavior: 'smooth' });
      });

      const updateArrowVisibility = () => {
        const scrollLeft = viewport.scrollLeft;
        const maxScroll = viewport.scrollWidth - viewport.clientWidth;
        
        if (scrollLeft <= 5) {
          btnLeft.style.opacity = '0';
          btnLeft.style.pointerEvents = 'none';
        } else {
          btnLeft.style.opacity = '0.85';
          btnLeft.style.pointerEvents = 'auto';
        }

        if (scrollLeft >= maxScroll - 5) {
          btnRight.style.opacity = '0';
          btnRight.style.pointerEvents = 'none';
        } else {
          btnRight.style.opacity = '0.85';
          btnRight.style.pointerEvents = 'auto';
        }
      };

      viewport.addEventListener('scroll', updateArrowVisibility);
      setTimeout(updateArrowVisibility, 300);
      window.addEventListener('resize', updateArrowVisibility);
    }
  }

  // --- 8. NFT ADDRESS HIGHLIGHTING ---
  const verificationBody = document.querySelector('.verification-body');
  if (verificationBody) {
    const ethAddressRegex = /0x[a-fA-F0-9]{40}/g;
    verificationBody.innerHTML = verificationBody.innerHTML.replace(
      ethAddressRegex,
      (match) => `<code class="eth-address">${match}</code>`
    );
  }

  // --- 9. SCROLL TO TOP BUTTON ---
  const scrollTopBtn = document.getElementById('scroll-to-top');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});
