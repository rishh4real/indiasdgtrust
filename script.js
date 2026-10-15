const menuToggle = document.querySelector("[data-menu-toggle]");
const navOverlay = document.querySelector("[data-immersive-nav]");
const nav = document.querySelector("[data-nav]");
const hero = document.querySelector(".hero");

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getMenuFocusableElements() {
  if (!menuToggle || !navOverlay) return [];
  return [menuToggle, ...navOverlay.querySelectorAll(focusableSelector)].filter(
    (element) => element instanceof HTMLElement && !element.hidden
  );
}

function setNavOpen(isOpen) {
  document.body.classList.toggle("nav-open", isOpen);
  menuToggle?.setAttribute("aria-expanded", String(isOpen));
  menuToggle?.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  navOverlay?.setAttribute("aria-hidden", String(!isOpen));

  navOverlay?.querySelectorAll("a").forEach((link) => {
    link.tabIndex = isOpen ? 0 : -1;
  });

  if (isOpen) {
    window.requestAnimationFrame(() => {
      navOverlay?.querySelector("a")?.focus();
    });
  } else {
    menuToggle?.focus();
  }
}

menuToggle?.addEventListener("click", () => {
  setNavOpen(!document.body.classList.contains("nav-open"));
});

nav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) setNavOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (!document.body.classList.contains("nav-open")) return;

  if (event.key === "Escape") {
    event.preventDefault();
    setNavOpen(false);
    return;
  }

  if (event.key !== "Tab") return;

  const focusable = getMenuFocusableElements();
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

navOverlay?.querySelectorAll("a").forEach((link) => {
  link.tabIndex = -1;
});

