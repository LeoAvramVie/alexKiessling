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
  const gallerySection = document.querySelector('.gallery-page-section');
  if (gallerySection) {
    initGallery();
  }
});
