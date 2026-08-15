const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-button');

function updateHeader() { header.classList.toggle('scrolled', window.scrollY > 40); }
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
    if (entry.isIntersecting) {
      prepareVideo(video);
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }), { rootMargin: '320px 0px', threshold: .01 });

  motionVideos.forEach(video => videoObserver.observe(video));
  document.addEventListener('visibilitychange', () => {
    motionVideos.forEach(video => document.hidden ? video.pause() : video.play().catch(() => {}));
  });
}

document.querySelectorAll('.destination-card').forEach(card => {
  const atmosphere = document.createElement('div');
  atmosphere.className = 'scene-atmosphere';
  for (let i = 0; i < 12; i += 1) {
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
});

document.querySelectorAll('.experience').forEach(card => card.addEventListener('pointermove', event => {
  if (window.innerWidth < 851) return;
  const rect = card.getBoundingClientRect();
  card.style.setProperty('--ex', `${((event.clientX - rect.left) / rect.width - .5) * -12}px`);
  card.style.setProperty('--ey', `${((event.clientY - rect.top) / rect.height - .5) * -10}px`);
}, { passive: true }));

const track = document.querySelector('#destination-track');
const cardWidth = () => track.querySelector('.destination-card').getBoundingClientRect().width + 20;
document.querySelector('#next').addEventListener('click', () => track.scrollBy({ left: cardWidth(), behavior: 'smooth' }));
document.querySelector('#prev').addEventListener('click', () => track.scrollBy({ left: -cardWidth(), behavior: 'smooth' }));

const form = document.querySelector('#travel-form');
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
