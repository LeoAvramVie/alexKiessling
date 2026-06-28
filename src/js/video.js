export function initBackgroundVideo(videoPath, fallbackImagePath) {
  const container = document.querySelector('.hero-video-container');
  if (!container) return;

  // Set fallback image by default
  container.style.backgroundImage = `url(${fallbackImagePath})`;

  // Check device type
  const isMobile = window.innerWidth <= 768;

  // If mobile, do not load background video to preserve performance
  if (isMobile) {
    console.log('Mobile device detected. Keeping static fallback image.');
    return;
  }

  // Create native video element dynamically
  const video = document.createElement('video');
  video.className = 'hero-video';
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('preload', 'auto');

  const START_TIME = 15;
  const LOOP_DURATION = 45;
  const END_TIME = START_TIME + LOOP_DURATION;

  // Seek to start time as soon as we can play
  video.addEventListener('loadedmetadata', () => {
    video.currentTime = START_TIME;
  });

  // Track loop boundaries
  video.addEventListener('timeupdate', () => {
    if (video.currentTime >= END_TIME) {
      video.currentTime = START_TIME;
    }
  });

  // Remove fallback background image when the video starts playing
  video.addEventListener('playing', () => {
    container.style.backgroundImage = 'none';
  });

  const source = document.createElement('source');
  source.src = videoPath;
  source.type = videoPath.endsWith('.webm') ? 'video/webm' : 'video/mp4';
  
  video.appendChild(source);
  container.appendChild(video);

  // Add play/pause control button for native videos
  const controlBtn = document.createElement('button');
  controlBtn.className = 'video-control-btn';
  controlBtn.ariaLabel = 'Pause video';
  controlBtn.style.cssText = `
    position: absolute;
    bottom: 2rem;
    right: 2rem;
    background: none;
    border: 1px solid rgba(255,255,255,0.4);
    padding: 0.5rem;
    border-radius: 50%;
    cursor: pointer;
    z-index: 10;
    color: #fff;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
  `;
  controlBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="currentColor" style="width: 20px; height: 20px;">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
    </svg>
  `;
  container.appendChild(controlBtn);

  // Play/Pause toggle functionality
  controlBtn.addEventListener('click', () => {
    if (video.paused) {
      video.play();
      controlBtn.ariaLabel = 'Pause video';
      controlBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor" style="width: 20px; height: 20px;">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      `;
    } else {
      video.pause();
      controlBtn.ariaLabel = 'Play video';
      controlBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor" style="width: 20px; height: 20px;">
          <path d="M8 5v14l11-7z"/>
        </svg>
      `;
    }
  });

  // Handle play errors (e.g., browser autoplay block)
  video.play().catch(err => {
    console.warn('Autoplay blocked by browser. Displaying play button.', err);
    video.pause();
    controlBtn.ariaLabel = 'Play video';
    controlBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor" style="width: 20px; height: 20px;">
        <path d="M8 5v14l11-7z"/>
      </svg>
    `;
  });
}
