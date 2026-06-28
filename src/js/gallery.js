export function initGallery() {
  const filterTabs = document.querySelectorAll('.filter-tabs-container button');
  const cards = document.querySelectorAll('.gallery-item-card');

  // --- 1. FILTER TABS LOGIK ---
  filterTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      // Set active tab class
      filterTabs.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'All' || category === filterValue) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // Apply initial filter based on active tab on page load
  const initialActiveTab = document.querySelector('.filter-tabs-container button.active');
  if (initialActiveTab) {
    const filterValue = initialActiveTab.getAttribute('data-filter');
    cards.forEach(card => {
      const category = card.getAttribute('data-category');
      if (category === filterValue) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  // --- 2. DESKTOP RGB SHIFT OVERLAYS ---
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 768) return;
      const rect = card.getBoundingClientRect();
      // Mouse coordinate from center of card
      const x = e.clientX - rect.left - (rect.width / 2);
      const y = e.clientY - rect.top - (rect.height / 2);

      // Map to offset between -12px and 12px
      const shiftX = (x / (rect.width / 2)) * 12;
      const shiftY = (y / (rect.height / 2)) * 12;

      // Assign custom variables to channels
      card.style.setProperty('--sx-red', `${shiftX * 0.8}px`);
      card.style.setProperty('--sy-red', `${shiftY * 0.8}px`);
      
      card.style.setProperty('--sx-green', `${-shiftX * 0.6}px`);
      card.style.setProperty('--sy-green', `${-shiftY * 0.6}px`);
      
      card.style.setProperty('--sx-blue', `${shiftX * 0.4}px`);
      card.style.setProperty('--sy-blue', `${-shiftY * 0.4}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.removeProperty('--sx-red');
      card.style.removeProperty('--sy-red');
      card.style.removeProperty('--sx-green');
      card.style.removeProperty('--sy-green');
      card.style.removeProperty('--sx-blue');
      card.style.removeProperty('--sy-blue');
    });
  });

  // --- 3. MOBILE 3D PERSPECTIVE FRAME SCROLL TILT ---
  function handleScrollTilt() {
    if (window.innerWidth > 768) return;
    const viewportCenter = window.innerHeight / 2;
    cards.forEach(card => {
      if (card.style.display === 'none') return;
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.top + rect.height / 2;
      const distanceFromCenter = cardCenter - viewportCenter;

      // Map tilt up to 10 degrees based on screen scroll position
      const tiltX = (distanceFromCenter / viewportCenter) * 10;
      // Clamp tilt to keep it subtle
      const clampedTilt = Math.min(Math.max(tiltX, -10), 10);
      card.style.setProperty('--card-tilt-x', `${-clampedTilt}deg`);
    });
  }
  
  if (window.innerWidth <= 768) {
    window.addEventListener('scroll', () => requestAnimationFrame(handleScrollTilt), { passive: true });
    // Initial call
    setTimeout(handleScrollTilt, 200);
  }

  // --- 4. LIGHTBOX & INTERACTIVE WIDGETS ---
  const lightbox = document.querySelector('.lightbox-modal');
  if (!lightbox) return;

  const lightboxImg = lightbox.querySelector('.lightbox-active-img');
  const lightboxTitle = lightbox.querySelector('.lightbox-title');
  const lightboxYear = lightbox.querySelector('.val-year');
  const lightboxMedium = lightbox.querySelector('.val-medium');
  const lightboxDim = lightbox.querySelector('.val-dimensions');
  const closeBtn = lightbox.querySelector('.lightbox-close-btn');
  const scaleToggle = lightbox.querySelector('.scale-toggle-btn');
  const scaleContainer = lightbox.querySelector('.scale-visualizer-container');
  const vectorCanvas = lightbox.querySelector('.vector-artwork-canvas');
  const vectorLabel = lightbox.querySelector('.vector-artwork-label');
  const lens = lightbox.querySelector('.lightbox-lens-loupe');

  let activeCard = null;

  cards.forEach(card => {
    card.addEventListener('click', () => {
      activeCard = card;
      const fullImgUrl = card.getAttribute('data-full');
      const title = card.querySelector('.label-title').textContent;
      const year = card.getAttribute('data-year');
      const medium = card.getAttribute('data-technique');
      const dim = card.getAttribute('data-dimensions');

      // Populate lightbox data
      lightboxImg.src = fullImgUrl;
      lightboxTitle.textContent = title;
      lightboxYear.textContent = year;
      lightboxMedium.textContent = medium;
      lightboxDim.textContent = dim || 'K.A.';

      // Reset Scale Widget State
      scaleContainer.style.display = 'none';
      scaleToggle.classList.remove('active');

      // Setup Scale Visualizer values
      // Dimensions format example: "140x140cm" or "200x230cm"
      let widthCm = 100;
      let heightCm = 100;
      const dimMatch = dim.match(/(\d+)\s*[xX]\s*(\d+)/);
      if (dimMatch) {
        widthCm = parseInt(dimMatch[1]);
        heightCm = parseInt(dimMatch[2]);
      }

      // Base visual scale: 1cm = 0.6px in the visualizer stage
      const scaleFactor = 0.6;
      vectorCanvas.style.width = `${widthCm * scaleFactor}px`;
      vectorCanvas.style.height = `${heightCm * scaleFactor}px`;
      vectorCanvas.style.backgroundImage = `url('${fullImgUrl}')`;
      vectorCanvas.style.backgroundSize = 'cover';
      vectorCanvas.style.backgroundPosition = 'center';
      vectorLabel.textContent = `${widthCm}x${heightCm} cm`;

      // Open lightbox
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');

      // Init Touch Magnification & Gyro scope
      initMobileLoupe(lightboxImg, lens);
      requestGyroPermission();
    });
  });

  // Close Lightbox
  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    lightboxImg.src = '';
    // Stop listening to gyroscope
    if (gyroActive) {
      window.removeEventListener('deviceorientation', handleGyroscope);
      gyroActive = false;
      lightboxImg.style.transform = 'none';
    }
  };

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox-content-wrapper') || e.target === lightbox.querySelector('.lightbox-image-panel')) {
      closeLightbox();
    }
  });

  // Toggle Scale Widget
  scaleToggle.addEventListener('click', () => {
    const active = scaleToggle.classList.toggle('active');
    scaleContainer.style.display = active ? 'block' : 'none';
  });

  // Expand mobile bottom sheet on touch drag
  const sidebar = lightbox.querySelector('.lightbox-details-sidebar');
  if (sidebar && window.innerWidth <= 768) {
    let startY = 0;
    sidebar.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
    }, { passive: true });

    sidebar.addEventListener('touchmove', (e) => {
      const currentY = e.touches[0].clientY;
      const diffY = startY - currentY;
      if (diffY > 50) {
        sidebar.classList.add('expanded');
      } else if (diffY < -50) {
        sidebar.classList.remove('expanded');
      }
    }, { passive: true });
  }

  // --- 5. TOUCH ZOOM LENS LOUP (MOBILE HAPTIC DETECT) ---
  function initMobileLoupe(targetImg, loupe) {
    if (window.innerWidth > 768) return; // Desktop uses large layouts, not loupe
    
    let isPressed = false;

    targetImg.addEventListener('touchstart', (e) => {
      isPressed = true;
      loupe.style.display = 'block';
      loupe.style.backgroundImage = `url('${targetImg.src}')`;
      loupe.style.backgroundSize = `${targetImg.width * 2.5}px ${targetImg.height * 2.5}px`;
      updateLoupePos(e.touches[0]);
    }, { passive: true });

    targetImg.addEventListener('touchmove', (e) => {
      if (!isPressed) return;
      updateLoupePos(e.touches[0]);
    }, { passive: true });

    targetImg.addEventListener('touchend', () => {
      isPressed = false;
      loupe.style.display = 'none';
    }, { passive: true });

    function updateLoupePos(touch) {
      const rect = targetImg.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      // Keep loupe center aligned with touch position
      loupe.style.left = `${touch.clientX - 75}px`;
      loupe.style.top = `${touch.clientY - 75}px`;

      // Calculate relative background offset (x2.5 magnification)
      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;

      loupe.style.backgroundPosition = `${percentX}% ${percentY}%`;
    }
  }

  // --- 6. GYROSCOPE 3D PARALLAX EFFECT ---
  let gyroActive = false;

  function requestGyroPermission() {
    if (window.innerWidth > 768) return;
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS 13+ requires permissions
      DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              startGyroscope();
            }
          })
          .catch(console.error);
    } else {
      // Standard Android
      startGyroscope();
    }
  }

  function startGyroscope() {
    if (gyroActive) return;
    window.addEventListener('deviceorientation', handleGyroscope, { passive: true });
    gyroActive = true;
  }

  function handleGyroscope(e) {
    if (!lightbox.classList.contains('open')) return;
    
    // Gamma: left/right tilt (-90 to 90)
    // Beta: front/back tilt (-180 to 180)
    const tiltX = e.gamma || 0;
    const tiltY = e.beta || 0;

    // Smooth limits
    const maxOffset = 15; // Max translation in pixels
    const moveX = (tiltX / 45) * maxOffset;
    const moveY = ((tiltY - 45) / 45) * maxOffset; // Adjusted for natural reading hold angle (~45 deg tilt)

    const clampedX = Math.min(Math.max(moveX, -maxOffset), maxOffset);
    const clampedY = Math.min(Math.max(moveY, -maxOffset), maxOffset);

    // Apply translation to active lightbox image
    lightboxImg.style.transform = `translate3d(${clampedX}px, ${clampedY}px, 0px) scale(1.03)`;
    lightboxImg.style.transition = 'transform 0.1s ease-out';
  }
}