function initLivingHero() {
  if (!hero) return;

  const imageWidth = 2706;
  const imageHeight = 1518;
  const zoom = 1.04;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const turbines = [
    { x: 88.88, y: 31.85, length: 7.6, hub: 10.2, duration: 9, delay: 0 },
    { x: 67.04, y: 42.44, length: 6.4, hub: 9.5, duration: 11, delay: -3 },
    { x: 81.24, y: 43.52, length: 4.2, hub: 10.2, duration: 8, delay: -5 },
    { x: 60.27, y: 55.05, length: 2.2, hub: 13, duration: 7, delay: -2 },
  ];
  const birds = [
    { x: 41, y: 17, width: 1.45, travel: 18, duration: 31, delay: -12, tilt: -4 },
    { x: 44, y: 24, width: 1, travel: 22, duration: 36, delay: -28, tilt: 3 },
    { x: 47, y: 12.5, width: 0.82, travel: 25, duration: 39, delay: -7, tilt: -2 },
    { x: 50, y: 29, width: 1.18, travel: 17, duration: 33, delay: -23, tilt: 4 },
    { x: 54, y: 21, width: 0.76, travel: 21, duration: 37, delay: -17, tilt: -3 },
    { x: 66, y: 28, width: 1.16, travel: 15, duration: 32, delay: -26, tilt: 2 },
    { x: 69, y: 18, width: 0.9, travel: 16, duration: 35, delay: -9, tilt: -4 },
    { x: 72, y: 25, width: 0.72, travel: 14, duration: 30, delay: -21, tilt: 3 },
    { x: 76, y: 15, width: 1.02, travel: 12, duration: 34, delay: -15, tilt: -2 },
  ];

  const stage = document.createElement("div");
  stage.className = "live-windmill-stage";
  stage.setAttribute("aria-hidden", "true");
  hero.appendChild(stage);

  const sunshine = document.createElement("div");
  sunshine.className = "live-sunshine";
  stage.appendChild(sunshine);

  turbines.forEach((turbine, index) => {
    const gradientId = `turbine-blade-${index}`;
    const bladePaths = [0, 120, 240]
      .map(
        (angle) =>
          `<path transform="rotate(${angle})" d="M-5 -4 C-8 -30 -7 -67 -2 -97 C-1 -101 2 -101 4 -96 C7 -65 8 -29 5 -4 Z" fill="url(#${gradientId})" stroke="#526b79" stroke-opacity="0.78" stroke-width="1" stroke-linejoin="round"/>`
      )
      .join("");
    const rotor = document.createElement("div");
    rotor.className = "live-turbine";
    rotor.style.left = `${turbine.x}%`;
    rotor.style.top = `${turbine.y}%`;
    rotor.style.width = `${turbine.length * 2}%`;
    rotor.innerHTML = `<svg viewBox="-100 -100 200 200" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fdfaf5"/><stop offset="0.48" stop-color="#d8d1ca"/><stop offset="1" stop-color="#949fa9"/></linearGradient><radialGradient id="${gradientId}-hub" cx="34%" cy="28%" r="72%"><stop offset="0" stop-color="#668292"/><stop offset="0.35" stop-color="#24485b"/><stop offset="1" stop-color="#071d2c"/></radialGradient></defs>${bladePaths}<circle r="${turbine.hub}" fill="url(#${gradientId}-hub)" stroke="#82939b" stroke-width="1.2"/><circle cx="-${turbine.hub * 0.24}" cy="-${turbine.hub * 0.28}" r="${turbine.hub * 0.18}" fill="#ffffff" fill-opacity="0.28"/></svg>`;
    const svg = rotor.firstElementChild;
    svg.style.animationDuration = `${turbine.duration}s`;
    svg.style.animationDelay = `${turbine.delay}s`;
    stage.appendChild(rotor);
  });

  birds.forEach((bird, index) => {
    const wrapper = document.createElement("div");
    const wingDepth = index % 3 === 0 ? 7 : index % 3 === 1 ? 8.5 : 6.5;
    wrapper.className = `live-bird${index >= 5 ? " live-bird-secondary" : ""}`;
    wrapper.style.left = `${bird.x}%`;
    wrapper.style.top = `${bird.y}%`;
    wrapper.style.width = `${bird.width}%`;
    wrapper.style.setProperty("--bird-tilt", `${bird.tilt}deg`);
    wrapper.style.setProperty("--bird-travel", `${bird.travel}vw`);
    wrapper.style.setProperty("--bird-half-travel", `${bird.travel / 2}vw`);
    wrapper.style.animationDuration = `${bird.duration}s`;
    wrapper.style.animationDelay = `${bird.delay}s`;
    wrapper.innerHTML = `<svg viewBox="0 0 44 18" xmlns="http://www.w3.org/2000/svg"><path d="M2 14 C8 ${wingDepth}, 15 ${wingDepth - 2}, 22 13 C29 ${wingDepth - 2}, 36 ${wingDepth}, 42 14" fill="none" stroke="#173b50" stroke-width="2.1" stroke-linecap="round"/></svg>`;
    stage.appendChild(wrapper);
  });

  function fitStage() {
    const width = hero.clientWidth;
    const height = hero.clientHeight;
    const scale = Math.max(width / imageWidth, height / imageHeight) * zoom;
    const fittedWidth = imageWidth * scale;
    const fittedHeight = imageHeight * scale;
    const left = (width - fittedWidth) / 2;
    const top = (height - fittedHeight) / 2;

    hero.style.backgroundSize = `${fittedWidth}px ${fittedHeight}px`;
    hero.style.backgroundPosition = "50% 50%";
    Object.assign(stage.style, {
      width: `${fittedWidth}px`,
      height: `${fittedHeight}px`,
      left: `${left}px`,
      top: `${top}px`,
    });
  }

  fitStage();
  if ("ResizeObserver" in window) {
    new ResizeObserver(fitStage).observe(hero);
  } else {
    window.addEventListener("resize", fitStage, { passive: true });
  }

  if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let frameId = 0;

  function updateParallax() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    const transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    hero.style.backgroundPosition = `calc(50% + ${currentX}px) calc(50% + ${currentY}px)`;
    stage.style.transform = transform;

    if (Math.abs(targetX - currentX) > 0.02 || Math.abs(targetY - currentY) > 0.02) {
      frameId = window.requestAnimationFrame(updateParallax);
    } else {
      frameId = 0;
    }
  }

  function queueParallax() {
    if (!frameId) frameId = window.requestAnimationFrame(updateParallax);
  }

  hero.addEventListener(
    "pointermove",
    (event) => {
      const bounds = hero.getBoundingClientRect();
      targetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * -10;
      targetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * -6;
      queueParallax();
    },
    { passive: true }
  );

  hero.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
    queueParallax();
  });
}

initLivingHero();

if (hero && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      hero.classList.toggle("hero-paused", !entry.isIntersecting);
    },
    { threshold: 0.08 }
  );

  observer.observe(hero);
}
