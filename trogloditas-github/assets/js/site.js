/* Trogloditas Family Club · interacciones comunes */
{
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;
const A = document.body.classList.contains('is-embed') ? '../' : '';
window.TROG_A = A;

/* ---------- telón con el arco ---------- */
const curtain = $('.curtain');
if (curtain) {
  if (reduce) curtain.remove();
  else requestAnimationFrame(() => setTimeout(() => curtain.classList.add('is-up'), 120));
  window.addEventListener('pageshow', ev => { if (ev.persisted && curtain) { curtain.className = 'curtain is-up'; } });
  document.addEventListener('click', ev => {
    const a = ev.target.closest('a[href]');
    if (!a || reduce || ev.metaKey || ev.ctrlKey || ev.shiftKey || a.target === '_blank') return;
    const href = a.getAttribute('href');
    if (!/^[\w-]+\.html(#[\w-]+)?$/.test(href)) return;
    const here = location.pathname.split('/').pop() || 'index.html';
    if (href.split('#')[0] === here) return;
    ev.preventDefault();
    curtain.className = 'curtain is-down';
    void curtain.offsetWidth;
    curtain.className = 'curtain is-cover';
    setTimeout(() => { location.href = href; }, 620);
  });
}

/* ---------- cabecera ---------- */
const top = $('.top');
const onScroll = () => top && top.classList.toggle('is-scrolled', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

const burger = $('.burger'), menu = $('#menu');
if (burger && menu) {
  const close = () => { menu.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); setTimeout(() => menu.hidden = true, 500); burger.focus(); };
  burger.addEventListener('click', () => {
    menu.hidden = false; requestAnimationFrame(() => menu.classList.add('is-open'));
    burger.setAttribute('aria-expanded', 'true'); setTimeout(() => $('a', menu).focus(), 300);
  });
  $('.menu__close', menu).addEventListener('click', close);
  menu.addEventListener('keydown', ev => { if (ev.key === 'Escape') close(); });
}

/* ---------- títulos palabra a palabra ---------- */
$$('[data-split]').forEach(h => {
  const words = h.textContent.trim().split(/\s+/);
  h.setAttribute('aria-label', h.textContent.trim());
  h.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`).join(' ');
});

/* ---------- huellas ---------- */
$$('[data-trail]').forEach(t => {
  const n = innerWidth < 700 ? 7 : 11;
  let html = '';
  for (let i = 0; i < n; i++) {
    const x = 6 + (i / (n - 1)) * 88;
    const y = 50 + Math.sin(i / (n - 1) * Math.PI * 1.4) * 32 + (i % 2 ? 14 : -14);
    html += `<img src="${A}assets/svg/huella.svg" alt="" style="left:${x}%;top:${y}px;--i:${i};--rot:${80 + (i % 2 ? 14 : -10)}deg">`;
  }
  t.innerHTML = html;
});

/* ---------- aparición al hacer scroll ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
}, { threshold: .18, rootMargin: '0px 0px -6% 0px' });
$$('[data-reveal],[data-split],[data-peek],[data-trail]').forEach(el => io.observe(el));

/* ---------- el dino que camina con el scroll ---------- */
const walkers = $$('[data-walk]');
if (walkers.length && !reduce) {
  let ticking = false;
  const walk = () => {
    walkers.forEach(w => {
      const r = w.parentElement.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
      const span = w.parentElement.clientWidth + w.offsetWidth;
      const bob = Math.sin(p * 60) * 4;
      w.style.transform = `translate(${p * span - w.offsetWidth}px, ${bob}px) rotate(${Math.sin(p * 60) * 3}deg)`;
    });
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(walk); } }, { passive: true });
  walk();
}

/* ---------- profundidad con el puntero ---------- */
const depth = $$('[data-depth]');
if (depth.length && finePointer && !reduce) {
  addEventListener('pointermove', ev => {
    const x = ev.clientX / innerWidth - .5, y = ev.clientY / innerHeight - .5;
    depth.forEach(el => { const d = +el.dataset.depth; el.style.translate = `${x * d}px ${y * d}px`; });
  }, { passive: true });
}

/* ---------- pinta la cueva ---------- */
const wall = $('[data-paint]');
if (wall) {
  const blots = ['mancha-naranja', 'mancha-rosa', 'mancha-azul', 'mancha-amarillo', 'mancha-verde', 'huella'];
  const live = [];
  wall.addEventListener('pointerdown', ev => {
    if (ev.target.closest('a,button')) return;
    const r = wall.getBoundingClientRect();
    const img = new Image();
    const name = blots[Math.floor(Math.random() * blots.length)];
    img.src = `${A}assets/svg/${name}.svg`; img.alt = ''; img.className = 'splash';
    img.style.left = ev.clientX - r.left + 'px'; img.style.top = ev.clientY - r.top + 'px';
    img.style.setProperty('--s', (name === 'huella' ? 34 : 60 + Math.random() * 90) + 'px');
    img.style.setProperty('--rot', Math.round(Math.random() * 360) + 'deg');
    wall.appendChild(img); live.push(img);
    if (live.length > 16) { const old = live.shift(); old.style.opacity = 0; setTimeout(() => old.remove(), 1200); }
    const hint = $('.hero__hint'); if (hint) hint.classList.add('is-used');
  });
}

/* ---------- horario de hoy (hora de Motril) ---------- */
const HOURS = { 0: [10, 20], 1: null, 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 19], 6: [10, 20] };
const now = new Date();
const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(now);
const wdMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const wd = wdMap[parts.find(p => p.type === 'weekday').value];
const hr = +parts.find(p => p.type === 'hour').value + (+parts.find(p => p.type === 'minute').value) / 60;
const h = HOURS[wd];
let msg;
if (!h) msg = 'Hoy es lunes y descansamos. Mañana abrimos a las 9:00.';
else if (hr < h[0]) msg = `Hoy abrimos a las ${h[0]}:00`;
else if (hr < h[1]) msg = `Ahora estamos abiertos hasta las ${h[1]}:00`;
else { const n = HOURS[(wd + 1) % 7]; msg = n ? `Por hoy hemos cerrado. Mañana abrimos a las ${n[0]}:00.` : 'Por hoy hemos cerrado. Mañana es lunes y descansamos.'; }
$$('[data-today]').forEach(el => el.textContent = msg);
$$('[data-days]').forEach(li => { if (li.dataset.days.split(' ').includes(String(wd))) { li.classList.add('is-today'); li.insertAdjacentHTML('beforeend', '<em class="hand">hoy</em>'); } });

/* ---------- diálogos ---------- */
const openDialog = d => { if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', ''); document.documentElement.style.overflow = 'hidden'; };
const closeDialog = d => { d.close ? d.close() : d.removeAttribute('open'); };
$$('dialog.modal').forEach(d => {
  d.addEventListener('close', () => document.documentElement.style.overflow = '');
  d.addEventListener('click', ev => { if (ev.target === d || ev.target.closest('[data-close]')) closeDialog(d); });
});
window.Trog = { openDialog, closeDialog };

/* ---------- validación de formularios ---------- */
const validate = form => {
  let ok = true, first;
  $$('input[required],select[required]', form).forEach(inp => {
    const bad = inp.type === 'checkbox' ? !inp.checked : !inp.checkValidity() || !inp.value.trim();
    const f = inp.closest('.field'); if (f) f.classList.toggle('is-bad', bad);
    inp.setAttribute('aria-invalid', bad);
    if (bad) { ok = false; first = first || inp; }
  });
  if (first) first.focus();
  return ok;
};
window.Trog.validate = validate;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
window.Trog.esc = esc;

/* ---------- reservas de talleres ---------- */
const rs = $('#reserva');
if (rs) {
  const form = $('#rs-form', rs), done = $('#rs-done', rs), sel = $('#rs-act', rs);
  const dinos = { 'pequenos-exploradores': 'dino-azul', 'manos-de-cavernicola': 'dino-rosa', 'circulo-de-la-tribu': 'dino-verde' };
  const setAct = id => { sel.value = id; $('#rs-dino', rs).src = `${A}assets/svg/${dinos[id]}.svg`; $('#rs-sub', rs).textContent = sel.selectedOptions[0].textContent; };
  sel.addEventListener('change', () => setAct(sel.value));
  $$('[data-reserve]').forEach(b => b.addEventListener('click', () => {
    form.hidden = false; done.hidden = true; form.reset(); $$('.is-bad', form).forEach(f => f.classList.remove('is-bad'));
    setAct(b.dataset.reserve); openDialog(rs); setTimeout(() => $('#rs-name', rs).focus(), 80);
  }));
  form.addEventListener('submit', ev => {
    ev.preventDefault();
    if (!validate(form)) return;
    const d = new FormData(form);
    const act = sel.selectedOptions[0].textContent;
    done.innerHTML = `<img src="${$('#rs-dino', rs).src}" alt=""><h3>Resumen de tu reserva</h3>
      <p>Gracias, ${esc(d.get('nombre').split(' ')[0])}. Estos son los datos que has rellenado.</p>
      <ul class="summary"><li><span>Actividad</span><b>${esc(act)}</b></li><li><span>Peques</span><b>${esc(d.get('peques'))}, ${esc(d.get('edades'))}</b></li><li><span>Correo</span><b>${esc(d.get('email'))}</b></li></ul>
      <p class="note">Esto es un prototipo académico, así que la reserva no se ha enviado y no recibirás ningún correo. En la web definitiva, este paso la mandaría a Trogloditas.</p>
      <button class="btn" type="button" data-close>Volver a la web</button>`;
    form.hidden = true; done.hidden = false; done.focus();
  });
}

/* ---------- carta (lightbox) ---------- */
const carta = $('#carta');
if (carta) {
  const rail = $('.carta__rail', carta);
  $$('[data-carta]').forEach(b => b.addEventListener('click', () => openDialog(carta)));
  const go = dir => rail.scrollBy({ left: dir * rail.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
  $('[data-carta-prev]', carta).addEventListener('click', () => go(-1));
  $('[data-carta-next]', carta).addEventListener('click', () => go(1));
  rail.addEventListener('keydown', ev => { if (ev.key === 'ArrowRight') go(1); if (ev.key === 'ArrowLeft') go(-1); });
}

/* ---------- zonas de la cueva (pestañas) ---------- */
const tabs = $$('.zone[role=tab]');
if (tabs.length) {
  const show = t => {
    tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on; });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => show(t));
    t.addEventListener('keydown', ev => {
      const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[ev.key];
      if (k) { ev.preventDefault(); const n = tabs[(i + k + tabs.length) % tabs.length]; n.focus(); show(n); }
    });
  });
}

/* ---------- calendario: resaltar actividad ---------- */
$$('.cal__c.is-ev').forEach(a => a.addEventListener('click', () => {
  const t = $(a.getAttribute('href')); if (!t) return;
  t.classList.remove('is-flash'); void t.offsetWidth; t.classList.add('is-flash');
}));

/* ---------- carril de productos con flechas ---------- */
$$('.shelf__rail').forEach(r => r.addEventListener('keydown', ev => {
  if (ev.key === 'ArrowRight') r.scrollBy({ left: 300, behavior: 'smooth' });
  if (ev.key === 'ArrowLeft') r.scrollBy({ left: -300, behavior: 'smooth' });
}));
}
