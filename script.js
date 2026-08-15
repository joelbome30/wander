const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-button');
const progressBar = document.querySelector('.scroll-progress i');

function updateHeader() {
  header.classList.toggle('scrolled', window.scrollY > 40);
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
  progressBar.style.transform = `scaleX(${progress})`;
}
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuButton.addEventListener('click', () => {
  const open = header.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', open);
});
document.querySelectorAll('.site-header nav a').forEach(link => link.addEventListener('click', () => header.classList.remove('open')));

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(item => observer.observe(item));

const journeyLinks = [...document.querySelectorAll('.journey-rail a')];
const journeyObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  journeyLinks.forEach(link => link.classList.toggle('is-active', link.dataset.section === entry.target.id));
}), { rootMargin: '-32% 0px -58%', threshold: 0 });
document.querySelectorAll('main > section[id]').forEach(section => journeyObserver.observe(section));
journeyLinks[0]?.classList.add('is-active');

const hero = document.querySelector('.hero');
let heroFrame;
hero.addEventListener('pointermove', event => {
  if (window.innerWidth < 851) return;
  cancelAnimationFrame(heroFrame);
  heroFrame = requestAnimationFrame(() => {
    const x = (event.clientX / window.innerWidth - .5) * -18;
    const y = (event.clientY / window.innerHeight - .5) * -12;
    hero.style.setProperty('--hero-x', `${x}px`);
    hero.style.setProperty('--hero-y', `${y}px`);
  });
}, { passive: true });

// Los videos se cargan únicamente cuando están cerca de la pantalla. Así los
// paisajes se sienten vivos sin descargar todos los clips al abrir la página.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const motionVideos = [...document.querySelectorAll('.motion-video')];

function prepareVideo(video) {
  if (video.dataset.loaded) return;
  video.querySelectorAll('source[data-src]').forEach(source => {
    source.src = source.dataset.src;
    source.removeAttribute('data-src');
  });
  video.dataset.loaded = 'true';
  video.load();
}

function showVideo(video) {
  video.classList.add('motion-ready');
}

motionVideos.forEach(video => {
  video.addEventListener('loadeddata', () => showVideo(video), { once: true });
  if (video.readyState >= 2) showVideo(video);
});

if (!reduceMotion) {
  const videoObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    const video = entry.target;
    video.dataset.inView = entry.isIntersecting ? 'true' : 'false';
    if (entry.isIntersecting) {
      prepareVideo(video);
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }), { rootMargin: '320px 0px', threshold: .01 });

  motionVideos.forEach(video => videoObserver.observe(video));
  document.addEventListener('visibilitychange', () => {
    motionVideos.forEach(video => {
      if (document.hidden || video.dataset.inView !== 'true') video.pause();
      else if (video.dataset.loaded) video.play().catch(() => {});
    });
  });
}

const destinationSelect = document.querySelector('select[name="destination"]');
const form = document.querySelector('#travel-form');

function selectDestination(card) {
  const destination = card.dataset.destination;
  if (!destination || !destinationSelect) return;
  destinationSelect.value = destination;
  destinationSelect.dispatchEvent(new Event('change', { bubbles: true }));
  const label = destinationSelect.closest('label');
  label.classList.remove('destination-picked');
  requestAnimationFrame(() => label.classList.add('destination-picked'));
  form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}

document.querySelectorAll('.destination-card').forEach(card => {
  const atmosphere = document.createElement('div');
  atmosphere.className = 'scene-atmosphere';
  const particleCount = window.innerWidth < 851 ? 5 : 8;
  for (let i = 0; i < particleCount; i += 1) {
    const particle = document.createElement('i');
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.setProperty('--delay', `${Math.random() * -5}s`);
    particle.style.setProperty('--speed', `${2.4 + Math.random() * 3.8}s`);
    atmosphere.appendChild(particle);
  }
  card.appendChild(atmosphere);

  card.addEventListener('pointermove', event => {
    if (window.innerWidth < 851) return;
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    card.style.setProperty('--ry', `${(px - .5) * 7}deg`);
    card.style.setProperty('--rx', `${(.5 - py) * 7}deg`);
    card.style.setProperty('--mx', `${(px - .5) * -10}px`);
    card.style.setProperty('--my', `${(py - .5) * -10}px`);
    card.style.setProperty('--glow-x', `${px * 100}%`);
    card.style.setProperty('--glow-y', `${py * 100}%`);
  }, { passive: true });
  card.addEventListener('pointerleave', () => {
    ['--rx','--ry'].forEach(prop => card.style.setProperty(prop, '0deg'));
    ['--mx','--my'].forEach(prop => card.style.setProperty(prop, '0px'));
  });
  card.addEventListener('click', event => {
    event.preventDefault();
    selectDestination(card);
  });
  card.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    selectDestination(card);
  });
});

