/* =========================================================
   Site behaviour: language, nav, menu tabs, scroll reveals,
   the ticker, and the hero's cut counter.
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- language ---------------- */

  var LANGS = { zh: 'zh-Hant', en: 'en' };
  var STORE = 'cutting-onions:lang';

  function setLang(code, persist) {
    if (!LANGS[code]) code = 'zh';
    root.setAttribute('data-lang', code);
    root.setAttribute('lang', LANGS[code]);
    Array.prototype.forEach.call(document.querySelectorAll('[data-setlang]'), function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-setlang') === code));
    });
    if (persist) { try { localStorage.setItem(STORE, code); } catch (e) {} }
  }

  var stored = null;
  try { stored = localStorage.getItem(STORE); } catch (e) {}
  setLang(stored || 'zh', false);

  Array.prototype.forEach.call(document.querySelectorAll('[data-setlang]'), function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-setlang'), true); });
  });

  /* ---------------- nav ---------------- */

  var navEl = document.getElementById('nav');
  var hero = document.getElementById('hero');
  var burger = document.getElementById('burger');
  var links = document.getElementById('navlinks');

  if (navEl && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      navEl.classList.toggle('nav--solid', !entries[0].isIntersecting);
    }, { rootMargin: '-70px 0px 0px 0px', threshold: 0 }).observe(hero);
  } else if (navEl) {
    navEl.classList.add('nav--solid');
  }

  function closeNav() {
    if (!burger || !links) return;
    burger.setAttribute('aria-expanded', 'false');
    links.classList.remove('is-open');
  }

  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      links.classList.toggle('is-open', !open);
      if (!open) navEl.classList.add('nav--solid');
    });
    Array.prototype.forEach.call(links.querySelectorAll('a'), function (a) {
      a.addEventListener('click', closeNav);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ---------------- menu tabs ---------------- */

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });

  function selectTab(i, focus) {
    tabs.forEach(function (t, k) {
      var on = k === i;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (panels[k]) panels[k].hidden = !on;
    });
    if (focus) tabs[i].focus();
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(i, false); });
    t.addEventListener('keydown', function (e) {
      var n = tabs.length, j = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % n;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + n) % n;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = n - 1;
      if (j >= 0) { e.preventDefault(); selectTab(j, true); }
    });
  });

  /* ---------------- scroll reveals (the knife cut) ---------------- */

  var reveals = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(reveals, function (r) { r.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });
    Array.prototype.forEach.call(reveals, function (r) { io.observe(r); });

    // safety net: never leave content stuck at opacity 0
    window.addEventListener('load', function () {
      setTimeout(function () {
        Array.prototype.forEach.call(reveals, function (r) {
          var b = r.getBoundingClientRect();
          if (b.top < window.innerHeight && b.bottom > 0) r.classList.add('is-in');
        });
      }, 700);
    });
  }

  /* ---------------- ticker ---------------- */

  var track = document.getElementById('tickertrack');
  if (track) {
    var ITEMS = [
      ['Please don’t cry', false],
      ['唔好喊', true],
      ['Deep fried everythong!', false],
      ['曳野！', true],
      ['No service charge, tips welcomed', false],
      ['你快樂所以我快樂 :)', true],
      ['Bao cutting service unavailable', false],
      ['多謝支持本地農場', true]
    ];
    var SPARK = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 0 7.4 4.6 12 6 7.4 7.4 6 12 4.6 7.4 0 6 4.6 4.6Z" fill="#F4501B"/></svg>';
    var run = '<div class="ticker__run">' + ITEMS.map(function (it) {
      return SPARK + '<span class="' + (it[1] ? 'is-o' : '') + '">' + it[0] + '</span>';
    }).join('') + '</div>';
    track.innerHTML = run + run;
  }

  /* ---------------- hero cut counter ---------------- */

  var hint = document.getElementById('hint');
  var count = document.getElementById('cutcount');
  var revealed = false;

  if (hero) {
    hero.addEventListener('onion:cut', function (e) {
      var n = e.detail.cuts;
      if (count) count.textContent = 'Cut ' + n;
      if (revealed || !hint) return;
      if (n >= 14) {
        revealed = true;
        hint.classList.remove('is-dim');
        hint.classList.add('is-done');
      } else {
        hint.classList.add('is-dim');
      }
    });
  }

  /* ---------------- misc ---------------- */

  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
})();
