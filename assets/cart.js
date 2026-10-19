/* ATRICL enquiry (quote) list. Client-side only (localStorage). No backend, no payments, no prices.
   Product pages: <div data-enq data-enq-name="Family" data-enq-brand="Brand" [data-enq-rfq]></div>
   The nearest preceding <ul> sibling (same family block) becomes the "range" picker. */
(function () {
  'use strict';
  var KEY = 'atricl_enquiry_v1', FORM_KEY = 'atricl_enquiry_contact_v1';
  var WA = '918873752101', MAIL = 'atricl001@gmail.com';
  var hi = (document.documentElement.lang || '').indexOf('hi') === 0;
  var T = hi ? {
    add: 'इन्क्वायरी में जोड़ें', addRfq: 'RFQ में जोड़ें', range: 'रेंज / आइटम', qty: 'मात्रा',
    any: ' — पूरी रेंज / बाद में बताऊँगा', added: 'लिस्ट में जुड़ गया।', view: 'इन्क्वायरी लिस्ट देखें',
    groupAria: function (n) { return n + ' को इन्क्वायरी लिस्ट में जोड़ें'; },
    badge: 'इन्क्वायरी', badgeAria: function (n) { return 'इन्क्वायरी लिस्ट, ' + n + ' आइटम'; },
    brand: 'ब्रांड', fam: 'रेंज', page: 'पेज देखें', note: 'स्पेसिफिकेशन नोट (चाहें तो)',
    notePh: 'रेटिंग / पोल / साइज़ / मॉडल', remove: 'हटाएँ', dec: 'मात्रा कम करें', inc: 'मात्रा बढ़ाएँ',
    rfqTag: 'RFQ', rfqNote: 'RFQ पर उपलब्ध — ATRICL, Siemens का ऑथराइज्ड पार्टनर नहीं है।',
    empty: 'आपकी लिस्ट अभी खाली है। किसी प्रोडक्ट पेज पर "इन्क्वायरी में जोड़ें" दबाकर आइटम जोड़ें।',
    browse: [['products.html', 'प्रोडक्ट'], ['products-switchgear.html', 'स्विचगियर'], ['products-lighting.html', 'लाइटिंग'], ['brands.html', 'ब्रांड']],
    errItems: 'लिस्ट में कम से कम एक आइटम जोड़ें।', errName: 'कृपया अपना नाम लिखें।',
    errPhone: 'कृपया सही 10 अंकों का मोबाइल नंबर लिखें।', errCity: 'कृपया शहर लिखें।',
    okWa: 'WhatsApp में आपका मैसेज तैयार है — वहाँ "भेजें" दबाएँ। हम कोटेशन के साथ जवाब देंगे।',
    okMail: 'आपके ईमेल ऐप में मैसेज तैयार है — वहाँ "भेजें" दबाएँ। हम कोटेशन के साथ जवाब देंगे।',
    confirmClear: 'पूरी इन्क्वायरी लिस्ट खाली कर दें?', cleared: 'लिस्ट खाली कर दी गई।',
    hello: 'नमस्ते ATRICL, मुझे इन आइटम का कोटेशन चाहिए:', items: 'आइटम', contact: 'संपर्क',
    lQty: 'मात्रा', lSpec: 'स्पेसिफिकेशन', lPage: 'पेज', lBrand: 'ब्रांड', lRange: 'रेंज',
    lName: 'नाम', lPhone: 'मोबाइल', lCompany: 'कंपनी', lCity: 'शहर', lDelivery: 'डिलीवरी की जगह', lMsg: 'संदेश',
    footer: 'atricl.com इन्क्वायरी लिस्ट से भेजा गया', subject: function (n, who) { return 'इन्क्वायरी: ' + n + ' आइटम — ' + who; },
    count: function (n) { return n + ' आइटम'; }
  } : {
    add: 'Add to enquiry', addRfq: 'Add to RFQ', range: 'Range / item', qty: 'Qty',
    any: ' — whole range / will specify', added: 'Added to your list.', view: 'View enquiry list',
    groupAria: function (n) { return 'Add ' + n + ' to enquiry list'; },
    badge: 'Enquiry', badgeAria: function (n) { return 'Enquiry list, ' + n + (n === 1 ? ' item' : ' items'); },
    brand: 'Brand', fam: 'Range', page: 'View page', note: 'Spec note (optional)',
    notePh: 'Rating / poles / size / model', remove: 'Remove', dec: 'Decrease quantity', inc: 'Increase quantity',
    rfqTag: 'RFQ', rfqNote: 'Available against RFQ — ATRICL is not an authorised Siemens partner.',
    empty: 'Your enquiry list is empty. Use "Add to enquiry" on any product page to add items.',
    browse: [['products.html', 'Products'], ['products-switchgear.html', 'Switchgear'], ['products-lighting.html', 'Lighting'], ['brands.html', 'Brands']],
    errItems: 'Add at least one item to your list.', errName: 'Please enter your name.',
    errPhone: 'Please enter a valid 10-digit mobile number.', errCity: 'Please enter your city.',
    okWa: 'Your message is ready in WhatsApp — tap Send there. We will reply with a quotation.',
    okMail: 'Your message is ready in your email app — press Send there. We will reply with a quotation.',
    confirmClear: 'Clear your whole enquiry list?', cleared: 'Your list has been cleared.',
    hello: 'Hello ATRICL, please quote for these items:', items: 'Items', contact: 'Contact',
    lQty: 'Qty', lSpec: 'Spec', lPage: 'Page', lBrand: 'Brand', lRange: 'Range',
    lName: 'Name', lPhone: 'Phone', lCompany: 'Company', lCity: 'City', lDelivery: 'Delivery location', lMsg: 'Message',
    footer: 'Sent from the atricl.com enquiry list', subject: function (n, who) { return 'Enquiry: ' + n + (n === 1 ? ' item' : ' items') + ' — ' + who; },
    count: function (n) { return n + (n === 1 ? ' item' : ' items'); }
  };
  var base = hi ? '/hi/' : '/';
  var ICON = {
    list: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M16 2H8a2 2 0 0 0-2 2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1a2 2 0 0 0-2-2zM8 4h8v2H8zM5 6h1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2h1v14H5zm2 5h2v2H7zm4 0h6v2h-6zm-4 4h2v2H7zm4 0h6v2h-6z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 3h6l1 2h4v2H4V5h4zm-3 6h12l-1 12H7zm4 2v8h2v-8zm4 0v8h2v-8z"/></svg>'
  };

  /* ---------- storage ---------- */
  var mem = null;
  function load() {
    try { var d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
    catch (e) { return mem || []; }
  }
  function save(items) {
    mem = items;
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
    updateBadges();
  }
  function clampQty(v) { v = parseInt(v, 10); if (!(v >= 1)) v = 1; if (v > 99999) v = 99999; return v; }
  function track(name, params) { if (typeof window.gtag === 'function') { try { window.gtag('event', name, params); } catch (e) {} } }
  function clean(s) { return (s || '').replace(/\s+/g, ' ').trim(); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pageUrl() { var c = document.querySelector('link[rel="canonical"]'); return c ? c.href : location.href.split('#')[0]; }

  function addItem(it) {
    var items = load(), id = [it.brand, it.family, it.name].join('|').toLowerCase(), found = null;
    for (var i = 0; i < items.length; i++) if (items[i].id === id) found = items[i];
    if (found) found.qty = clampQty(found.qty + it.qty);
    else { it.id = id; it.note = ''; it.added = Date.now(); items.push(it); }
    save(items);
    track('add_to_cart', { item_name: it.name, item_brand: it.brand, items: [{ item_name: it.name, item_brand: it.brand, item_category: it.family, quantity: it.qty }] });
    bump();
  }

  /* ---------- header badge ---------- */
  var badges = [];
  function makeBadge() {
    var nav = document.querySelector('nav');
    if (!nav) return;
    var row = nav.querySelector('.h-20') || nav.firstElementChild;
    var a = document.createElement('a');
    a.className = 'enq-badge';
    a.href = base + 'enquiry.html';
    a.innerHTML = ICON.list + '<span class="enq-badge__txt">' + T.badge + '</span><span class="enq-badge__n" aria-hidden="true" hidden>0</span>';
    if (/\/enquiry\.html$/.test(location.pathname)) a.setAttribute('aria-current', 'page');
    var btn = row && row.querySelector('#mobile-menu-button');
    if (btn) row.insertBefore(a, btn); else if (row) row.appendChild(a); else return;
    badges.push(a);
  }
  function updateBadges() {
    var n = load().length;
    badges.forEach(function (a) {
      var c = a.querySelector('.enq-badge__n');
      c.textContent = n > 99 ? '99+' : String(n); c.hidden = n === 0;
      a.setAttribute('aria-label', T.badgeAria(n));
    });
  }
  function bump() { badges.forEach(function (a) { a.classList.remove('enq-bump'); void a.offsetWidth; a.classList.add('enq-bump'); }); }

  /* ---------- add widgets on product pages ---------- */
  var uid = 0;
  function rangeOptions(slot) {
    var el = slot.previousElementSibling;
    while (el && !/^(H1|H2|H3|H4)$/.test(el.tagName) && !el.hasAttribute('data-enq')) {
      if (el.tagName === 'UL' || el.tagName === 'OL') {
        return Array.prototype.map.call(el.querySelectorAll(':scope > li'), function (li) { return clean(li.textContent); }).filter(Boolean);
      }
      el = el.previousElementSibling;
    }
    return [];
  }
  function initSlot(slot) {
    var family = clean(slot.getAttribute('data-enq-name')).replace(/^\d+\.\s*/, '');
    var brand = clean(slot.getAttribute('data-enq-brand'));
    var rfq = slot.hasAttribute('data-enq-rfq');
    var opts = rangeOptions(slot), id = 'enq' + (++uid);
    slot.className = 'enq-add not-prose' + (rfq ? ' enq-add--rfq' : '');
    slot.setAttribute('role', 'group');
    slot.setAttribute('aria-label', T.groupAria(family));
    var h = '';
    if (opts.length) {
      h += '<label class="enq-field enq-field--range" for="' + id + 'r"><span>' + T.range + '</span><select id="' + id + 'r"><option value="">' + esc(family + T.any) + '</option>';
      opts.forEach(function (o) { h += '<option>' + esc(o) + '</option>'; });
      h += '</select></label>';
    }
    h += '<label class="enq-field enq-field--qty" for="' + id + 'q"><span>' + T.qty + '</span><input id="' + id + 'q" type="number" inputmode="numeric" min="1" max="99999" step="1" value="1"></label>';
    h += '<button type="button" class="enq-btn">' + ICON.plus + '<span>' + (rfq ? T.addRfq : T.add) + '</span></button>';
    h += '<span class="enq-status" role="status" aria-live="polite"></span>';
    slot.innerHTML = h;
    var sel = slot.querySelector('select'), q = slot.querySelector('input'), st = slot.querySelector('.enq-status');
    slot.querySelector('button').addEventListener('click', function () {
      var choice = sel ? sel.value : '';
      var qty = clampQty(q.value); q.value = qty;
      addItem({ name: choice || family, family: family, brand: brand, rfq: rfq, qty: qty, url: pageUrl(), path: location.pathname });
      st.innerHTML = '✓ ' + T.added + ' <a href="' + base + 'enquiry.html">' + T.view + ' (' + T.count(load().length) + ')</a>';
    });
  }

  /* ---------- enquiry page ---------- */
  function initApp(app) {
    var list = document.getElementById('enq-items');
    var form = document.getElementById('enq-form');
    var err = document.getElementById('enq-error'), ok = document.getElementById('enq-ok');
    var summary = document.getElementById('enq-count');
    var fields = ['name', 'phone', 'company', 'city', 'delivery', 'message'];
    function f(n) { return document.getElementById('enq-' + n); }

    try { var saved = JSON.parse(sessionStorage.getItem(FORM_KEY) || '{}'); fields.forEach(function (n) { if (saved[n] && f(n) && !f(n).value) f(n).value = saved[n]; }); } catch (e) {}
    if (form) form.addEventListener('input', function () {
      var o = {}; fields.forEach(function (n) { if (f(n)) o[n] = f(n).value; });
      try { sessionStorage.setItem(FORM_KEY, JSON.stringify(o)); } catch (e) {}
    });

    function render() {
      var items = load();
      if (summary) summary.textContent = T.count(items.length);
      if (!items.length) {
        list.innerHTML = '<div class="enq-empty"><p style="margin:0 0 .5rem">' + T.empty + '</p><p style="margin:0">' +
          T.browse.map(function (b) { return '<a href="' + base + b[0] + '">' + b[1] + ' →</a>'; }).join(' · ') + '</p></div>';
        return;
      }
      var h = '<ul class="enq-list">';
      items.forEach(function (it, i) {
        var id = 'enqi' + i;
        h += '<li class="enq-item' + (it.rfq ? ' enq-item--rfq' : '') + '" data-i="' + i + '">' +
          '<div class="enq-item__head"><div><p class="enq-item__name" id="' + id + 'n">' + esc(it.name) + (it.rfq ? '<span class="enq-tag">' + T.rfqTag + '</span>' : '') + '</p>' +
          '<p class="enq-item__meta">' + T.brand + ': ' + esc(it.brand) + (it.family && it.family !== it.name ? ' · ' + T.fam + ': ' + esc(it.family) : '') +
          (it.path || it.url ? ' · <a href="' + esc(it.path || it.url) + '">' + T.page + '</a>' : '') + '</p>' +
          (it.rfq ? '<p class="enq-item__rfq">' + T.rfqNote + '</p>' : '') + '</div>' +
          '<button type="button" class="enq-icon-btn enq-remove" data-act="remove" aria-describedby="' + id + 'n">' + ICON.trash + '<span>' + T.remove + '</span></button></div>' +
          '<div class="enq-item__row"><div class="enq-field"><span id="' + id + 'ql">' + T.qty + '</span><div class="enq-stepper">' +
          '<button type="button" class="enq-icon-btn" data-act="dec" aria-label="' + T.dec + '">−</button>' +
          '<input type="number" inputmode="numeric" min="1" max="99999" step="1" value="' + clampQty(it.qty) + '" data-act="qty" aria-labelledby="' + id + 'ql ' + id + 'n">' +
          '<button type="button" class="enq-icon-btn" data-act="inc" aria-label="' + T.inc + '">+</button></div></div>' +
          '<label class="enq-field enq-note" for="' + id + 's"><span>' + T.note + '</span><input id="' + id + 's" type="text" maxlength="200" data-act="note" placeholder="' + T.notePh + '" value="' + esc(it.note || '') + '"></label></div></li>';
      });
      list.innerHTML = h + '</ul>';
    }
    function idx(el) { var li = el.closest('[data-i]'); return li ? parseInt(li.getAttribute('data-i'), 10) : -1; }
    list.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-act]'); if (!b) return;
      var i = idx(b), items = load(); if (!items[i]) return;
      var act = b.getAttribute('data-act');
      if (act === 'remove') {
        items.splice(i, 1); save(items); render();
        var next = list.querySelectorAll('[data-act="remove"]')[Math.min(i, items.length - 1)];
        (next || document.getElementById('enq-heading') || list).focus();
        return;
      }
      items[i].qty = clampQty(items[i].qty + (act === 'inc' ? 1 : -1)); save(items);
      b.parentNode.querySelector('input').value = items[i].qty;
    });
    list.addEventListener('change', function (e) {
      var t = e.target, act = t.getAttribute('data-act'); if (!act) return;
      var i = idx(t), items = load(); if (!items[i]) return;
      if (act === 'qty') { items[i].qty = clampQty(t.value); t.value = items[i].qty; }
      if (act === 'note') items[i].note = clean(t.value).slice(0, 200);
      save(items);
    });
    list.addEventListener('input', function (e) {
      if (e.target.getAttribute('data-act') !== 'note') return;
      var i = idx(e.target), items = load(); if (!items[i]) return;
      items[i].note = e.target.value.slice(0, 200); save(items);
    });

    function digits(p) { var d = (p || '').replace(/\D/g, ''); if (d.length === 12 && d.indexOf('91') === 0) d = d.slice(2); if (d.length === 11 && d[0] === '0') d = d.slice(1); return d; }
    function validate() {
      var items = load(), v = {};
      fields.forEach(function (n) { v[n] = f(n) ? clean(f(n).value) : ''; });
      fields.forEach(function (n) { if (f(n)) f(n).removeAttribute('aria-invalid'); });
      var bad = null, msg = '';
      if (!items.length) msg = T.errItems;
      else if (!v.name) { bad = 'name'; msg = T.errName; }
      else if (!/^[6-9]\d{9}$/.test(digits(v.phone))) { bad = 'phone'; msg = T.errPhone; }
      else if (!v.city) { bad = 'city'; msg = T.errCity; }
      err.textContent = msg; ok.textContent = '';
      if (bad) { f(bad).setAttribute('aria-invalid', 'true'); f(bad).focus(); }
      else if (msg) list.focus();
      return msg ? null : { items: items, v: v };
    }
    function buildText(d, wa) {
      var b = function (s) { return wa ? '*' + s + '*' : s; }, L = [T.hello, '', b(T.items + ' (' + d.items.length + ')')];
      d.items.forEach(function (it, i) {
        L.push((i + 1) + '. ' + it.name + (it.rfq ? ' [RFQ]' : ''));
        L.push('   ' + T.lBrand + ': ' + it.brand + (it.family && it.family !== it.name ? ' · ' + T.lRange + ': ' + it.family : ''));
        L.push('   ' + T.lQty + ': ' + clampQty(it.qty));
        if (clean(it.note)) L.push('   ' + T.lSpec + ': ' + clean(it.note));
        if (it.url) L.push('   ' + T.lPage + ': ' + it.url);
      });
      L.push('', b(T.contact));
      L.push(T.lName + ': ' + d.v.name);
      L.push(T.lPhone + ': ' + d.v.phone);
      if (d.v.company) L.push(T.lCompany + ': ' + d.v.company);
      L.push(T.lCity + ': ' + d.v.city);
      if (d.v.delivery) L.push(T.lDelivery + ': ' + d.v.delivery);
      if (d.v.message) L.push('', T.lMsg + ': ' + d.v.message);
      L.push('', '— ' + T.footer);
      return L.join('\n');
    }
    window.atriclEnquiry = { buildText: buildText, load: load };
    function after(kind) {
      ok.textContent = kind === 'whatsapp' ? T.okWa : T.okMail;
      track('generate_lead', { method: kind, items_count: load().length });
      var c = document.getElementById('enq-clear-after');
      if (c && c.checked) { save([]); render(); }
    }
    document.querySelectorAll('[data-enq-send]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var d = validate(); if (!d) return;
        var kind = btn.getAttribute('data-enq-send');
        if (kind === 'whatsapp') {
          var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(buildText(d, true));
          var w = window.open(url, '_blank', 'noopener');
          if (!w) location.href = url;
        } else {
          var who = d.v.name + (d.v.city ? ', ' + d.v.city : '');
          location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(T.subject(d.items.length, who)) + '&body=' + encodeURIComponent(buildText(d, false));
        }
        after(kind);
      });
    });
    var clr = document.getElementById('enq-clear');
    if (clr) clr.addEventListener('click', function () {
      if (!load().length) return;
      if (window.confirm(T.confirmClear)) { save([]); render(); ok.textContent = T.cleared; err.textContent = ''; }
    });
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); });
    render();
    window.addEventListener('storage', function (e) { if (e.key === KEY) { render(); updateBadges(); } });
  }

  function init() {
    makeBadge(); updateBadges();
    document.querySelectorAll('[data-enq]').forEach(initSlot);
    var app = document.querySelector('[data-enq-app]'); if (app) initApp(app);
    window.addEventListener('storage', function (e) { if (e.key === KEY) updateBadges(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
