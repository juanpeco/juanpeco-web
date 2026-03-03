(function(){
  // year
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = String(new Date().getFullYear());

  // mobile nav
  const toggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('navList');
  if(toggle && navList){
    toggle.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    navList.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navList.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
    }));
    document.addEventListener('click', (e) => {
      const t = e.target;
      if(!t) return;
      const inside = navList.contains(t) || toggle.contains(t);
      if(!inside){
        navList.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
      }
    });
  }

  // reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, {threshold:0.12});
  revealEls.forEach(el => revealObs.observe(el));

  // scrollspy
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navLinks = Array.from(document.querySelectorAll('.nav-link')).filter(l => (l.getAttribute('href')||'').startsWith('#'));
  const spyObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(!entry.isIntersecting) return;
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
    });
  }, {rootMargin:'-35% 0px -60% 0px', threshold:0.01});
  sections.forEach(s => spyObs.observe(s));

  // helpers
  const eur = (n) => {
    if(!Number.isFinite(n)) return '—';
    try{
      return new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(n);
    } catch {
      return `${n.toFixed(2)} €`;
    }
  };
  const pct = (n) => Number.isFinite(n) ? `${n.toFixed(2)}%` : '—';

  function show(el, html){
    if(!el) return;
    el.classList.remove('hidden');
    el.innerHTML = html;
  }
  function hide(el){
    if(!el) return;
    el.classList.add('hidden');
    el.innerHTML = '';
  }
  function esc(s){
    return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  }

  // quiz
  const quizForm = document.getElementById('quizForm');
  const quizFeedback = document.getElementById('quizFeedback');
  const quizReset = document.getElementById('quizReset');
  const quizAnswers = {
    q1:{correct:'b', why:'PIB: valor total de bienes y servicios finales producidos en un país (en un periodo).'},
    q2:{correct:'a', why:'Ley de la demanda: precio ↑ → cantidad demandada ↓ (ceteris paribus).'},
    q3:{correct:'b', why:'ROI: rentabilidad de una inversión (ganancia respecto a lo invertido).'},
    q4:{correct:'b', why:'Punto de equilibrio: ingresos = costes (beneficio 0).'},
    q5:{correct:'b', why:'DAFO: Debilidades, Amenazas, Fortalezas y Oportunidades.'}
  };

  if(quizForm && quizFeedback){
    quizForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(quizForm);
      let score = 0;
      const details = [];

      Object.keys(quizAnswers).forEach((k, i) => {
        const user = data.get(k);
        const {correct, why} = quizAnswers[k];
        const ok = user === correct;
        if(ok) score++;
        details.push(`<div style="display:grid;gap:4px;"><strong>${i+1}) ${ok ? '✅ Correcto' : '❌ A mejorar'}</strong><div class="muted">${esc(why)}</div></div>`);
      });

      const percent = Math.round((score/5)*100);
      const headline =
        percent === 100 ? 'Perfecto.' :
        percent >= 80 ? 'Muy bien.' :
        percent >= 60 ? 'Bien, con margen.' :
        'Vamos a afinarlo.';

      show(quizFeedback, `<div><strong>${headline}</strong> Puntuación: ${score}/5 (${percent}%)</div><div style="margin-top:10px;display:grid;gap:10px;">${details.join('')}</div>`);
    });

    if(quizReset){
      quizReset.addEventListener('click', () => {
        quizForm.reset();
        hide(quizFeedback);
      });
    }
  }

  // budget sim
  const budgetInput = document.getElementById('budgetInput');
  const goalSelect = document.getElementById('goalSelect');
  const simRun = document.getElementById('simRun');
  const simFeedback = document.getElementById('simFeedback');

  function budgetRec(b, goal){
    const packs = {
      ventas:{title:'Estrategia: crecimiento de ventas', split:[['Captación (ads / RRSS)',0.45],['Mejora de oferta',0.30],['Fidelización (CRM simple)',0.25]], why:'Prioriza adquisición medible y seguimiento por KPI.'},
      costes:{title:'Estrategia: eficiencia y costes', split:[['Auditoría de procesos',0.35],['Automatización (plantillas)',0.40],['Formación interna',0.25]], why:'Estandariza para reducir errores y tiempos.'},
      marca:{title:'Estrategia: marca coherente', split:[['Mensajes y guía',0.35],['Contenido y calendario',0.40],['Experiencia cliente',0.25]], why:'Construcción por consistencia, no por acciones sueltas.'},
      digital:{title:'Estrategia: digitalización práctica', split:[['Herramientas',0.40],['Datos y KPI',0.35],['Protocolos',0.25]], why:'Orden primero, automatización después.'}
    };
    const p = packs[goal] || packs.ventas;
    const rows = p.split.map(([label, w]) => `<li style="display:flex;justify-content:space-between;gap:12px;"><span>${esc(label)}</span><strong>${eur(b*w)}</strong></li>`).join('');
    return `<div><strong>${esc(p.title)}</strong></div>
      <p><strong>Presupuesto:</strong> ${eur(b)}</p>
      <p class="muted">${esc(p.why)}</p>
      <div style="margin-top:10px;border:1px solid rgba(15,23,42,.10);border-radius:16px;padding:12px;background:rgba(15,23,42,.02);">
        <p style="margin:0 0 8px;"><strong>Reparto orientativo</strong> (didáctico):</p>
        <ul style="margin:0;padding-left:18px;display:grid;gap:6px;">${rows}</ul>
      </div>
      <p class="muted small" style="margin-top:10px;">Siguiente paso: define 2–3 KPI (ej.: coste por lead, margen, conversión) y revisa semanalmente.</p>`;
  }

  if(simRun && simFeedback){
    simRun.addEventListener('click', () => {
      const b = Number(budgetInput?.value || 0);
      if(!Number.isFinite(b) || b <= 0){
        show(simFeedback, `<strong>Introduce un presupuesto válido.</strong> Ej.: 50000`);
        return;
      }
      const goal = goalSelect?.value || 'ventas';
      show(simFeedback, budgetRec(b, goal));
    });
  }

  // ROI
  const roiInv = document.getElementById('roiInv');
  const roiGain = document.getElementById('roiGain');
  const roiCalc = document.getElementById('roiCalc');
  const roiOut = document.getElementById('roiOut');
  if(roiCalc && roiOut){
    roiCalc.addEventListener('click', () => {
      const inv = Number(roiInv?.value || 0);
      const gain = Number(roiGain?.value || 0);
      if(!Number.isFinite(inv) || inv <= 0){
        show(roiOut, `<strong>La inversión debe ser &gt; 0.</strong>`);
        return;
      }
      const r = (gain / inv) * 100;
      show(roiOut, `<div><strong>ROI:</strong> ${pct(r)}</div><div class="muted small">Interpretación: por cada ${eur(inv)} invertidos, la ganancia neta es ${eur(gain)}.</div>`);
    });
  }

  // Break-even
  const beFixed = document.getElementById('beFixed');
  const bePrice = document.getElementById('bePrice');
  const beCost = document.getElementById('beCost');
  const beCalc = document.getElementById('beCalc');
  const beOut = document.getElementById('beOut');
  if(beCalc && beOut){
    beCalc.addEventListener('click', () => {
      const fixed = Number(beFixed?.value || 0);
      const price = Number(bePrice?.value || 0);
      const cost = Number(beCost?.value || 0);
      const margin = price - cost;
      if(!Number.isFinite(fixed) || fixed < 0 || !Number.isFinite(price) || price <= 0 || !Number.isFinite(cost) || cost < 0){
        show(beOut, `<strong>Revisa los valores.</strong>`);
        return;
      }
      if(margin <= 0){
        show(beOut, `<strong>El margen unitario debe ser &gt; 0.</strong> (precio debe ser mayor que coste unitario)`);
        return;
      }
      const units = fixed / margin;
      show(beOut, `<div><strong>Punto de equilibrio:</strong> ${units.toFixed(2)} unidades</div><div class="muted small">Margen unitario: ${eur(margin)} · Ingresos necesarios: ${eur(units * price)}</div>`);
    });
  }

  // Margins
  const mCost = document.getElementById('mCost');
  const mSell = document.getElementById('mSell');
  const mCalc = document.getElementById('mCalc');
  const mOut = document.getElementById('mOut');
  if(mCalc && mOut){
    mCalc.addEventListener('click', () => {
      const c = Number(mCost?.value || 0);
      const s = Number(mSell?.value || 0);
      if(!Number.isFinite(c) || c < 0 || !Number.isFinite(s) || s <= 0){
        show(mOut, `<strong>Revisa los valores.</strong>`);
        return;
      }
      const m = s - c;
      const mp = (m / s) * 100;
      show(mOut, `<div><strong>Margen:</strong> ${eur(m)} · <strong>% margen:</strong> ${pct(mp)}</div><div class="muted small">Si el coste es ${eur(c)} y vendes a ${eur(s)}, tu margen unitario es ${eur(m)}.</div>`);
    });
  }

  // Invoice
  const invConcept = document.getElementById('invConcept');
  const invBase = document.getElementById('invBase');
  const invIva = document.getElementById('invIva');
  const invGen = document.getElementById('invGen');
  const invOut = document.getElementById('invOut');
  if(invGen && invOut){
    invGen.addEventListener('click', () => {
      const concept = (invConcept?.value || '').trim() || 'Concepto';
      const base = Number(invBase?.value || 0);
      if(!Number.isFinite(base) || base <= 0){
        show(invOut, `<strong>Introduce un importe base válido.</strong>`);
        return;
      }
      const ivaRate = invIva?.checked ? 0.21 : 0.0;
      const iva = base * ivaRate;
      const total = base + iva;
      const now = new Date();
      const num = `JP-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
      show(invOut, `<div style="display:grid;gap:6px;">
        <div><strong>Factura:</strong> ${esc(num)}</div>
        <div><strong>Concepto:</strong> ${esc(concept)}</div>
        <div><strong>Base:</strong> ${eur(base)}</div>
        <div><strong>IVA:</strong> ${eur(iva)} ${ivaRate ? '<span class="muted">(21%)</span>' : '<span class="muted">(0%)</span>'}</div>
        <div><strong>Total:</strong> ${eur(total)}</div>
        <div class="muted small">Uso didáctico: añade emisor/receptor y condiciones si lo necesitas.</div>
      </div>`);
    });
  }

  // Trends (editable static list)
  const trendShow = document.getElementById('trendShow');
  const trendOut = document.getElementById('trendOut');
  if(trendShow && trendOut){
    trendShow.addEventListener('click', () => {
      const items = [
        'IA generativa aplicada a procesos (con verificación y ética)',
        'Automatización ligera (plantillas, flujos y checklists)',
        'Data literacy: KPI, cuadros de mando y decisiones',
        'Ciberseguridad básica y privacidad en entornos educativos',
        'Sostenibilidad y eficiencia (costes, energía, cadena de suministro)',
        'Experiencia de cliente y marca local con canales digitales'
      ];
      show(trendOut, `<div><strong>Tendencias (lista rápida)</strong></div><ul style="margin:8px 0 0;padding-left:18px;display:grid;gap:6px;">${items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>`);
    });
  }

  // DAFO heuristic generator
  const dafoText = document.getElementById('dafoText');
  const dafoGen = document.getElementById('dafoGen');
  const dafoOut = document.getElementById('dafoOut');
  if(dafoGen && dafoOut){
    dafoGen.addEventListener('click', () => {
      const t = (dafoText?.value || '').trim();
      if(t.length < 10){
        show(dafoOut, `<strong>Escribe una descripción un poco más concreta.</strong>`);
        return;
      }
      // Simple, reusable template (not pretending to be "smart")
      const fort = ['Propuesta de valor clara', 'Ubicación/segmento definido', 'Capacidad de diferenciarse con servicio'];
      const deb = ['Dependencia de un canal', 'Procesos no estandarizados', 'Márgenes ajustados si no se controla el coste'];
      const op  = ['Colaboraciones locales', 'Digitalización de captación/fidelización', 'Nuevas tendencias de consumo/experiencia'];
      const ame = ['Competencia intensa', 'Subida de costes (energía/proveedores)', 'Cambios en demanda estacional'];

      show(dafoOut, `<div><strong>DAFO (borrador)</strong></div>
        <p class="muted small">Basado en tu descripción (revisa y concreta con evidencia):</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">
          <div style="border:1px solid rgba(15,23,42,.10);border-radius:16px;padding:12px;background:rgba(15,23,42,.02);">
            <strong>Fortalezas</strong>
            <ul style="margin:8px 0 0;padding-left:18px;display:grid;gap:6px;">${fort.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
          </div>
          <div style="border:1px solid rgba(15,23,42,.10);border-radius:16px;padding:12px;background:rgba(15,23,42,.02);">
            <strong>Debilidades</strong>
            <ul style="margin:8px 0 0;padding-left:18px;display:grid;gap:6px;">${deb.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
          </div>
          <div style="border:1px solid rgba(15,23,42,.10);border-radius:16px;padding:12px;background:rgba(15,23,42,.02);">
            <strong>Oportunidades</strong>
            <ul style="margin:8px 0 0;padding-left:18px;display:grid;gap:6px;">${op.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
          </div>
          <div style="border:1px solid rgba(15,23,42,.10);border-radius:16px;padding:12px;background:rgba(15,23,42,.02);">
            <strong>Amenazas</strong>
            <ul style="margin:8px 0 0;padding-left:18px;display:grid;gap:6px;">${ame.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
          </div>
        </div>
        <div style="margin-top:10px;">
          <strong>Tu texto:</strong>
          <div class="muted" style="margin-top:6px;">${esc(t)}</div>
        </div>
      `);
    });
  }

  // copy with toast
  const toast = document.getElementById('toast');
  let toastTimer = null;
  function showToast(msg='Copiado'){
    if(!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    toast.setAttribute('aria-hidden','false');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>{
      toast.classList.remove('show');
      toast.setAttribute('aria-hidden','true');
    }, 1400);
  }
  async function copyText(text){
    try{
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    }
  }

  if(promptCopy){
    promptCopy.addEventListener('click', async () => {
      const ok = await copyText(promptView.textContent || '');
      showToast(ok ? 'Prompt copiado' : 'No se pudo copiar');
    });
  }

  const copyEmailBtn = document.getElementById('copyEmail');
  if(copyEmailBtn){
    copyEmailBtn.addEventListener('click', async () => {
      const email = copyEmailBtn.getAttribute('data-copy') || '';
      const ok = await copyText(email);
      showToast(ok ? 'Email copiado' : 'No se pudo copiar');
    });
  }

  // ---- PROMPT BANK (JSON: 50 categorías / 500 prompts) ----
  async function initPromptBank(){
    const elCat = document.getElementById('promptCategory');
    const elSel = document.getElementById('promptSelect');
    const elView = document.getElementById('promptView');
    const elCopy = document.getElementById('promptCopy');
    const elRandom = document.getElementById('promptRandom');
    const elSearch = document.getElementById('promptSearch');
    const elCount = document.getElementById('promptCount');

    if(!elCat || !elSel || !elView) return;

    let data;
    try{
      const res = await fetch('./data/prompts.json', { cache: 'no-store' });
      if(!res.ok) throw new Error('No se pudo cargar prompts.json');
      data = await res.json();
    }catch(e){
      elView.textContent = 'Error cargando /data/prompts.json. Revisa que exista y que sea JSON válido.';
      return;
    }

    const categories = Object.keys(data).sort((a,b)=>a.localeCompare(b,'es'));
    const flat = [];
    for(const c of categories){
      const arr = Array.isArray(data[c]) ? data[c] : [];
      for(const p of arr){
        if(!p) continue;
        flat.push({
          category: c,
          title: String(p.title || 'Sin título'),
          text: String(p.text || '')
        });
      }
    }

    function escapeHtml(s){
      return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
    }

    function promptsFor(category, query){
      const q = (query || '').trim().toLowerCase();
      const list = flat.filter(p => p.category === category);
      if(!q) return list;
      return list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.text.toLowerCase().includes(q)
      );
    }

    function currentList(){
      return promptsFor(elCat.value, elSearch ? elSearch.value : '');
    }

    function renderCategories(){
      elCat.innerHTML = categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
    }

    function renderPrompts(list){
      elSel.innerHTML = list.map((p, i) => `<option value="${i}">${escapeHtml(p.title)}</option>`).join('');
      if(list.length){
        elView.textContent = list[0].text;
        if(elCount) elCount.textContent = `${list.length} prompts en esta categoría (filtrados).`;
      }else{
        elView.textContent = 'No hay resultados con ese filtro.';
        if(elCount) elCount.textContent = '0 resultados.';
      }
    }

    function setViewFromIndex(i){
      const list = currentList();
      const item = list[i];
      elView.textContent = item ? item.text : 'Selecciona un prompt para ver su contenido';
    }

    renderCategories();
    renderPrompts(currentList());

    elCat.addEventListener('change', () => renderPrompts(currentList()));
    elSel.addEventListener('change', () => setViewFromIndex(Number(elSel.value)));
    if(elSearch){
      elSearch.addEventListener('input', () => renderPrompts(currentList()));
    }
    if(elRandom){
      elRandom.addEventListener('click', () => {
        const list = currentList();
        if(!list.length) return;
        const i = Math.floor(Math.random() * list.length);
        elSel.value = String(i);
        setViewFromIndex(i);
      });
    }
    if(elCopy){
      elCopy.addEventListener('click', async () => {
        const ok = await copyText(elView.textContent || '');
        showToast(ok ? 'Prompt copiado' : 'No se pudo copiar');
      });
    }
  }
  initPromptBank();

})();