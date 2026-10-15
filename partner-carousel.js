(() => {
  const carousel = document.querySelector('[data-partner-carousel]');
  if (!carousel) return;

  const viewport = carousel.querySelector('.partner-carousel-viewport');
  const track = carousel.querySelector('.partner-carousel-track');
  const slides = [...track.querySelectorAll('.partner-slide')];
  const originalCount = slides.filter(slide => slide.getAttribute('aria-hidden') !== 'true').length;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let index = 0;
  let step = 0;
  let timer = 0;
  let visible = true;
  let resetFrame = 0;

  const render = animate => {
    carousel.classList.toggle('is-resetting', !animate);
    carousel.style.setProperty('--partner-offset', `${index * step}px`);
  };

  const measure = () => {
    const first = slides[0];
    if (!first) return;
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap) || 0;
    step = first.getBoundingClientRect().width + gap;
    render(false);
  };

  const schedule = () => {
    window.clearInterval(timer);
    if (reduce || !visible || document.hidden) return;
    timer = window.setInterval(() => move(1), 1050);
  };

  const move = direction => {
    if (!step) measure();

    if (direction < 0 && index === 0) {
      index = originalCount;
      render(false);
      window.cancelAnimationFrame(resetFrame);
      resetFrame = window.requestAnimationFrame(() => {
        index = originalCount - 1;
        render(true);
      });
      return;
    }

    index += direction;
    render(true);
  };

  track.addEventListener('transitionend', event => {
    if (event.propertyName !== 'transform' || index < originalCount) return;
    index = 0;
    render(false);
  });

  carousel.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    move(event.key === 'ArrowRight' ? 1 : -1);
    schedule();
  });

  document.addEventListener('visibilitychange', schedule);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? true;
      schedule();
    }, { threshold: 0.08 });
    observer.observe(carousel);
  }

  if ('ResizeObserver' in window) {
    new ResizeObserver(measure).observe(viewport);
  } else {
    window.addEventListener('resize', measure, { passive: true });
  }

  measure();
  schedule();
})();
