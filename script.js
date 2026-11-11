'use strict';

const mobile = window.matchMedia('(max-width: 720px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const menu = document.querySelector('.menu-button');
const navigation = document.querySelector('.navigation');

function setMenu(open) {
  menu.setAttribute('aria-expanded', String(open));
  navigation.hidden = mobile.matches && !open;
}

menu.hidden = false;
setMenu(false);
mobile.addEventListener('change', () => setMenu(false));
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
navigation.addEventListener('click', (event) => {
  if (mobile.matches && event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menu.focus();
  }
});

const video = document.querySelector('.hero-film video');
const videoButton = document.querySelector('.video-button');
const videoIcon = videoButton.querySelector('use');
const filmFallback = document.querySelector('.film-fallback');

function updateVideoButton() {
  const paused = video.paused;
  videoButton.setAttribute('aria-label', paused ? 'Reproduzir vídeo' : 'Pausar vídeo');
  videoIcon.setAttribute('href', paused ? '#i-play' : '#i-pause');
}

function showVideoFallback() {
  videoButton.hidden = true;
  filmFallback.hidden = false;
}

video.muted = true;
if (reducedMotion.matches) {
  video.autoplay = false;
  video.pause();
}
reducedMotion.addEventListener('change', (event) => {
  if (event.matches) video.pause();
});
video.addEventListener('play', updateVideoButton);
video.addEventListener('pause', updateVideoButton);
video.addEventListener('error', showVideoFallback);
video.querySelector('source').addEventListener('error', showVideoFallback);
videoButton.addEventListener('click', () => {
  if (video.paused) {
    video.play().catch(() => {
      if (video.error) showVideoFallback();
    });
  } else {
    video.pause();
  }
});
updateVideoButton();
videoButton.hidden = false;
if (video.error || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) showVideoFallback();

const views = document.querySelector('.comparison-views');
const viewButtons = [...views.querySelectorAll('button')];

viewButtons.forEach((button) => {
  button.addEventListener('click', () => {
    viewButtons.forEach((view) => {
      const selected = view === button;
      view.setAttribute('aria-pressed', String(selected));
      document.getElementById(view.getAttribute('aria-controls')).hidden = !selected;
    });
  });
});

document.querySelectorAll('.comparison-stage').forEach((stage) => {
  const range = stage.querySelector('.compare-input');
  const beforeLabel = stage.querySelector('.label-before');
  const afterLabel = stage.querySelector('.label-after');

  function updateComparison() {
    const before = range.valueAsNumber;
    stage.style.setProperty('--split', before + '%');
    range.setAttribute('aria-valuetext', before + '% antes, ' + (100 - before) + '% depois');
    beforeLabel.hidden = before < 19;
    afterLabel.hidden = before > 81;
  }

  function moveDivider(event) {
    const bounds = stage.getBoundingClientRect();
    range.valueAsNumber = Math.round(100 * (event.clientX - bounds.left) / bounds.width);
    updateComparison();
  }

  let activePointer = null;
  let touchOrigin = null;
  range.disabled = false;
  stage.classList.add('is-interactive');
  range.addEventListener('input', updateComparison);
  stage.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || activePointer !== null) return;
    activePointer = event.pointerId;
    stage.setPointerCapture(activePointer);
    if (event.pointerType === 'touch') {
      touchOrigin = event.clientX;
    } else {
      event.preventDefault();
      range.focus({ preventScroll: true });
      moveDivider(event);
    }
  });
  stage.addEventListener('pointermove', (event) => {
    if (event.pointerId !== activePointer) return;
    if (touchOrigin !== null && Math.abs(event.clientX - touchOrigin) < 6) return;
    touchOrigin = null;
    moveDivider(event);
  });
  stage.addEventListener('pointerup', (event) => {
    if (event.pointerId === activePointer) moveDivider(event);
  });
  stage.addEventListener('lostpointercapture', () => {
    activePointer = null;
    touchOrigin = null;
  });
  updateComparison();
});
views.hidden = false;

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const reveal = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .08 });
  document.querySelectorAll('[data-reveal]').forEach((element) => {
    element.classList.add('will-reveal');
    reveal.observe(element);
  });
}
