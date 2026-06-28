export function initBackgroundVideo(videoPath, fallbackImagePath) {
  const container = document.querySelector('.hero-video-container');
  if (!container) return;

  // Set fallback image by default
  container.style.backgroundImage = `url(${fallbackImagePath})`;

  // Check connection speed & device type
  const isMobile = window.innerWidth <= 768;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSlowConnection = connection && (connection.saveData || ['slow-2g', '2g', '3g'].includes(connection.effectiveType));

  // If mobile or slow connection, do not load background video to preserve performance
  if (isMobile || isSlowConnection) {
    console.log('Mobile or slow connection detected. Keeping static fallback image.');
    return;
  }

  // Create native video element dynamically
  const video = document.createElement('video');
  video.className = 'hero-video';
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('preload', 'auto');

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
