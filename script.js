(() => {
  'use strict';

  /* ==========================================================
     1. Filtres de projets (page d'accueil)
     ========================================================== */
  const chips = document.querySelectorAll('.chip');
  const projects = document.querySelectorAll('.proj');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const f = chip.dataset.filter;
      chips.forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
      projects.forEach(p => { p.hidden = !(f === 'all' || p.dataset.cat === f); });
    });
  });

  /* ==========================================================
     2. Bascule FR / EN (mémorisée d'une page à l'autre)
        Chaque élément avec data-en est échangé avec son texte français.
     ========================================================== */
  const langBtn = document.getElementById('lang');
  let lang = 'fr';

  function setLang(next) {
    lang = next;
    document.querySelectorAll('[data-en]').forEach(node => {
      const isImg = node.tagName === 'IMG';
      if (node.dataset.fr === undefined) node.dataset.fr = isImg ? node.alt : node.innerHTML;
      const text = next === 'en' ? node.dataset.en : node.dataset.fr;
      if (isImg) node.alt = text; else node.innerHTML = text;
    });
    document.documentElement.lang = next;
    langBtn.textContent = next === 'fr' ? 'EN' : 'FR';
    langBtn.setAttribute('aria-label', next === 'fr' ? 'Switch to English' : 'Passer en français');
    const filters = document.querySelector('.filters');
    if (filters) filters.setAttribute('aria-label', next === 'fr' ? 'Filtrer les projets' : 'Filter projects');
    const portrait = document.querySelector('.portrait img');
    if (portrait) portrait.alt = next === 'fr' ? 'Portrait de Laora Aimi' : 'Portrait of Laora Aimi';
    try { localStorage.setItem('lang', next); } catch (e) { /* stockage indisponible */ }
  }

  langBtn.addEventListener('click', () => setLang(lang === 'fr' ? 'en' : 'fr'));

  let saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) { /* ignoré */ }
  if (saved === 'en') setLang('en');
})();
