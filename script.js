(() => {
  'use strict';

  let lang = 'fr';

  /* ==========================================================
     1. Tracé de télémétrie illustratif (données simulées)
     ========================================================== */
  const N = 700;          // nombre d'échantillons
  const LAP = 4200;       // longueur du tour en mètres (fictive)
  const V_MIN = 60, V_MAX = 340;

  // Virages : position (0..1), perte de vitesse (km/h), largeur de freinage et d'accélération
  const corners = [
    { c: 0.07, d: 140, wb: 0.014, wa: 0.035 },
    { c: 0.17, d: 215, wb: 0.016, wa: 0.040 },
    { c: 0.29, d:  95, wb: 0.012, wa: 0.030 },
    { c: 0.41, d: 175, wb: 0.015, wa: 0.038 },
    { c: 0.52, d: 130, wb: 0.013, wa: 0.032 },
    { c: 0.64, d: 225, wb: 0.017, wa: 0.045 },
    { c: 0.76, d: 105, wb: 0.012, wa: 0.030 },
    { c: 0.89, d: 150, wb: 0.014, wa: 0.036 }
  ];
  const cornersB = corners.map((k, i) => ({
    c: k.c + [0.003, -0.002, 0.004, 0.002, -0.003, 0.004, 0.003, -0.002][i],
    d: k.d + [-5, -10, 5, -5, -2, -5, 5, -2][i],
    wb: k.wb,
    wa: k.wa * 1.06
  }));

  function speedTrace(cs, vmax) {
    const out = new Array(N);
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      let v = vmax;
      for (const k of cs) {
        const w = x < k.c ? k.wb : k.wa;
        const t = (x - k.c) / w;
        v -= k.d * Math.exp(-t * t);
      }
      out[i] = Math.max(70, v);
    }
    return out;
  }

  function cumulativeTime(v) {
    const dx = LAP / (N - 1);
    const t = [0];
    for (let i = 1; i < N; i++) {
      const vm = ((v[i] + v[i - 1]) / 2) / 3.6;
      t.push(t[i - 1] + dx / vm);
    }
    return t;
  }

  const vA = speedTrace(corners, 318);
  const vB = speedTrace(cornersB, 316);
  const tA = cumulativeTime(vA);
  const tB = cumulativeTime(vB);

  const frame = document.getElementById('trace');
  const traceFig = frame ? frame.closest('.trace') : null;
  const rDist = document.getElementById('r-dist');
  const rA = document.getElementById('r-a');
  const rB = document.getElementById('r-b');
  const rD = document.getElementById('r-d');

  const NS = 'http://www.w3.org/2000/svg';
  const W = 1000, H = 340;
  const M = { l: 46, r: 14, t: 14, b: 30 };
  const xs = x => M.l + x * (W - M.l - M.r);
  const ys = v => M.t + (1 - (v - V_MIN) / (V_MAX - V_MIN)) * (H - M.t - M.b);

  function el(name, attrs, parent) {
    const node = document.createElementNS(NS, name);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  function buildChart() {
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', focusable: 'false' });

    // Secteurs
    const bounds = [0, 0.33, 0.66, 1];
    for (let s = 0; s < 3; s++) {
      if (s === 1) {
        el('rect', {
          class: 'sector-bg',
          x: xs(bounds[s]), y: M.t,
          width: xs(bounds[s + 1]) - xs(bounds[s]), height: H - M.t - M.b
        }, svg);
      }
      const label = el('text', {
        class: 'sector-text',
        x: xs(bounds[s]) + 8, y: M.t + 16
      }, svg);
      label.textContent = 'S' + (s + 1);
    }

    // Grille et axes
    for (let v = 100; v <= 300; v += 50) {
      el('line', { class: 'grid', x1: M.l, x2: W - M.r, y1: ys(v), y2: ys(v) }, svg);
      const t = el('text', { class: 'axis-text', x: M.l - 8, y: ys(v) + 4, 'text-anchor': 'end' }, svg);
      t.textContent = v;
    }
    const unit = el('text', { class: 'axis-text', x: M.l - 8, y: M.t + 2, 'text-anchor': 'end' }, svg);
    unit.textContent = 'km/h';
    for (let d = 0; d <= 4000; d += 1000) {
      const t = el('text', { class: 'axis-text', x: xs(d / LAP), y: H - 8, 'text-anchor': d === 0 ? 'start' : 'middle' }, svg);
      t.textContent = d === 0 ? '0 m' : d;
    }

    // Courbes
    const pathFor = v => {
      let d = '';
      for (let i = 0; i < N; i += 2) {
        d += (i === 0 ? 'M' : 'L') + xs(i / (N - 1)).toFixed(1) + ' ' + ys(v[i]).toFixed(1);
      }
      d += 'L' + xs(1).toFixed(1) + ' ' + ys(v[N - 1]).toFixed(1);
      return d;
    };
    el('path', { class: 'line a', d: pathFor(vA), pathLength: 1 }, svg);
    el('path', { class: 'line b', d: pathFor(vB), pathLength: 1 }, svg);

    // Curseur
    const cursor = el('line', { class: 'cursor', y1: M.t, y2: H - M.b, x1: 0, x2: 0 }, svg);
    const dotA = el('circle', { class: 'dot a', r: 5, cx: 0, cy: 0 }, svg);
    const dotB = el('circle', { class: 'dot b', r: 5, cx: 0, cy: 0 }, svg);

    frame.appendChild(svg);

    const fmt = (n, dec) => {
      const s = n.toFixed(dec);
      return lang === 'fr' ? s.replace('.', ',') : s;
    };

    function update(frac) {
      const i = Math.max(0, Math.min(N - 1, Math.round(frac * (N - 1))));
      const x = xs(i / (N - 1));
      cursor.setAttribute('x1', x);
      cursor.setAttribute('x2', x);
      dotA.setAttribute('cx', x); dotA.setAttribute('cy', ys(vA[i]));
      dotB.setAttribute('cx', x); dotB.setAttribute('cy', ys(vB[i]));

      const gap = tB[i] - tA[i];
      rDist.textContent = Math.round((i / (N - 1)) * LAP) + ' m';
      rA.textContent = Math.round(vA[i]) + ' km/h';
      rB.textContent = Math.round(vB[i]) + ' km/h';
      rD.textContent = (gap >= 0 ? '+' : '\u2212') + fmt(Math.abs(gap), 3) + ' s';
    }

    function fromPointer(ev) {
      const rect = svg.getBoundingClientRect();
      const vx = ((ev.clientX - rect.left) / rect.width) * W;
      update((vx - M.l) / (W - M.l - M.r));
    }
    svg.addEventListener('pointermove', fromPointer);
    svg.addEventListener('pointerdown', fromPointer);

    // Position de départ : le virage le plus lent du tour
    update(0.17);
    window.__refreshTrace = () => rD.textContent = rD.textContent.replace(/[.,]/, lang === 'fr' ? ',' : '.');

    // Le tracé se dessine une seule fois au chargement
    requestAnimationFrame(() => requestAnimationFrame(() => traceFig.classList.add('drawn')));
  }
  if (frame) buildChart();

  /* ==========================================================
     2. Filtres de projets
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
     3. Bascule FR / EN
     ========================================================== */
  const langBtn = document.getElementById('lang');

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
    if (window.__refreshTrace) window.__refreshTrace();
    try { localStorage.setItem('lang', next); } catch (e) { /* stockage indisponible */ }
  }

  langBtn.addEventListener('click', () => setLang(lang === 'fr' ? 'en' : 'fr'));

  let saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) { /* ignoré */ }
  if (saved === 'en') setLang('en');
})();