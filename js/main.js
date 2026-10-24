(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- dados do CONFIG ---------- */
  $$('[data-wa]').forEach(function (a) {
    a.href = linkWA(a.getAttribute('data-msg'));
    a.target = '_blank'; a.rel = 'noopener';
  });
  $$('[data-crn]').forEach(function (el) { el.textContent = CONFIG.crn || 'CRN a preencher'; });
  $$('[data-premio]').forEach(function (el) { el.textContent = CONFIG.premio.titulo; });
  if (CONFIG.premio.fonte) { var pf = $('#premioFonte'); pf.textContent = CONFIG.premio.fonte; pf.hidden = false; }
  $('#ano').textContent = new Date().getFullYear();

  /* ---------- topo e menu ---------- */
  var topo = $('#topo'), menu = $('#menu'), btn = $('#menuBtn'), wa = $('.wa-flutua');
  function rolar() {
    topo.classList.toggle('rolou', scrollY > 20);
    wa.classList.toggle('on', scrollY > innerHeight * .7);
  }
  addEventListener('scroll', rolar, { passive: true }); rolar();
  function fechar() { menu.classList.remove('aberto'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Abrir menu'); }
  btn.addEventListener('click', function () {
    var abre = !menu.classList.contains('aberto');
    menu.classList.toggle('aberto', abre);
    btn.setAttribute('aria-expanded', String(abre)); btn.setAttribute('aria-label', abre ? 'Fechar menu' : 'Abrir menu');
  });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', fechar); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('aberto')) { fechar(); btn.focus(); } });

  var links = {};
  $$('a', menu).forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        var a = links[e.target.id]; if (!a) return;
        if (e.isIntersecting) { $$('a', menu).forEach(function (x) { x.removeAttribute('aria-current'); }); a.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- animações de rolagem ---------- */
  var mov = !reduz && 'IntersectionObserver' in window;
  if (mov) document.documentElement.classList.add('js-mov');

  // títulos: cada palavra sobe de dentro de uma máscara
  function quebrar(el) {
    var n = 0;
    (function andar(no) {
      Array.prototype.slice.call(no.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
            var o = document.createElement('span'); o.className = 'pal';
            var d = document.createElement('span'); d.textContent = w; d.style.setProperty('--i', n++);
            o.appendChild(d); frag.appendChild(o);
          });
          no.replaceChild(frag, c);
        } else if (c.nodeType === 1) andar(c);
      });
    })(el);
  }
  var titulos = $$('.hero__titulo, .titulo, .aberto__titulo');
  if (mov) titulos.forEach(quebrar);

  var marcar = function (sel, cls) { $$(sel).forEach(function (el) { el.classList.add(cls); }); };
  if (mov) {
    marcar('.sobre__grande, .sobre__pequena', 'cortina');
    marcar('.aberto__card', 'lado');
    marcar('.premio__in, .contato__in, .eco__palco, .aval-destaque', 'zoom');
    marcar('.cabeca__lead, .hero__lead, .hero__acoes, .sobre__texto > p, .sobre__texto > .link, .aberto__lead, .aberto__por, .aberto__texto > .link, .premio__txt, .premio__in .btn, .contato__in > p, .contato__acoes, .caminho__cta', 'item');
    // grupos em cascata
    [['.versus__lado--dieta', 'li'], ['.versus__lado--trat', 'li'], ['.faq', 'details'], ['.fichas', 'div'], ['.eco__lista', 'button'], ['.passo', 'p, h3'], ['.avals', '.aval']].forEach(function (g) {
      $$(g[0]).forEach(function (pai) {
        pai.classList.add('grupo');
        $$(g[1], pai).forEach(function (f, k) { f.classList.add('item'); f.style.setProperty('--i', k); });
      });
    });
    $$('.item').forEach(function (el) { if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', 2); });
  }

  var pendentes = [];
  function ativar(g) {
    (g._alvos || [g]).forEach(function (t) {
      if (t.classList.contains('pal-alvo')) t.classList.add('tit-on');
      else if (t.classList.contains('grupo')) t.classList.add('grupo-on');
      else t.classList.add('on');
      if (t.classList.contains('item')) t.parentNode.classList.add('grupo-on');
    });
  }
  function observarTudo() {
    if (!mov) return;
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        (e.target._alvos || [e.target]).forEach(function (t) {
          if (t.classList.contains('pal-alvo')) t.classList.add('tit-on');
          else if (t.classList.contains('grupo')) t.classList.add('grupo-on');
          else t.classList.add('on');
          if (t.classList.contains('item')) t.parentNode.classList.add('grupo-on');
        });
        io.unobserve(e.target);
        var ix = pendentes.indexOf(e.target); if (ix > -1) pendentes.splice(ix, 1);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: .08 });
    var observar = io.observe.bind(io);
    io.observe = function (el) { pendentes.push(el); observar(el); };
    titulos.forEach(function (t) { t.classList.add('pal-alvo'); io.observe(t); });
    $$('.lado, .zoom, .grupo, .item, .cabeca, .sobrelinha').forEach(function (el) { io.observe(el); });
    // elementos recortados (clip-path) não disparam o observer: quem vigia é o pai
    function vigiar(gatilho, alvos) { gatilho._alvos = alvos; io.observe(gatilho); }
    vigiar($('.hero__fatos li'), [$('.hero__fatos')]);
    vigiar($('.sobre__fotos'), [$('.sobre__fotos'), $('.sobre__grande'), $('.sobre__pequena')]);
  }

  // paralaxe, faixa editorial, progresso e topo que se esconde
  var pars = $$('[data-par]'), imgs = $$('.cortina img'), faixas = $$('[data-faixa]'), faixa = $('.faixa');
  var prog = $('#progresso'), ultimoY = scrollY, pedido = false;
  var heroEl = $('.hero'), manifesto = $('#manifesto'), palavras = [];
  // manifesto: cada palavra acende conforme a rolagem
  (function () {
    var t = $('#manifestoTxt');
    if (reduz) return;
    (function andar(no) {
      Array.prototype.slice.call(no.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
            var sp = document.createElement('span'); sp.className = 'w'; sp.textContent = w; frag.appendChild(sp); palavras.push(sp);
          });
          no.replaceChild(frag, c);
        } else if (c.nodeType === 1) andar(c);
      });
    })(t);
  })();
  // profundidade com o mouse: nome, halo e figura andam em velocidades diferentes
  if (!reduz && matchMedia('(hover: hover)').matches) {
    heroEl.addEventListener('pointermove', function (e) {
      heroEl.style.setProperty('--mx', (e.clientX / innerWidth - .5) * 2);
      heroEl.style.setProperty('--my', (e.clientY / innerHeight - .5) * 2);
    });
    heroEl.addEventListener('pointerleave', function () { heroEl.style.setProperty('--mx', 0); heroEl.style.setProperty('--my', 0); });
    // botões magnéticos
    $$('.magnetico').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--bx', ((e.clientX - r.left - r.width / 2) * .22).toFixed(1) + 'px');
        b.style.setProperty('--by', ((e.clientY - r.top - r.height / 2) * .3).toFixed(1) + 'px');
      });
      b.addEventListener('pointerleave', function () { b.style.setProperty('--bx', '0px'); b.style.setProperty('--by', '0px'); });
    });
  }
  function quadroRolagem() {
    pedido = false;
    var vh = innerHeight, y = scrollY;
    prog.style.setProperty('--p', Math.min(1, y / Math.max(1, document.documentElement.scrollHeight - vh)));
    if (!menu.classList.contains('aberto')) topo.classList.toggle('some', y > ultimoY && y > 400);
    ultimoY = y;
    if (reduz) return;
    for (var k = pendentes.length - 1; k >= 0; k--) {
      if (pendentes[k].getBoundingClientRect().top < vh * .9) { ativar(pendentes[k]); pendentes.splice(k, 1); }
    }
    pars.forEach(function (el) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * parseFloat(el.getAttribute('data-par'))).toFixed(1) + 'px');
    });
    imgs.forEach(function (im) {
      var r = im.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var lim = r.height * .035, v = (r.top + r.height / 2 - vh / 2) * -.05;
      im.style.setProperty('--py', Math.max(-lim, Math.min(lim, v)).toFixed(1) + 'px');
    });
    heroEl.style.setProperty('--sy', Math.min(y, vh * 1.2).toFixed(1) + 'px');
    if (palavras.length) {
      var mr = manifesto.getBoundingClientRect();
      var pm = (vh * .82 - mr.top) / (mr.height * .9);
      var acesas = Math.round(Math.max(0, Math.min(1, pm)) * palavras.length);
      for (var w = 0; w < palavras.length; w++) palavras[w].classList.toggle('acesa', w < acesas);
    }
    if (faixa) {
      var fr = faixa.getBoundingClientRect();
      if (fr.bottom > -200 && fr.top < vh + 200) {
        var d = (vh - fr.top) * .45;
        faixas.forEach(function (f) {
          var dir = +f.getAttribute('data-faixa');
          f.style.setProperty('--x', (dir < 0 ? -d : d - f.scrollWidth * .35).toFixed(1) + 'px');
        });
      }
    }
  }
  addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(quadroRolagem); } }, { passive: true });
  addEventListener('resize', quadroRolagem);
  quadroRolagem();

  var versus = $('.versus');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en, o) { if (en[0].isIntersecting) { versus.classList.add('visto'); o.disconnect(); } }, { threshold: .35 }).observe(versus);
  } else versus.classList.add('visto');

  /* ---------- eco: temas repetidos ---------- */
  var eco = $('#eco'), palco = $('.eco__palco'), repete = $('.eco__repete'), frase = $('#ecoFrase');
  var tabs = $$('.eco__lista [role="tab"]');
  function marcar(txt) {
    return txt.split('|').map(function (p, i) {
      var esc = p.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      return i % 2 ? '<em>' + esc + '</em>' : esc;
    }).join('');
  }
  function escolher(b) {
    tabs.forEach(function (t) { var on = t === b; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    eco.classList.add('troca');
    setTimeout(function () {
      var w = b.getAttribute('data-eco');
      $$('span', repete).forEach(function (s) { s.textContent = w; });
      frase.innerHTML = marcar(b.getAttribute('data-frase'));
      eco.classList.remove('troca');
    }, reduz ? 0 : 260);
  }
  tabs.forEach(function (t, i) {
    t.tabIndex = i === 0 ? 0 : -1;
    t.addEventListener('click', function () { escolher(t); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, j = null;
      if (k === 'ArrowRight' || k === 'ArrowDown') j = (i + 1) % tabs.length;
      if (k === 'ArrowLeft' || k === 'ArrowUp') j = (i - 1 + tabs.length) % tabs.length;
      if (k === 'Home') j = 0; if (k === 'End') j = tabs.length - 1;
      if (j !== null) { e.preventDefault(); tabs[j].focus(); escolher(tabs[j]); }
    });
  });
  if (!reduz) {
    $('.temas').addEventListener('pointermove', function (e) {
      var r = palco.getBoundingClientRect();
      palco.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5) * 2);
    });
  }

  /* ---------- fio condutor dos passos ---------- */
  var passos = $('#passos'), fio = $('#fioPath'), base = $('#fioBase'), itens = $$('.passo'), L = 0, marcos = [];
  function tracar() {
    var pr = passos.getBoundingClientRect();
    var pts = itens.map(function (li) {
      var b = $('.passo__marco', li).getBoundingClientRect();
      return [b.left - pr.left + b.width / 2, b.top - pr.top + b.height / 2];
    });
    var d = 'M' + pts[0][0] + ' ' + (pts[0][1] - 60);
    d += ' L' + pts[0][0] + ' ' + pts[0][1];
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i], my = (a[1] + b[1]) / 2;
      var amp = Math.max(0, Math.min(70, a[0] - 6)) * (i % 2 ? 1 : -1); // ondula entre os marcos
      d += ' C' + (a[0] + amp) + ' ' + my + ' ' + (b[0] + amp) + ' ' + my + ' ' + b[0] + ' ' + b[1];
    }
    fio.setAttribute('d', d); base.setAttribute('d', d);
    L = fio.getTotalLength();
    fio.style.strokeDasharray = L;
    marcos = pts.map(function (p) { return p[1]; });
    progresso();
  }
  function progresso() {
    var pr = passos.getBoundingClientRect();
    var y = innerHeight * .62 - pr.top; // até onde o fio já "chegou"
    var t = reduz ? 1 : Math.max(0, Math.min(1, y / pr.height));
    fio.style.strokeDashoffset = L * (1 - t);
    itens.forEach(function (li, i) { li.classList.toggle('aceso', reduz || y >= marcos[i] - 10); });
  }
  addEventListener('scroll', progresso, { passive: true });
  addEventListener('resize', tracar);
  addEventListener('load', tracar);
  tracar();

  /* ---------- anéis de folha de ouro ---------- */
  function iniciarOuro() {
    var cvH = $('#ouroHero'), fig = $('#heroFigura');
    new AnelOuro(cvH, {
      alvo: $('.hero'),
      aneis: function () { // halo atrás da cabeça
        var fr = fig.getBoundingClientRect(), cr = cvH.getBoundingClientRect(), w = fr.width;
        return [
          { cx: fr.left - cr.left + w * .63, cy: fr.top - cr.top + fr.height * .27, R: w * .44, larg: Math.max(9, w * .032), ini: -2.2, arco: 6.2832 },
          { cx: fr.left - cr.left + w * .63, cy: fr.top - cr.top + fr.height * .27, R: w * .56, larg: Math.max(4, w * .01), ini: .6, arco: 3.4, alfa: .7 }
        ];
      }
    }).pintar(2200);
    new AnelOuro($('#ouroPremio'), {
      alvo: $('#premio'), pintarAoVer: true,
      aneis: function (w, h) {
        if (w < 700) { // no celular o anel abraça só o monograma
          var mr = $('.premio__mono').getBoundingClientRect(), cr = $('#ouroPremio').getBoundingClientRect();
          return [{ cx: mr.left - cr.left + mr.width / 2, cy: mr.top - cr.top + mr.height / 2, R: 62, larg: 7, ini: -1.6, arco: 6.2832 }];
        }
        var R = Math.min(h * .44, w * .3);
        return [{ cx: w / 2, cy: h / 2, R: R, larg: Math.max(10, R * .045), ini: -1.6, arco: 6.2832 }];
      }
    });
    new AnelOuro($('#ouroContato'), {
      alvo: $('.contato'), pintarAoVer: true,
      aneis: function (w, h) {
        var m = w < 700 ? w * .62 : Math.min(w, h);
        return [
          { cx: w * .1, cy: h * (w < 700 ? 1.06 : .92), R: m * .42, larg: Math.max(9, m * .022), ini: -1.6, arco: 6.2832 },
          { cx: w * .92, cy: h * .08, R: m * .3, larg: Math.max(8, m * .02), ini: 1.2, arco: 6.2832 }
        ];
      }
    });
  }

  /* ---------- abertura ---------- */
  document.documentElement.style.overflow = 'hidden';
  abertura(function () {
    document.documentElement.style.overflow = '';
    $('.hero').classList.add('entrou');
    iniciarOuro();
    tracar();
    observarTudo();
  });
})();