const toast = document.querySelector('.toast');
let toastTimer;
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 4500);
  form.reset();
});

const travelCursor = document.querySelector('.travel-cursor');
const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
if (precisePointer.matches && !reduceMotion) {
  document.body.classList.add('cursor-ready');
  document.addEventListener('pointermove', event => {
    travelCursor.style.transform = `translate3d(${event.clientX - 17}px,${event.clientY - 17}px,0)`;
    travelCursor.classList.add('is-visible');
    const interactive = event.target.closest('a, button, input, select, textarea, .destination-card, .review-card');
    travelCursor.classList.toggle('is-active', Boolean(interactive));
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => travelCursor.classList.remove('is-visible'));
}

const secretSequence = ['ArrowLeft', 'ArrowRight', 'Shift', 'Enter'];
const shipStatus = document.querySelector('.kickass-status');
const shipStatusTitle = shipStatus.querySelector('span');
const shipStatusProgress = shipStatus.querySelector('strong');
const shipStatusCopy = shipStatus.querySelector('small');
let secretIndex = 0;
let secretTimer;
let statusTimer;

function renderSecretProgress() {
  shipStatusTitle.textContent = 'NAVE SECRETA';
  shipStatusCopy.textContent = 'SECUENCIA DETECTADA';
  shipStatus.classList.remove('is-launched');
  shipStatusProgress.textContent = secretSequence.map((_, index) => index < secretIndex ? '●' : '◌').join(' ');
  shipStatus.classList.add('is-visible');
}

function resetSecretSequence(hide = true) {
  secretIndex = 0;
  clearTimeout(secretTimer);
  shipStatusProgress.textContent = '◌ ◌ ◌ ◌';
  if (hide) shipStatus.classList.remove('is-visible');
}

function showShipMessage(title, copy, launched = false) {
  clearTimeout(statusTimer);
  shipStatusTitle.textContent = title;
  shipStatusCopy.textContent = copy;
  shipStatus.classList.toggle('is-launched', launched);
  shipStatus.classList.add('is-visible');
  statusTimer = setTimeout(() => shipStatus.classList.remove('is-visible'), 5200);
}

function launchDestroyerShip() {
  if (window.KICKASSGAME) {
    showShipMessage('NAVE YA DESPLEGADA', 'FLECHAS + ESPACIO · ESC PARA SALIR', true);
    return;
  }
  document.querySelector('#kickass-secret-loader')?.remove();
  showShipMessage('ABRIENDO HANGAR', 'CONECTANDO CON KICK ASS…');
  window.KICKASSVERSION = '2.0';
  const loader = document.createElement('script');
  loader.id = 'kickass-secret-loader';
  loader.src = 'https://hi.kickassapp.com/kickass.js';
  loader.async = true;
  loader.onload = () => {
    document.body.classList.add('kickass-active');
    showShipMessage('NAVE DESTRUCTORA ACTIVADA', 'FLECHAS PARA VOLAR · ESPACIO PARA DISPARAR · ESC PARA SALIR', true);
  };
  loader.onerror = () => showShipMessage('NO SE PUDO ABRIR EL HANGAR', 'REVISA TU CONEXIÓN E INTENTA LA SECUENCIA OTRA VEZ');
  document.body.appendChild(loader);
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && document.body.classList.contains('kickass-active')) {
    setTimeout(() => {
      document.body.classList.remove('kickass-active');
      showShipMessage('NAVE GUARDADA', 'EL SITIO VOLVIÓ A LA NORMALIDAD');
    }, 80);
    return;
  }
  if (event.repeat || (event.target instanceof Element && event.target.matches('input, textarea, select')) || window.KICKASSGAME) return;
  const expectedKey = secretSequence[secretIndex];
  if (event.key === expectedKey) {
    event.preventDefault();
    secretIndex += 1;
    renderSecretProgress();
    clearTimeout(secretTimer);
    secretTimer = setTimeout(() => resetSecretSequence(), 3200);
    if (secretIndex === secretSequence.length) {
      resetSecretSequence(false);
      launchDestroyerShip();
    }
    return;
  }
  if (event.key === secretSequence[0]) {
    event.preventDefault();
    secretIndex = 1;
    renderSecretProgress();
    return;
  }
  resetSecretSequence();
}, true);
