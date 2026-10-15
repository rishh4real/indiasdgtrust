/* Curved field-story reel adapted for this static site. */
(() => {
  const reel = document.querySelector('[data-story-reel]');
  const stage = reel?.querySelector('.story-reel-stage');
  if (!reel || !stage) return;

  const images = [
    { src: 'assets/story-community-dialogue.jpg' },
    { src: 'assets/story-circular-economy.jpg' },
    { src: 'assets/story-education.jpg' },
    { src: 'assets/story-inclusive-futures.jpg' },
  ];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const slices = 14;
  const camera = 1.65;
  const aspect = 16 / 9;
  const gap = 9;
  const curve = 74 * Math.PI / 180;
  const axis = 48;
  const speed = 4.5;
  const keyframes = document.createElement('style');
  document.head.appendChild(keyframes);

  images.forEach(({ src }) => {
    const image = new Image();
    image.src = src;
  });

  const arc = bend => (camera - 1 + Math.cos(bend)) / (2 * camera * Math.sin(bend));
  const turn = (radius, angle) =>
    `translateZ(${radius}px) rotateY(${angle}deg) translateZ(${-radius}px)`;

  function setTileImage(tile, imageIndex) {
    const image = images[((imageIndex % images.length) + images.length) % images.length];
    tile.querySelectorAll('img').forEach(img => { img.src = image.src; });
  }

  function build() {
    const width = reel.clientWidth;
    const height = reel.clientHeight;
    if (!width || !height) return;

    const tileShare = width < 620 ? 68 : 58;
    const maxWidthShare = width < 620 ? 90 : 56;
    const tileHeight = Math.min(height * tileShare / 100, (width * maxWidthShare / 100) / aspect);
    const tileWidth = tileHeight * aspect;
    const radius = width * arc(curve);
    const unit = (tileHeight / radius) * 180 / Math.PI;
    const pitch = (aspect + gap / 100) * unit;
    const limit = curve * 180 / Math.PI + aspect * unit / 2;
    const columns = Math.min(24, Math.max(4, Math.ceil((2 * limit) / pitch)));
    const sweep = columns * pitch / 2;
    const hide = ((sweep - Math.min(sweep, limit)) / (2 * sweep || 1)) * 100;
    const duration = columns * speed;
    const name = `storyOrbit${Math.round(width)}x${Math.round(height)}`;

    keyframes.textContent = `
      @keyframes ${name} {
        0% { transform: ${turn(radius, -sweep)}; visibility: hidden; }
        ${hide.toFixed(4)}% { visibility: hidden; }
        ${(hide + 0.001).toFixed(4)}% { visibility: visible; }
        ${(100 - hide - 0.001).toFixed(4)}% { visibility: visible; }
        ${(100 - hide).toFixed(4)}% { visibility: hidden; }
        100% { transform: ${turn(radius, sweep)}; visibility: hidden; }
      }
      @media (prefers-reduced-motion: reduce) {
        .story-reel-tile { animation-play-state: paused !important; }
      }
    `;

    stage.replaceChildren();
    stage.style.opacity = '1';
    stage.style.perspective = `${radius * camera}px`;
    stage.style.perspectiveOrigin = `50% ${axis}%`;

    const sliceWidth = tileWidth / slices;
    for (let tileIndex = 0; tileIndex < columns; tileIndex += 1) {
      const tile = document.createElement('div');
      const firstImage = columns - 1 - tileIndex;
      let imageIndex = firstImage;
      tile.className = 'story-reel-tile';
      Object.assign(tile.style, {
        left: `${width / 2 - tileWidth / 2}px`,
        top: `${height * axis / 100 - tileHeight / 2}px`,
        width: `${tileWidth}px`,
        height: `${tileHeight}px`,
        animation: `${name} ${duration}s linear ${-tileIndex * speed}s infinite`,
      });

      for (let sliceIndex = 0; sliceIndex < slices; sliceIndex += 1) {
        const slice = document.createElement('div');
        const image = document.createElement('img');
        slice.className = 'story-reel-slice';
        Object.assign(slice.style, {
          left: `${(tileWidth - sliceWidth) / 2}px`,
          width: `${sliceWidth + (sliceIndex === slices - 1 ? 0 : 1)}px`,
          height: `${tileHeight}px`,
          transform: turn(radius, (aspect / 2 - (sliceIndex + 0.5) * (aspect / slices)) * unit),
        });
        image.alt = '';
        image.draggable = false;
        image.decoding = 'async';
        image.src = images[firstImage % images.length].src;
        image.style.left = `${-sliceIndex * sliceWidth}px`;
        image.style.width = `${tileWidth}px`;
        slice.appendChild(image);
        tile.appendChild(slice);
      }

      tile.addEventListener('animationiteration', () => {
        imageIndex += columns;
        setTileImage(tile, imageIndex);
      });
      stage.appendChild(tile);
    }

    if (reduce) {
      stage.querySelectorAll('.story-reel-tile').forEach(tile => {
        tile.style.animationPlayState = 'paused';
      });
    }
  }

  let resizeFrame = 0;
  const resizeObserver = new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(build);
  });
  resizeObserver.observe(reel);

})();
