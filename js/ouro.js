/* Folha de ouro.
   Anéis pintados em folha de ouro, como os dos posts da Joyce. O mouse funciona como luz (o brilho
   corre pelo anel na direção do cursor) e as lâminas se soltam quando ele passa perto, voltando ao lugar.
   A abertura pinta o anel de 0 a 100%. */
(function () {
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var TONS = [[138, 99, 40], [168, 128, 66], [196, 160, 98], [216, 186, 126], [232, 208, 150]];
  var LUZ = [255, 246, 214];

  function aleat(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function ruido(r) { // espessura irregular de pincel ao longo do anel
    var f = [r() * 6.28, r() * 6.28, r() * 6.28];
    return function (t) { return .62 + .2 * Math.sin(t * 3 + f[0]) + .12 * Math.sin(t * 7 + f[1]) + .06 * Math.sin(t * 17 + f[2]); };
  }

  function criarLaminas(a, seed) {
    var r = aleat(seed || 7), esp = ruido(r), L = [];
    var n = Math.round(a.arco * a.R * a.larg / 7);
    for (var i = 0; i < n; i++) {
      var u = r(), th = a.ini + u * a.arco;
      var e = a.larg * esp(th);
      if (r() > Math.min(1, esp(th) + .25)) continue; // falhas da folha
      var rr = a.R + (r() - .5) * e + (r() - .5) * (r() - .5) * e * .6;
      var s = .9 + r() * 2.6 * (a.larg / 14);
      var pts = [];
      for (var k = 0; k < 4; k++) { var ang = k * 1.5708 + (r() - .5) * .9; var d = s * (.55 + r() * .6); pts.push(Math.cos(ang) * d, Math.sin(ang) * d); }
      L.push({ u: u, th: th, rr: rr, hx: 0, hy: 0, ox: 0, oy: 0, vx: 0, vy: 0, rot: r() * 6.28, vr: 0, dr: 0, pts: pts, tom: Math.floor(r() * TONS.length), fac: r() * 6.28 });
    }
    return L;
  }

  function Anel(canvas, opts) {
    this.cv = canvas; this.ctx = canvas.getContext('2d'); this.o = opts;
    this.mouse = { x: -9999, y: -9999, vx: 0, vy: 0, t: 0, dentro: false };
    this.luz = -0.8; this.visivel = true; this.aneis = [];
    var self = this;
    this.medir();
    addEventListener('resize', function () { clearTimeout(self._rz); self._rz = setTimeout(function () { self.medir(); }, 150); });
    var alvo = opts.alvo || window;
    alvo.addEventListener('pointermove', function (e) { self.mover(e); }, { passive: true });
    alvo.addEventListener('pointerdown', function (e) { self.mover(e); self.sopro(); });
    alvo.addEventListener('pointerleave', function () { self.mouse.dentro = false; self.mouse.x = -9999; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        self.visivel = en[0].isIntersecting;
        if (self.visivel) { if (opts.pintarAoVer && !self._pintou) self.pintar(1600); self.loop(); }
      }, { threshold: .15 }).observe(canvas);
    }
    if (opts.pintarAoVer) this.aneis.forEach(function (a) { a.prog = 0; });
    this.loop();
  }
  Anel.prototype.medir = function () {
    var r = this.cv.getBoundingClientRect();
    this.w = r.width; this.h = r.height;
    this.cv.width = Math.round(r.width * DPR); this.cv.height = Math.round(r.height * DPR);
    var progs = this.aneis.map(function (a) { return a.prog; });
    this.aneis = this.o.aneis(this.w, this.h, this.cv).map(function (a, i) {
      a.lam = criarLaminas(a, 11 + i * 97);
      a.prog = progs[i] == null ? 1 : progs[i];
      a.lam.forEach(function (l) { l.hx = a.cx + Math.cos(l.th) * l.rr; l.hy = a.cy + Math.sin(l.th) * l.rr; });
      return a;
    });
  };
  Anel.prototype.pintar = function (ms, cb) {
    var self = this, t0 = performance.now();
    this._pintou = true;
    this.aneis.forEach(function (a) { a.prog = 0; });
    (function f(now) {
      var p = Math.min(1, (now - t0) / (reduz ? 1 : ms)), e = 1 - Math.pow(1 - p, 3);
      self.aneis.forEach(function (a) { a.prog = e; });
      if (p < 1) requestAnimationFrame(f); else if (cb) cb();
    })(t0);
  };
  Anel.prototype.mover = function (e) {
    var r = this.cv.getBoundingClientRect(), m = this.mouse, now = performance.now();
    var x = e.clientX - r.left, y = e.clientY - r.top;
    if (m.t && now - m.t < 80) { m.vx = x - m.x; m.vy = y - m.y; } else { m.vx = m.vy = 0; }
    m.x = x; m.y = y; m.t = now; m.dentro = true;
    if (this.o.aoTocar) this.o.aoTocar();
  };
  Anel.prototype.sopro = function () { // clique: as lâminas próximas voam e voltam
    var m = this.mouse;
    this.aneis.forEach(function (a) {
      a.lam.forEach(function (l) {
        var dx = l.hx + l.ox - m.x, dy = l.hy + l.oy - m.y, d = Math.hypot(dx, dy);
        if (d < 150) {
          var k = (1 - d / 150) * (7 + Math.random() * 6);
          l.vx += dx / (d + 1) * k + (Math.random() - .5) * 3; l.vy += dy / (d + 1) * k - Math.random() * 3;
          l.vr += (Math.random() - .5) * .5;
        }
      });
    });
  };
  Anel.prototype.passo = function () {
    var m = this.mouse, R = 64;
    this.aneis.forEach(function (a) {
      var L = a.lam;
      for (var i = 0; i < L.length; i++) {
        var l = L[i];
        if (m.dentro) {
          var px = l.hx + l.ox, py = l.hy + l.oy, dx = px - m.x, dy = py - m.y;
          if (dx < R && dx > -R && dy < R && dy > -R) {
            var d = Math.hypot(dx, dy);
            if (d < R) {
              var f = (1 - d / R);
              l.vx += dx / (d + .1) * f * 1.6 + m.vx * f * .08;
              l.vy += dy / (d + .1) * f * 1.6 + m.vy * f * .08;
              l.vr += f * .04 * (l.tom - 2);
            }
          }
        }
        l.vx = (l.vx - l.ox * .045) * .88; l.vy = (l.vy - l.oy * .045) * .88;
        l.ox += l.vx; l.oy += l.vy;
        l.vr = (l.vr - l.dr * .05) * .9; l.dr += l.vr;
      }
    });
    m.vx *= .8; m.vy *= .8;
  };
  Anel.prototype.desenhar = function (tempo) {
    var c = this.ctx, m = this.mouse;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, this.cv.width, this.cv.height);
    var fora = this.o.fora ? this.o.fora() : null;
    for (var j = 0; j < this.aneis.length; j++) {
      var a = this.aneis[j];
      var luz = m.dentro ? Math.atan2(m.y - a.cy, m.x - a.cx) : (tempo * .00025) % 6.2832;
      a.luz = a.luz == null ? luz : a.luz + Math.atan2(Math.sin(luz - a.luz), Math.cos(luz - a.luz)) * .12;
      var L = a.lam;
      for (var i = 0; i < L.length; i++) {
        var l = L[i];
        if (l.u > a.prog) continue;
        var x = l.hx + l.ox, y = l.hy + l.oy;
        if (fora && a.atras && x > fora.l && x < fora.r && y > fora.t && y < fora.b) continue;
        var s = Math.pow(.5 + .5 * Math.cos(l.th - a.luz), 10) * .75 + Math.pow(.5 + .5 * Math.cos(l.fac - a.luz * 2 + l.dr), 16) * .55;
        var solta = Math.min(1, Math.hypot(l.ox, l.oy) / 30);
        s = Math.min(1, s + solta * .5);
        var t = TONS[l.tom];
        var cr = t[0] + (LUZ[0] - t[0]) * s | 0, cg = t[1] + (LUZ[1] - t[1]) * s | 0, cb = t[2] + (LUZ[2] - t[2]) * s | 0;
        var borda = a.prog < 1 ? Math.min(1, (a.prog - l.u) * 30) : 1;
        c.globalAlpha = (a.alfa || 1) * borda;
        c.fillStyle = 'rgb(' + cr + ',' + cg + ',' + cb + ')';
        var co = Math.cos(l.rot + l.dr) * DPR, si = Math.sin(l.rot + l.dr) * DPR;
        c.setTransform(co, si, -si, co, x * DPR, y * DPR);
        var p = l.pts;
        c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(p[2], p[3]); c.lineTo(p[4], p[5]); c.lineTo(p[6], p[7]); c.closePath(); c.fill();
      }
    }
    c.globalAlpha = 1;
  };
  Anel.prototype.loop = function () {
    if (this._rodando) return;
    this._rodando = true;
    var self = this;
    (function f(t) {
      if (!self.visivel) { self._rodando = false; return; }
      if (!reduz) self.passo();
      self.desenhar(reduz ? 0 : t);
      requestAnimationFrame(f);
    })(performance.now());
  };
  window.AnelOuro = Anel;

  /* ---------- abertura: o anel é pintado de 0 a 100% ---------- */
  window.abertura = function (pronto) {
    var el = document.getElementById('abertura'), cv = document.getElementById('anelAbertura'), pct = document.getElementById('pct');
    if (!el || !cv) { pronto(); return; }
    var anel = new Anel(cv, {
      aneis: function (w, h) {
        var R = Math.min(w, h) * .2 + 30;
        return [{ cx: w / 2, cy: h * .45, R: R, larg: Math.max(10, R * .07), ini: -2.1, arco: 6.2832 }];
      }
    });
    anel.aneis[0].prog = 0;
    var carregou = document.readyState === 'complete';
    addEventListener('load', function () { carregou = true; });
    var T = reduz ? 500 : 3000, t0 = performance.now();
    function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    (function quadro(now) {
      var p = Math.min(1, (now - t0) / T);
      if (!carregou) p = Math.min(p, .92);
      var e = ease(p);
      anel.aneis[0].prog = e;
      pct.textContent = Math.round(e * 100);
      if (p < 1) { requestAnimationFrame(quadro); return; }
      el.classList.add('monograma');
      setTimeout(function () { el.classList.add('sai'); pronto(); }, reduz ? 200 : 1700);
      setTimeout(function () { el.classList.add('fim'); anel.visivel = false; }, reduz ? 700 : 2900);
    })(t0);
  };
})();
