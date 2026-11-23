/* ATRICL load / cable / MCB calculator UI (EN + HI). Needs assets/load-calc-core.js.
   "Add to enquiry" uses window.atriclEnquiry from assets/cart.js when present;
   otherwise it writes the same localStorage list (atricl_enquiry_v1) so the item
   shows up when the visitor opens the enquiry cart. */
(function () {
  'use strict';
  var C = window.ATRICLCalc; if (!C) return;
  var root = document.querySelector('[data-load-calc]'); if (!root) return;
  var hi = (document.documentElement.lang || '').indexOf('hi') === 0;
  var KEY = 'atricl_enquiry_v1';
  var T = hi ? {
    ib: 'डिज़ाइन करंट (Ib)', brk: 'सुझाई गई MCB / MCCB रेटिंग', cab: 'केबल साइज़ (अनुमानित)', vd: 'वोल्टेज ड्रॉप',
    mcb: 'MCB', both: 'MCB या MCCB', mccb: 'MCCB', beyondBrk: '800 A से ज़्यादा — ACB / पैनल डिज़ाइन के लिए इंजीनियर से सलाह लें।',
    need: function (ib, n) { return 'Ib × 1.25 = ' + n + ' A, इसके ऊपर की अगली स्टैंडर्ड रेटिंग'; },
    approx: function (kw, v, ph, pf) { return '≈ ' + kw + ' kW · ' + v + ' V · ' + (ph === 3 ? '3-फ़ेज़' : '1-फ़ेज़') + ' · pf ' + pf; },
    cu: 'कॉपर', al: 'एल्युमिनियम', mm: 'mm²',
    cabNote: function (r, f, inst, amb) { return 'मल्टीकोर PVC केबल, ' + (inst === 'air' ? 'हवा में / ट्रे पर' : 'कंड्यूट में / बंद') + ', ' + amb + ' °C (फ़ैक्टर ' + f + ')। सबसे छोटे साइज़ की डिरेटेड क्षमता ≈ ' + r + ' A।'; },
    beyondCab: '185–240 mm² से बड़ी केबल या पैरेलल रन चाहिए — साइट डिज़ाइन ज़रूरी है।',
    vdLine: function (p, v, len, s) { return p + ' % (' + v + ' V) — ' + len + ' मीटर, ' + s + ' mm² पर'; },
    vdOk: 'आम तौर पर 3–5 % तक ठीक माना जाता है।', vdHigh: function (s) { return 'ड्रॉप ज़्यादा है। 5 % के अंदर रखने के लिए लगभग ' + (s ? s + ' mm²' : 'और बड़ी केबल / पैरेलल रन') + ' देखें।'; },
    vdNone: 'वोल्टेज ड्रॉप देखने के लिए केबल की लंबाई डालें।',
    errValue: 'कृपया 0 से ज़्यादा लोड लिखें।', errPf: 'पावर फ़ैक्टर 0.1 से 1 के बीच होना चाहिए।', errLen: 'लंबाई 1 से 2000 मीटर के बीच लिखें, या खाली छोड़ें।',
    add: 'यह ज़रूरत इन्क्वायरी में जोड़ें', added: 'इन्क्वायरी लिस्ट में जुड़ गया।', view: 'इन्क्वायरी कार्ट देखें',
    itemName: function (r) { return 'कैलकुलेटर से ज़रूरत: ' + brkText(r) + (r.cable && !r.cable.beyond ? ' + ' + matName(r.material) + ' केबल ' + r.cable.min + '–' + r.cable.max + ' mm²' : ''); },
    brand: 'ब्रांड बाद में तय (ऑथराइज़्ड ब्रांड)', family: 'लोड / केबल / MCB कैलकुलेटर',
    note: function (r) { return r.kwR + ' kW, ' + (r.phase === 3 ? '3-फ़ेज़ 415 V' : '1-फ़ेज़ 230 V') + ', pf ' + r.pf + ', Ib ' + r.ibR + ' A' + (r.length ? ', ' + r.length + ' मी' : '') + ' — अनुमानित, इलेक्ट्रीशियन से जाँच ज़रूरी'; }
  } : {
    ib: 'Design current (Ib)', brk: 'Suggested MCB / MCCB rating', cab: 'Cable size band (indicative)', vd: 'Voltage drop',
    mcb: 'MCB', both: 'MCB or MCCB', mccb: 'MCCB', beyondBrk: 'Above 800 A: needs an ACB / panel design by an engineer.',
    need: function (ib, n) { return 'Next standard rating above Ib × 1.25 = ' + n + ' A'; },
    approx: function (kw, v, ph, pf) { return '≈ ' + kw + ' kW · ' + v + ' V · ' + (ph === 3 ? '3-phase' : '1-phase') + ' · pf ' + pf; },
    cu: 'Copper', al: 'Aluminium', mm: 'mm²',
    cabNote: function (r, f, inst, amb) { return 'Multicore PVC cable, ' + (inst === 'air' ? 'in air / on tray' : 'in conduit / enclosed') + ', ' + amb + ' °C (factor ' + f + '). Smallest size derated ≈ ' + r + ' A.'; },
    beyondCab: 'Needs cable larger than the 185–240 mm² range, or parallel runs: get a site design.',
    vdLine: function (p, v, len, s) { return p + ' % (' + v + ' V) over ' + len + ' m on ' + s + ' mm²'; },
    vdOk: 'Common practice keeps drop within about 3–5 %.', vdHigh: function (s) { return 'Drop is high. To stay within 5 %, look at about ' + (s ? s + ' mm²' : 'a bigger cable or parallel runs') + '.'; },
    vdNone: 'Enter a cable length to see the voltage drop.',
    errValue: 'Please enter a load greater than 0.', errPf: 'Power factor must be between 0.1 and 1.', errLen: 'Enter a length from 1 to 2000 m, or leave it empty.',
    add: 'Add this requirement to enquiry', added: 'Added to your enquiry list.', view: 'View enquiry cart',
    itemName: function (r) { return 'Calculated requirement: ' + brkText(r) + (r.cable && !r.cable.beyond ? ' + ' + matName(r.material) + ' cable ' + r.cable.min + '–' + r.cable.max + ' mm²' : ''); },
    brand: 'Brand to be advised (authorised brands)', family: 'Load / cable / MCB calculator',
    note: function (r) { return r.kwR + ' kW, ' + (r.phase === 3 ? '3-phase 415 V' : '1-phase 230 V') + ', pf ' + r.pf + ', Ib ' + r.ibR + ' A' + (r.length ? ', ' + r.length + ' m' : '') + ' (indicative, to be checked by an electrician)'; }
  };
  function $(id) { return document.getElementById(id); }
  function val(name) { var el = root.querySelector('[name="' + name + '"]:checked') || root.querySelector('[name="' + name + '"]'); return el ? el.value : ''; }
  function fmt(n, d) { return C.round(n, d).toLocaleString(hi ? 'hi-IN' : 'en-IN', { maximumFractionDigits: d }); }
  function matName(m) { return m === 'al' ? T.al : T.cu; }
  function devName(d) { return d === 'mcb' ? T.mcb : d === 'mccb' ? T.mccb : T.both; }
  function brkText(r) { return r.breaker.beyond ? '> 800 A' : devName(r.breaker.device) + ' ' + r.breaker.min + '–' + r.breaker.max + ' A'; }
  function track(name, p) { if (typeof window.gtag === 'function') { try { window.gtag('event', name, p); } catch (e) {} } }

  var pfEl = $('lc-pf'), loadEl = $('lc-load'), out = $('lc-result'), err = $('lc-error'), addBtn = $('lc-add'), addMsg = $('lc-added');
  var pfTouched = false, last = null;
  function syncPf() {
    if (pfTouched && loadEl.value === 'custom') return;
    var lt = loadEl.value;
    if (lt === 'motor') pfEl.value = '0.8';
    else if (lt === 'resistive') pfEl.value = '1';
    pfEl.readOnly = lt !== 'custom';
  }
  function autoLoadType() { /* 3-phase defaults to motor (pf 0.8), 1-phase to resistive (pf 1) until the user picks */
    if (loadEl.getAttribute('data-touched')) return;
    loadEl.value = val('phase') === '3' ? 'motor' : 'resistive'; syncPf();
  }
  function setUnit() { $('lc-unit').textContent = val('mode') === 'amps' ? 'A' : 'kW'; }

  function run(fromSubmit) {
    var r = C.calculate({ mode: val('mode'), value: $('lc-value').value, phase: parseInt(val('phase'), 10), pf: pfEl.value,
      material: val('material'), install: val('install'), ambient: parseInt(val('ambient'), 10), length: $('lc-length').value.trim() });
    ['lc-value', 'lc-pf', 'lc-length'].forEach(function (id) { $(id).removeAttribute('aria-invalid'); });
    if (!r.ok) {
      var map = { value: ['lc-value', T.errValue], pf: ['lc-pf', T.errPf], length: ['lc-length', T.errLen] }, first = map[r.errors[0]];
      r.errors.forEach(function (e) { $(map[e][0]).setAttribute('aria-invalid', 'true'); });
      if (fromSubmit) { err.textContent = first[1]; $(first[0]).focus(); }
      out.hidden = true; addBtn.disabled = true; last = null; return;
    }
    err.textContent = '';
    r.kwR = fmt(r.kw, 2); r.ibR = fmt(r.ib, 1);
    var rows = [];
    rows.push(['ib', T.ib, r.ibR + ' A', T.approx(r.kwR, r.volts, r.phase, fmt(r.pf, 2))]);
    if (r.breaker.beyond) rows.push(['brk', T.brk, '—', T.beyondBrk]);
    else rows.push(['brk', T.brk, devName(r.breaker.device) + ' ' + r.breaker.min + '–' + r.breaker.max + ' A', T.need(r.ib, fmt(r.breaker.need, 1))]);
    if (r.cable) {
      if (r.cable.beyond) rows.push(['cab', T.cab, '—', T.beyondCab]);
      else rows.push(['cab', T.cab, matName(r.material) + ' ' + r.cable.min + '–' + r.cable.max + ' ' + T.mm, T.cabNote(fmt(r.cable.rating, 1), r.cable.factor, val('install'), val('ambient'))]);
    }
    if (r.drop) {
      var high = r.drop.percent > 5;
      rows.push(['vd', T.vd, fmt(r.drop.percent, 2) + ' %', T.vdLine(fmt(r.drop.percent, 2), fmt(r.drop.volts, 1), r.length, r.cable.min) + (hi ? '। ' : '. ') + (high ? T.vdHigh(r.sizeFor5pc) : T.vdOk), high]);
    } else if (!r.length) rows.push(['vd', T.vd, '—', T.vdNone]);
    out.innerHTML = rows.map(function (x) {
      return '<div class="lc-row' + (x[4] ? ' lc-row--warn' : '') + '" data-k="' + x[0] + '"><dt>' + x[1] + '</dt><dd><strong>' + x[2] + '</strong><span>' + x[3] + '</span></dd></div>';
    }).join('');
    out.hidden = false; addBtn.disabled = false; addMsg.innerHTML = ''; last = r;
    if (fromSubmit) track('tool_calculate', { tool: 'load_cable_mcb', phase: r.phase, mode: val('mode') });
  }

  function addToEnquiry() {
    if (!last) return;
    var it = { name: T.itemName(last), brand: T.brand, family: T.family, qty: 1, note: T.note(last), url: location.href.split('#')[0], rfq: false };
    var api = window.atriclEnquiry, cart = (hi ? '/hi/' : '/') + 'cart.html';
    if (api && typeof api.addItem === 'function') { api.addItem(it); cart = api.cartUrl || cart; }
    else { /* graceful fallback: same storage format as assets/cart.js */
      try {
        var items = JSON.parse(localStorage.getItem(KEY) || '[]'); if (!Array.isArray(items)) items = [];
        it.id = [it.brand, it.family, it.name].join('|').toLowerCase(); it.added = Date.now();
        var found = items.filter(function (x) { return x.id === it.id; })[0];
        if (found) found.qty = Math.min(99999, (parseInt(found.qty, 10) || 1) + 1); else items.push(it);
        localStorage.setItem(KEY, JSON.stringify(items));
      } catch (e) {}
      track('add_to_cart', { item_name: it.name, item_brand: it.brand });
    }
    addMsg.innerHTML = '✓ ' + T.added + ' <a href="' + cart + '">' + T.view + ' →</a>';
  }

  root.addEventListener('change', function (e) {
    var n = e.target.name;
    if (n === 'phase') autoLoadType();
    if (n === 'load') { loadEl.setAttribute('data-touched', '1'); pfTouched = false; syncPf(); }
    if (n === 'mode') setUnit();
    if (last || n !== 'value') run(false);
  });
  pfEl.addEventListener('input', function () { pfTouched = true; });
  root.addEventListener('input', function (e) { if (last && e.target.type !== 'radio') run(false); });
  $('lc-form').addEventListener('submit', function (e) { e.preventDefault(); run(true); });
  addBtn.addEventListener('click', addToEnquiry);
  autoLoadType(); setUnit();
})();
