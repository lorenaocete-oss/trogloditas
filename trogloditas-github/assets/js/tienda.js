/* Trogloditas · catálogo y fichas de producto */
{
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const P = window.PRODUCTS || [];
const T = window.Trog;
const A = window.TROG_A || '';
const dlg = $('#pdp');
const eur = v => v.toFixed(2).replace('.', ',') + ' €';
const state = { p: null, img: 0, model: null, size: null, qty: 1 };

/* filtros */
$$('.chip').forEach(c => c.addEventListener('click', () => {
  $$('.chip').forEach(x => x.setAttribute('aria-pressed', x === c));
  const f = c.dataset.filter;
  $$('.pc').forEach(card => {
    const show = f === 'todo' || card.dataset.cat === f;
    card.classList.toggle('is-hidden', !show);
  });
}));

/* ficha */
const els = {
  img: $('#pdp-img'), thumbs: $('#pdp-thumbs'), cat: $('#pdp-cat'), name: $('#pdp-name'), price: $('#pdp-price'),
  desc: $('#pdp-desc'), facts: $('#pdp-facts'), opts: $('#pdp-opts'), qty: $('#pdp-qty'), total: $('#pdp-total'),
  view: $('#pdp-view'), form: $('#pdp-form'), done: $('#pdp-done'), sum: $('#pdp-sum'), rq: $('#req-form')
};

const gallery = p => p.models ? p.models.map(m => ({ src: `${A}assets/img/${m.img}.webp`, alt: m.alt, mini: `${A}assets/img/${m.img}-mini.webp`, model: m.id }))
  : p.imgs.map((src, i) => ({ src: A + src, alt: p.alts[i] || p.name, mini: A + src }));

const setImg = (src, alt) => {
  els.img.classList.remove('is-swap'); void els.img.offsetWidth;
  els.img.src = src; els.img.alt = alt; els.img.classList.add('is-swap');
};

const renderThumbs = () => {
  const g = gallery(state.p);
  if (state.p.models) { els.thumbs.innerHTML = ''; els.thumbs.hidden = true; return; }
  els.thumbs.hidden = g.length < 2;
  els.thumbs.innerHTML = g.map((x, i) => `<button type="button" aria-label="Ver foto ${i + 1}: ${T.esc(x.alt)}" aria-pressed="${i === state.img}"><img src="${x.mini}" alt=""></button>`).join('');
  $$('button', els.thumbs).forEach((b, i) => b.addEventListener('click', () => {
    state.img = i; setImg(g[i].src, g[i].alt);
    $$('button', els.thumbs).forEach((x, j) => x.setAttribute('aria-pressed', j === i));
  }));
};

const renderOpts = () => {
  const p = state.p;
  if (p.models) {
    els.opts.hidden = false;
    els.opts.innerHTML = `<legend>Modelo: <b id="opt-label">${p.models.find(m => m.id === state.model).name}</b></legend><div class="swatches">` +
      p.models.map(m => `<label class="sw"><input type="radio" name="model" value="${m.id}" ${m.id === state.model ? 'checked' : ''}><img src="${A}assets/img/${m.img}-mini.webp" alt=""><span>${m.name}</span></label>`).join('') + '</div>';
    $$('input', els.opts).forEach(r => r.addEventListener('change', () => {
      state.model = r.value; const m = p.models.find(x => x.id === r.value);
      setImg(`${A}assets/img/${m.img}.webp`, m.alt); $('#opt-label').textContent = m.name;
    }));
  } else if (p.sizes) {
    els.opts.hidden = false;
    els.opts.innerHTML = `<legend>Talla</legend><div class="sizes">` +
      p.sizes.map(s => `<label class="sz"><input type="radio" name="size" value="${s}" ${s === state.size ? 'checked' : ''}><span>${s}</span></label>`).join('') + '</div>';
    $$('input', els.opts).forEach(r => r.addEventListener('change', () => { state.size = r.value; }));
  } else if (p.unica) {
    els.opts.hidden = false;
    els.opts.innerHTML = `<legend>Talla</legend><p class="sz-unica">Talla única</p>`;
  } else { els.opts.hidden = true; els.opts.innerHTML = ''; }
};

const updTotal = () => { els.total.textContent = eur(state.p.price * state.qty); };

const open = (id, model) => {
  const p = P.find(x => x.id === id); if (!p) return;
  Object.assign(state, { p, img: 0, model: p.models ? (model || p.models[0].id) : null, size: p.sizes ? p.sizes[0] : null, qty: 1 });
  els.cat.textContent = p.catl; els.name.textContent = p.name; els.price.textContent = eur(p.price);
  els.desc.textContent = p.desc; els.facts.innerHTML = p.facts.map(f => `<li>${T.esc(f)}</li>`).join('');
  els.qty.value = 1; updTotal();
  const g = gallery(p); const first = p.models ? g.find(x => x.model === state.model) : g[0];
  els.img.src = first.src; els.img.alt = first.alt;
  dlg.classList.toggle('pdp--cut', !!p.cut);
  dlg.style.setProperty('--c', p.tint);
  renderThumbs(); renderOpts();
  els.view.hidden = false; els.form.hidden = true; els.done.hidden = true;
  if (!dlg.open) T.openDialog(dlg);
  if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
};

dlg.addEventListener('close', () => { if (location.hash) history.replaceState(null, '', location.pathname); });

/* cantidad */
const setQty = v => { state.qty = Math.min(10, Math.max(1, v | 0 || 1)); els.qty.value = state.qty; updTotal(); };
$$('[data-q]', dlg).forEach(b => b.addEventListener('click', () => setQty(state.qty + +b.dataset.q)));
els.qty.addEventListener('change', () => setQty(+els.qty.value));

/* solicitar */
const optText = () => state.p.models ? 'Modelo: ' + state.p.models.find(m => m.id === state.model).name : state.size ? 'Talla: ' + state.size : state.p.unica ? 'Talla única' : 'Sin opciones';
$('#pdp-req').addEventListener('click', () => {
  els.sum.innerHTML = `<li><span>Producto</span><b>${T.esc(state.p.name)}</b></li><li><span>Opción</span><b>${T.esc(optText())}</b></li><li><span>Cantidad</span><b>${state.qty}</b></li><li><span>Total aproximado</span><b>${eur(state.p.price * state.qty)}</b></li>`;
  els.view.hidden = true; els.form.hidden = false; els.rq.reset();
  $$('.is-bad', els.rq).forEach(f => f.classList.remove('is-bad'));
  setTimeout(() => $('#rq-name').focus(), 50);
});
$('#pdp-back').addEventListener('click', () => { els.form.hidden = true; els.view.hidden = false; });
els.rq.addEventListener('submit', ev => {
  ev.preventDefault();
  if (!T.validate(els.rq)) return;
  const d = new FormData(els.rq);
  els.done.innerHTML = `<img src="${A}assets/svg/dino-amarillo.svg" alt=""><h3>Resumen de tu solicitud</h3>
    <p>Gracias, ${T.esc(d.get('nombre').split(' ')[0])}. Estos son los datos de tu pedido.</p>
    <ul class="summary">${els.sum.innerHTML}</ul>
    <p class="note">Esto es un prototipo académico, así que la solicitud no se ha enviado y no se ha cobrado nada. En la web definitiva, este paso la mandaría a la tienda para comprobar si hay existencias.</p>
    <button class="btn" type="button" data-close>Seguir mirando</button>`;
  els.form.hidden = true; els.done.hidden = false;
});

/* enlaces y hash */
$$('.pc').forEach(a => a.addEventListener('click', ev => { ev.preventDefault(); open(a.getAttribute('href').slice(1)); }));
const fromHash = () => { const id = location.hash.slice(1); if (id && P.some(p => p.id === id)) open(id); };
addEventListener('hashchange', fromHash);
setTimeout(fromHash, 500);
}
