/* =========================================================
   Onion field — the hero.
   A soft-body cluster of onions (the sunglasses mark off the
   glassware: round, no legs, no lettering) drifting toward the
   centre. The pointer parts them; a fast stroke cuts them in
   half. Plain 2D canvas, no dependencies.
   Dispatches "onion:cut" on the hero with { cuts }.
   ========================================================= */
(function () {
  'use strict';

  var cv = document.getElementById('onionfield');
  var hero = document.getElementById('hero');
  if (!cv || !hero || !cv.getContext) return;

  var ctx = cv.getContext('2d', { alpha: true });
  var LINE = '#0E0B09';
  var SKINS = [
    { fill: '#F4501B', vein: 'rgba(14,11,9,.50)', ring: '#FCF8EF' },
    { fill: '#F4501B', vein: 'rgba(14,11,9,.50)', ring: '#FCF8EF' },
    { fill: '#F6EFE1', vein: 'rgba(14,11,9,.34)', ring: '#F4501B' },
    { fill: '#C93A0F', vein: 'rgba(14,11,9,.50)', ring: '#FCF8EF' }
  ];

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W = 0, H = 0, CX = 0, CY = 0, target = 0;
  var onions = [], halves = [], tears = [], trail = [];
  var px = -9999, py = -9999, lx = -9999, ly = -9999, moved = false;
  var cuts = 0, raf = null, visible = true, running = false;

  /* ---------- sizing ---------- */

  function densityFor(w, h) {
    var n = Math.round((w * h) / 15000);
    return Math.max(18, Math.min(84, n));
  }

  function resize() {
    W = hero.clientWidth;
    H = hero.clientHeight;
    if (!W || !H) return false;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    CX = W / 2;
    CY = H * 0.47;
    target = densityFor(W, H);
    return true;
  }

  function make(initial) {
    var a = Math.random() * Math.PI * 2;
    var d = initial ? Math.pow(Math.random(), 0.62) * Math.min(330, W * 0.3)
                    : Math.max(W, H) * 0.62 + Math.random() * 180;
    var base = Math.min(1, W / 1200);
    var r = (20 + Math.pow(Math.random(), 1.7) * 44) * Math.max(0.62, base);
    var s = SKINS[(Math.random() * SKINS.length) | 0];
    return {
      x: CX + Math.cos(a) * d * 1.45,
      y: CY + Math.sin(a) * d,
      vx: 0, vy: 0, r: r,
      rot: (Math.random() - 0.5) * 0.9,
      spin: (Math.random() - 0.5) * 0.012,
      fill: s.fill, vein: s.vein, ring: s.ring
    };
  }

  function seed() {
    onions = []; halves = []; tears = []; trail = [];
    for (var i = 0; i < target; i++) onions.push(make(true));
  }

  /* ---------- simulation ---------- */

  function step() {
    var i, j, o;

    for (i = 0; i < onions.length; i++) {
      o = onions[i];
      var dx = CX - o.x, dy = CY - o.y;
      var d = Math.sqrt(dx * dx + dy * dy) || 1;
      var pull = d > Math.min(300, W * 0.26) ? 0.14 : 0.05;
      o.vx += (dx / d) * pull;
      o.vy += (dy / d) * pull;

      if (px > -9000) {
        var ax = o.x - px, ay = o.y - py;
        var ad = Math.sqrt(ax * ax + ay * ay) || 1;
        if (ad < 150) {
          var f = (1 - ad / 150) * 2.4;
          o.vx += (ax / ad) * f;
          o.vy += (ay / ad) * f;
        }
      }
      o.vx *= 0.93; o.vy *= 0.93;
      o.x += o.vx; o.y += o.vy; o.rot += o.spin;
    }

    for (i = 0; i < onions.length; i++) {
      for (j = i + 1; j < onions.length; j++) {
        var a = onions[i], b = onions[j];
        var ux = b.x - a.x, uy = b.y - a.y;
        var ud = Math.sqrt(ux * ux + uy * uy) || 1;
        var min = (a.r + b.r) * 0.94;
        if (ud < min) {
          var push = (min - ud) / ud * 0.34;
          var mx = ux * push, my = uy * push;
          a.x -= mx; a.y -= my; b.x += mx; b.y += my;
          a.rot -= 0.004; b.rot += 0.004;
        }
      }
    }

    for (i = halves.length - 1; i >= 0; i--) {
      var h = halves[i];
      h.vy += 0.34; h.vx *= 0.995;
      h.x += h.vx; h.y += h.vy; h.rot += h.spin; h.life -= 1;
      if (h.life <= 0 || h.y - h.r > H + 80) halves.splice(i, 1);
    }
    for (i = tears.length - 1; i >= 0; i--) {
      var t = tears[i];
      t.vy += 0.42; t.x += t.vx; t.y += t.vy; t.life -= 1;
      if (t.life <= 0 || t.y > H + 40) tears.splice(i, 1);
    }
    for (i = trail.length - 1; i >= 0; i--) {
      trail[i].life -= 1;
      if (trail[i].life <= 0) trail.splice(i, 1);
    }

    if (onions.length < target && Math.random() < 0.028) onions.push(make(false));
  }

  function slice() {
    var qx = px, qy = py;
    if (lx < -9000) { lx = qx; ly = qy; return; }
    var sx = lx, sy = ly;
    lx = qx; ly = qy;

    var bx = qx - sx, by = qy - sy;
    var len = Math.sqrt(bx * bx + by * by);
    if (len < 7) return;

    trail.push({ x: qx, y: qy, life: 16 });
    var ux = bx / len, uy = by / len;
    var rot = Math.atan2(-ux, uy);
    var nx = Math.cos(rot), ny = Math.sin(rot);
    var before = cuts;

    for (var i = onions.length - 1; i >= 0; i--) {
      var o = onions[i];
      var t = ((o.x - sx) * bx + (o.y - sy) * by) / (len * len);
      t = t < 0 ? 0 : (t > 1 ? 1 : t);
      var cx = sx + bx * t, cy = sy + by * t;
      var ddx = o.x - cx, ddy = o.y - cy;
      if (Math.sqrt(ddx * ddx + ddy * ddy) > o.r * 0.86) continue;

      onions.splice(i, 1);
      for (var s = -1; s <= 1; s += 2) {
        halves.push({
          x: o.x + nx * o.r * 0.2 * s,
          y: o.y + ny * o.r * 0.2 * s,
          vx: o.vx * 0.4 + nx * s * 4.2 + ux * 1.6,
          vy: o.vy * 0.4 + ny * s * 4.2 + uy * 1.6 - 1.6,
          r: o.r, rot: rot, side: s,
          spin: s * (0.03 + Math.random() * 0.03),
          life: 150, fill: o.fill, ring: o.ring
        });
      }
      var nt = 1 + ((Math.random() * 2) | 0);
      for (var k = 0; k < nt; k++) {
        tears.push({
          x: o.x, y: o.y,
          vx: (Math.random() - 0.5) * 2.6,
          vy: -2 - Math.random() * 2,
          r: 5 + Math.random() * 4, life: 90
        });
      }
      cuts++;
    }

    if (cuts !== before) {
      hero.dispatchEvent(new CustomEvent('onion:cut', { detail: { cuts: cuts } }));
    }
  }

  /* ---------- drawing ---------- */

  function lens(cx, cy, rx, ry, rot) {
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(rot);
    ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawOnion(o) {
    var r = o.r, i;
    ctx.save();
    ctx.translate(o.x, o.y); ctx.rotate(o.rot);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = o.fill; ctx.fill();
    ctx.lineWidth = Math.max(2.4, r * 0.07); ctx.strokeStyle = LINE; ctx.stroke();

    ctx.strokeStyle = o.vein; ctx.lineWidth = Math.max(1.3, r * 0.045);
    var gx = [-0.62, -0.30, 0.30, 0.62];
    for (i = 0; i < gx.length; i++) {
      ctx.beginPath();
      ctx.moveTo(gx[i] * r * 0.30, -r * 0.90);
      ctx.quadraticCurveTo(gx[i] * r * 1.16, -r * 0.06, gx[i] * r * 0.90, r * 0.44);
      ctx.stroke();
    }

    ctx.strokeStyle = LINE; ctx.lineWidth = Math.max(2, r * 0.058);
    ctx.beginPath();
    ctx.moveTo(-r * 0.20, -r * 0.97);
    ctx.quadraticCurveTo(-r * 0.34, -r * 1.36, -r * 0.02, -r * 1.18);
    ctx.quadraticCurveTo(r * 0.30, -r * 1.42, r * 0.22, -r * 1.00);
    ctx.stroke();

    ctx.fillStyle = LINE;
    lens(-r * 0.40, -r * 0.05, r * 0.36, r * 0.27, -0.13);
    lens(r * 0.40, -r * 0.05, r * 0.36, r * 0.27, 0.13);
    ctx.beginPath(); ctx.rect(-r * 0.10, -r * 0.15, r * 0.20, r * 0.13); ctx.fill();

    if (r > 40) {
      ctx.strokeStyle = LINE; ctx.lineWidth = Math.max(2, r * 0.05);
      ctx.beginPath();
      ctx.moveTo(r * 0.90, r * 0.24);
      ctx.quadraticCurveTo(r * 1.16, r * 0.18, r * 1.22, 0);
      ctx.stroke();
      ctx.beginPath(); ctx.arc(r * 1.24, -r * 0.04, r * 0.06, 0, Math.PI * 2); ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-r * 0.90, r * 0.24);
      ctx.quadraticCurveTo(-r * 1.14, r * 0.16, -r * 1.20, -r * 0.06);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-r * 1.28, -r * 0.18);
      ctx.lineTo(-r * 1.13, -r * 0.24);
      ctx.lineTo(-r * 1.19, -r * 0.72);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function drawHalf(h) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, h.life / 42);
    ctx.translate(h.x, h.y); ctx.rotate(h.rot); ctx.scale(h.side, 1);

    ctx.beginPath();
    ctx.arc(0, 0, h.r, -Math.PI / 2, Math.PI / 2);
    ctx.closePath();
    ctx.fillStyle = h.fill; ctx.fill();
    ctx.lineWidth = Math.max(2.4, h.r * 0.07); ctx.strokeStyle = LINE; ctx.stroke();

    ctx.strokeStyle = h.ring; ctx.lineWidth = Math.max(1.8, h.r * 0.055);
    for (var k = 1; k <= 3; k++) {
      var rr = h.r * (0.24 * k + 0.05);
      ctx.beginPath();
      ctx.ellipse(0, 0, rr * 0.9, rr, 0, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.ellipse(0, 0, h.r * 0.09, h.r * 0.12, 0, -Math.PI / 2, Math.PI / 2);
    ctx.fillStyle = h.ring; ctx.fill();
    ctx.restore();
  }

  function drawTear(t) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, t.life / 32);
    ctx.translate(t.x, t.y); ctx.rotate(Math.PI * 0.25);
    ctx.beginPath();
    ctx.moveTo(0, -t.r);
    ctx.bezierCurveTo(t.r, -t.r * 0.2, t.r * 0.78, t.r, 0, t.r);
    ctx.bezierCurveTo(-t.r * 0.78, t.r, -t.r, -t.r * 0.2, 0, -t.r);
    ctx.fillStyle = '#F4501B'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = LINE; ctx.stroke();
    ctx.restore();
  }

  function paint() {
    var i;
    ctx.clearRect(0, 0, W, H);

    if (trail.length > 1) {
      ctx.save();
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#F4501B';
      for (i = 1; i < trail.length; i++) {
        var p = trail[i - 1], q = trail[i];
        ctx.globalAlpha = Math.min(1, q.life / 16) * 0.85;
        ctx.lineWidth = 2 + (q.life / 16) * 5;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      }
      ctx.restore();
    }

    for (i = 0; i < halves.length; i++) drawHalf(halves[i]);
    for (i = 0; i < onions.length; i++) drawOnion(onions[i]);
    for (i = 0; i < tears.length; i++) drawTear(tears[i]);
  }

  /* ---------- loop ---------- */

  function frame() {
    if (!running) return;
    if (hero.clientWidth !== W || hero.clientHeight !== H) { if (resize()) trimToTarget(); }
    if (moved) { slice(); moved = false; }
    step();
    paint();
    raf = requestAnimationFrame(frame);
  }

  function trimToTarget() {
    while (onions.length > target) onions.pop();
  }

  function start() {
    if (running || reduced) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }

  /* ---------- input ---------- */

  hero.addEventListener('pointermove', function (e) {
    var r = cv.getBoundingClientRect();
    px = e.clientX - r.left;
    py = e.clientY - r.top;
    moved = true;
  }, { passive: true });

  hero.addEventListener('pointerleave', function () {
    px = py = lx = ly = -9999;
  }, { passive: true });

  window.addEventListener('resize', function () {
    if (resize()) trimToTarget();
    if (reduced) settle();
  }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else if (visible) start();
  });

  function settle() {
    for (var i = 0; i < 240; i++) step();
    paint();
  }

  /* ---------- go ---------- */

  if (!resize()) {
    window.addEventListener('load', function () { if (resize()) { seed(); begin(); } });
  } else {
    seed();
    begin();
  }

  function begin() {
    if (reduced) { settle(); return; }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !document.hidden) start(); else stop();
      }, { threshold: 0 }).observe(hero);
    } else {
      start();
    }
  }
})();
