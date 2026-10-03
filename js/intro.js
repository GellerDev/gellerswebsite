// =========================================================
// ENVELOPE INTRO
// Shown once per browser session. Click the wax seal (or press
// Enter / Space / Escape) to open the envelope and reveal the site.
// =========================================================
(function () {
  const root = document.documentElement;
  const intro = document.getElementById('intro');
  if (!intro || root.classList.contains('intro-done')) {
    if (intro) intro.remove();
    return;
  }

  const envelope = document.getElementById('envelope');
  const seal = document.getElementById('seal');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Personal greeting on the envelope (same ?guest= link as the invitation title)
  const guest = new URLSearchParams(window.location.search).get('guest');
  if (guest) {
    document.getElementById('intro-to').textContent = guest.trim().slice(0, 80);
  }

  function onKey(event) {
    if (['Enter', ' ', 'Escape'].includes(event.key)) {
      event.preventDefault();
      openEnvelope();
    }
  }

  let opened = false;
  function openEnvelope() {
    if (opened) return;
    opened = true;

    document.removeEventListener('keydown', onKey);
    envelope.classList.add('is-open');
    intro.classList.add('intro--opening');
    try { sessionStorage.setItem('introSeen', '1'); } catch (e) {}

    // Let the letter slide out, then fade the intro away
    setTimeout(() => {
      intro.classList.add('intro--leaving');
      root.classList.add('intro-done');
      document.dispatchEvent(new Event('intro:done'));
      setTimeout(() => intro.remove(), 1000);
    }, reducedMotion ? 100 : 2300);
  }

  seal.addEventListener('click', openEnvelope);
  envelope.addEventListener('click', openEnvelope);
  document.addEventListener('keydown', onKey);

  seal.focus({ preventScroll: true });
})();
