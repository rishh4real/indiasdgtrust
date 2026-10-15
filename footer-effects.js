(() => {
  const band = document.querySelector('[data-dither-field]');
  const field = band?.querySelector('.df-field');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let frame = 0;

  if (band && field && !reduce) {
    band.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      const bounds = band.getBoundingClientRect();
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        field.style.setProperty('--df-x', `${event.clientX - bounds.left}px`);
        field.style.setProperty('--df-y', `${event.clientY - bounds.top}px`);
        field.classList.add('df-lit');
      });
    }, { passive: true });

    band.addEventListener('pointerleave', () => {
      window.cancelAnimationFrame(frame);
      field.classList.remove('df-lit');
    });
  }

  document.querySelector('[data-back-to-top]')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  const form = document.querySelector('[data-footer-subscribe]');
  form?.addEventListener('submit', event => {
    event.preventDefault();
    const button = form.querySelector('button');
    const status = form.querySelector('[role="status"]');
    button.disabled = true;
    button.textContent = 'Subscribing...';

    window.setTimeout(() => {
      form.reset();
      button.disabled = false;
      button.textContent = 'Subscribe';
      status.textContent = "Thanks. You're on the list.";
    }, reduce ? 0 : 600);
  });
})();
