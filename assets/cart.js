/* ATRICL enquiry cart. Client-side only (localStorage). No backend.
   Product pages: <div data-enq data-enq-name="Family" data-enq-brand="Brand" [data-enq-rfq]></div>
   The nearest preceding <ul> sibling (same family block) becomes the "range" picker.
   Shop page: <div data-shop> loads assets/data/products.json.
   UPI: set UPI_ID below to a real VPA to show the optional advance-pay section.
   Until then the pay section stays hidden. Append ?preview_upi=1 only to review the layout. */
(function () {
  'use strict';
  var KEY = 'atricl_enquiry_v1', FORM_KEY = 'atricl_enquiry_contact_v1';
  var WA = '918873752101', MAIL = 'atricl001@gmail.com';
  /* Owner must replace this with ATRICL's real UPI VPA before the pay section is shown. */
  var UPI_ID = 'REPLACE-ME@upi';
  var UPI_PAYEE = 'ATRICL';
  var hi = (document.documentElement.lang || '').indexOf('hi') === 0;
  var T = hi ? {
    add: 'इन्क्वायरी में जोड़ें', addRfq: 'RFQ में जोड़ें', range: 'रेंज / आइटम', qty: 'मात्रा',
    any: ' — पूरी रेंज / बाद में बताऊँगा', added: 'लिस्ट में जुड़ गया।', view: 'इन्क्वायरी कार्ट देखें',
    groupAria: function (n) { return n + ' को इन्क्वायरी लिस्ट में जोड़ें'; },
    badge: 'इन्क्वायरी', badgeAria: function (n) { return 'इन्क्वायरी कार्ट, ' + n + ' आइटम'; },
    brand: 'ब्रांड', fam: 'रेंज', page: 'पेज देखें', note: 'स्पेसिफिकेशन नोट (चाहें तो)',
    notePh: 'रेटिंग / पोल / साइज़ / मॉडल', remove: 'हटाएँ', dec: 'मात्रा कम करें', inc: 'मात्रा बढ़ाएँ',
    rfqTag: 'RFQ', rfqNote: 'RFQ पर उपलब्ध — ATRICL, Siemens का ऑथराइज्ड पार्टनर नहीं है।',
    empty: 'आपकी लिस्ट अभी खाली है। शॉप पेज या किसी प्रोडक्ट पेज पर "इन्क्वायरी में जोड़ें" दबाकर आइटम जोड़ें।',
    browse: [['shop.html', 'शॉप'], ['products.html', 'प्रोडक्ट'], ['products-switchgear.html', 'स्विचगियर'], ['products-lighting.html', 'लाइटिंग'], ['brands.html', 'ब्रांड']],
    errItems: 'लिस्ट में कम से कम एक आइटम जोड़ें।', errName: 'कृपया अपना नाम लिखें।',
    errPhone: 'कृपया सही 10 अंकों का मोबाइल नंबर लिखें।', errCity: 'कृपया शहर लिखें।',
    errGstin: 'GSTIN 15 अक्षर का होना चाहिए (जैसे 20AAAAA0000A1Z5)।',
    okWa: 'WhatsApp में आपका मैसेज तैयार है — वहाँ "भेजें" दबाएँ। हम कोटेशन के साथ जवाब देंगे।',
    okMail: 'आपके ईमेल ऐप में मैसेज तैयार है — वहाँ "भेजें" दबाएँ। हम कोटेशन के साथ जवाब देंगे।',
    confirmClear: 'पूरी इन्क्वायरी लिस्ट खाली कर दें?', cleared: 'लिस्ट खाली कर दी गई।',
    hello: 'नमस्ते ATRICL, मुझे इन आइटम का कोटेशन चाहिए:', items: 'आइटम', contact: 'संपर्क',
    lQty: 'मात्रा', lSpec: 'स्पेसिफिकेशन', lPage: 'पेज', lBrand: 'ब्रांड', lRange: 'रेंज',
    lName: 'नाम', lPhone: 'मोबाइल', lCompany: 'कंपनी', lCity: 'शहर', lDelivery: 'डिलीवरी की जगह',
    lGstin: 'GSTIN', lMsg: 'संदेश',
    footer: 'atricl.com इन्क्वायरी कार्ट से भेजा गया', subject: function (n, who) { return 'इन्क्वायरी: ' + n + ' आइटम — ' + who; },
    count: function (n) { return n + ' आइटम'; },
    por: 'मूल्य अनुरोध पर',
    shopFail: 'कैटलॉग लोड नहीं हो सका। प्रोडक्ट पेज से आइटम जोड़ें, या पेज रीफ़्रेश करें।',
    upiAmt: 'एडवांस राशि (₹)', upiAmtPh: 'केवल पुष्टि के बाद राशि लिखें',
    upiOpen: 'UPI ऐप खोलें', upiQr: 'UPI QR कोड',
    upiNoAmt: 'राशि खाली छोड़ने पर ऐप में राशि बाद में भरनी होगी।',
    upiPayee: 'पेयी', upiId: 'UPI ID',
    upiDemo: 'डेमो लेआउट — यह असली पेमेंट नहीं है। UPI ID अभी प्लेसहोल्डर है।'
  } : {
    add: 'Add to enquiry', addRfq: 'Add to RFQ', range: 'Range / item', qty: 'Qty',
    any: ' — whole range / will specify', added: 'Added to your list.', view: 'View enquiry cart',
    groupAria: function (n) { return 'Add ' + n + ' to enquiry list'; },
    badge: 'Enquiry', badgeAria: function (n) { return 'Enquiry cart, ' + n + (n === 1 ? ' item' : ' items'); },
    brand: 'Brand', fam: 'Range', page: 'View page', note: 'Spec note (optional)',
    notePh: 'Rating / poles / size / model', remove: 'Remove', dec: 'Decrease quantity', inc: 'Increase quantity',
    rfqTag: 'RFQ', rfqNote: 'Available against RFQ — ATRICL is not an authorised Siemens partner.',
    empty: 'Your enquiry list is empty. Use "Add to enquiry" on the shop page or any product page to add items.',
    browse: [['shop.html', 'Shop'], ['products.html', 'Products'], ['products-switchgear.html', 'Switchgear'], ['products-lighting.html', 'Lighting'], ['brands.html', 'Brands']],
    errItems: 'Add at least one item to your list.', errName: 'Please enter your name.',
    errPhone: 'Please enter a valid 10-digit mobile number.', errCity: 'Please enter your city.',
    errGstin: 'GSTIN should be 15 characters (for example 20AAAAA0000A1Z5).',
    okWa: 'Your message is ready in WhatsApp — tap Send there. We will reply with a quotation.',
    okMail: 'Your message is ready in your email app — press Send there. We will reply with a quotation.',
    confirmClear: 'Clear your whole enquiry list?', cleared: 'Your list has been cleared.',
    hello: 'Hello ATRICL, please quote for these items:', items: 'Items', contact: 'Contact',
    lQty: 'Qty', lSpec: 'Spec', lPage: 'Page', lBrand: 'Brand', lRange: 'Range',
    lName: 'Name', lPhone: 'Phone', lCompany: 'Company', lCity: 'City', lDelivery: 'Delivery location',
    lGstin: 'GSTIN', lMsg: 'Message',
    footer: 'Sent from the atricl.com enquiry cart', subject: function (n, who) { return 'Enquiry: ' + n + (n === 1 ? ' item' : ' items') + ' — ' + who; },
    count: function (n) { return n + (n === 1 ? ' item' : ' items'); },
    por: 'Price on request',
    shopFail: 'Could not load the catalogue. Add items from a product page, or refresh this page.',
    upiAmt: 'Advance amount (₹)', upiAmtPh: 'Enter an amount only after it is confirmed',
    upiOpen: 'Open UPI app', upiQr: 'UPI QR code',
    upiNoAmt: 'If you leave the amount blank, you will enter it in the UPI app.',
    upiPayee: 'Payee', upiId: 'UPI ID',
    upiDemo: 'Demo layout only — this is not a real payment. The UPI ID is still a placeholder.'
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
  function assetUrl(path) { return (hi ? '../' : '') + path; }

  function addItem(it) {
    var items = load(), id = [it.brand, it.family, it.name].join('|').toLowerCase(), found = null;
    for (var i = 0; i < items.length; i++) if (items[i].id === id) found = items[i];
    if (found) found.qty = clampQty(found.qty + it.qty);
    else { it.id = id; it.note = it.note || ''; it.added = Date.now(); items.push(it); }
    save(items);
    track('add_to_cart', { item_name: it.name, item_brand: it.brand, items: [{ item_name: it.name, item_brand: it.brand, item_category: it.family, quantity: it.qty }] });
    bump();
  }

  /* ---------- header badge + floating badge ---------- */
  var badges = [];
  function isCartPage() { return /\/cart\.html$/.test(location.pathname) || /\/enquiry\.html$/.test(location.pathname); }
  function makeBadge() {
    var nav = document.querySelector('nav');
    if (!nav) return;
    var row = nav.querySelector('.h-20') || nav.firstElementChild;
    var a = document.createElement('a');
    a.className = 'enq-badge';
    a.href = base + 'cart.html';
    a.innerHTML = ICON.list + '<span class="enq-badge__txt">' + T.badge + '</span><span class="enq-badge__n" aria-hidden="true" hidden>0</span>';
    if (isCartPage()) a.setAttribute('aria-current', 'page');
    var btn = row && row.querySelector('#mobile-menu-button');
    if (btn) row.insertBefore(a, btn); else if (row) row.appendChild(a); else return;
    badges.push(a);
  }
  function makeFab() {
    if (isCartPage()) return;
    var a = document.createElement('a');
    a.className = 'enq-fab';
    a.href = base + 'cart.html';
    a.innerHTML = ICON.list + '<span class="enq-fab__txt">' + T.badge + '</span><span class="enq-badge__n" aria-hidden="true" hidden>0</span>';
    document.body.appendChild(a);
    badges.push(a);
  }
  function updateBadges() {
    var n = load().length;
    badges.forEach(function (a) {
      var c = a.querySelector('.enq-badge__n');
      if (!c) return;
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
  function fillAddSlot(slot, family, brand, rfq, opts) {
    var id = 'enq' + (++uid);
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
      st.innerHTML = '✓ ' + T.added + ' <a href="' + base + 'cart.html">' + T.view + ' (' + T.count(load().length) + ')</a>';
    });
  }
  function initSlot(slot) {
    var family = clean(slot.getAttribute('data-enq-name')).replace(/^\d+\.\s*/, '');
    var brand = clean(slot.getAttribute('data-enq-brand'));
    var rfq = slot.hasAttribute('data-enq-rfq');
    fillAddSlot(slot, family, brand, rfq, rangeOptions(slot));
  }

  /* ---------- shop page (products.json) ---------- */
  function origin() { return (location.origin && location.origin !== 'null') ? location.origin : 'https://www.atricl.com'; }
  function initShop(root) {
    fetch(assetUrl('assets/data/products.json'), { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('bad'); return r.json(); })
      .then(function (data) { renderShop(root, data); })
      .catch(function () { root.innerHTML = '<p class="enq-empty">' + T.shopFail + '</p>'; });
  }
  function renderShop(root, data) {
    var list = (data && data.products) || [];
    var por = hi ? (data.priceNoteHi || T.por) : (data.priceNote || T.por);
    var groups = [], seen = {};
    list.forEach(function (p) {
      var key = p.brand + '|' + (hi ? p.categoryLabelHi : p.categoryLabel);
      if (!seen[key]) { seen[key] = { brand: p.brand, cat: hi ? p.categoryLabelHi : p.categoryLabel, rfq: !!p.rfqOnly, items: [] }; groups.push(seen[key]); }
      seen[key].items.push(p);
    });
    var html = '';
    groups.forEach(function (g) {
      html += '<section class="shop-group' + (g.rfq ? ' shop-group--rfq' : '') + '">';
      html += '<h2 class="shop-group__title font-orbitron text-xl md:text-2xl font-bold text-gray-900">' + esc(g.brand);
      if (g.rfq) html += ' <span class="enq-tag">' + T.rfqTag + '</span>';
      html += '</h2>';
      html += '<p class="shop-group__cat text-sm font-semibold text-gray-500 mb-4">' + esc(g.cat) + '</p>';
      if (g.rfq) html += '<p class="enq-item__rfq" style="margin-top:0;margin-bottom:1rem">' + T.rfqNote + '</p>';
      html += '<div class="shop-grid">';
      g.items.forEach(function (p) {
        var name = hi ? (p.nameHi || p.name) : p.name;
        var page = hi ? p.pageHi : p.page;
        var href = (hi ? '../' : '') + (p.page || page) ;
        /* HI shop lives in /hi/, pageHi is "hi/file.html" — use file name only. */
        if (hi) href = '../' + (p.page || '') + (p.hash || '');
        else href = (p.page || '') + (p.hash || '');
        html += '<article class="shop-card' + (p.rfqOnly ? ' shop-card--rfq' : '') + '" data-product-id="' + esc(p.id) + '">';
        html += '<p class="shop-card__brand">' + esc(p.brand) + (p.rfqOnly ? ' <span class="enq-tag">' + T.rfqTag + '</span>' : '') + '</p>';
        html += '<h3 class="shop-card__name">' + esc(name) + '</h3>';
        html += '<p class="shop-card__price">' + esc(por) + '</p>';
        html += '<a class="shop-card__page" href="' + esc(href) + '">' + T.page + '</a>';
        html += '<div class="enq-add' + (p.rfqOnly ? ' enq-add--rfq' : '') + '" data-shop-add></div>';
        html += '</article>';
      });
      html += '</div></section>';
    });
    root.innerHTML = html;
    var cards = root.querySelectorAll('.shop-card');
    list.forEach(function (p, i) { /* index not reliable if filter; match by id */ });
    Array.prototype.forEach.call(cards, function (card) {
      var p = null, id = card.getAttribute('data-product-id');
      for (var i = 0; i < list.length; i++) if (list[i].id === id) p = list[i];
      if (!p) return;
      var family = hi ? (p.nameHi || p.name) : p.name;
      var slot = card.querySelector('[data-shop-add]');
      fillAddSlot(slot, family, p.brand, !!p.rfqOnly, p.variants || []);
      /* Override add to store a stable https URL for the source product page. */
      var btn = slot.querySelector('button');
      var sel = slot.querySelector('select');
      var q = slot.querySelector('input[type="number"]');
      var st = slot.querySelector('.enq-status');
      var newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener('click', function () {
        var choice = sel ? sel.value : '';
        var qty = clampQty(q.value); q.value = qty;
        var path = '/' + (hi ? (p.pageHi || ('hi/' + p.page)) : p.page) + (p.hash || '');
        addItem({
          name: choice || family,
          family: family,
          brand: p.brand,
          rfq: !!p.rfqOnly,
          qty: qty,
          url: origin() + path,
          path: path,
          productId: p.id
        });
        st.innerHTML = '✓ ' + T.added + ' <a href="' + base + 'cart.html">' + T.view + ' (' + T.count(load().length) + ')</a>';
      });
    });
  }

  /* ---------- UPI ---------- */
  function upiConfigured() {
    return !!(UPI_ID && UPI_ID.indexOf('REPLACE-ME') === -1 && UPI_ID.indexOf('@') !== -1);
  }
  function upiPreview() {
    return /(?:\?|&)preview_upi=1(?:&|$)/.test(location.search);
  }
  function buildUpiUri(amount) {
    var p = 'upi://pay?pa=' + encodeURIComponent(UPI_ID) + '&pn=' + encodeURIComponent(UPI_PAYEE) + '&cu=INR';
    if (amount) p += '&am=' + encodeURIComponent(amount);
    p += '&tn=' + encodeURIComponent('ATRICL enquiry advance');
    return p;
  }
  function parseAdvance(raw) {
    var n = parseFloat(String(raw || '').replace(/,/g, '').trim());
    if (!(n > 0) || !isFinite(n)) return '';
    return (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, '');
  }
  function paintQr(box, uri) {
    if (!box) return;
    box.innerHTML = '';
    if (typeof qrcode !== 'function') {
      box.textContent = uri;
      return;
    }
    try {
      var qr = qrcode(0, 'M');
      qr.addData(uri);
      qr.make();
      box.innerHTML = qr.createSvgTag(5, 2);
      var svg = box.querySelector('svg');
      if (svg) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', T.upiQr); }
    } catch (e) { box.textContent = uri; }
  }
  function initUpi() {
    var section = document.getElementById('enq-upi');
    if (!section) return;
    var demo = !upiConfigured() && upiPreview();
    if (!upiConfigured() && !demo) {
      section.hidden = true;
      section.setAttribute('hidden', 'hidden');
      return;
    }
    section.hidden = false;
    section.removeAttribute('hidden');
    if (demo) section.classList.add('enq-upi--demo');
    var banner = document.getElementById('enq-upi-demo');
    if (banner) banner.hidden = !demo;
    var amt = document.getElementById('enq-upi-amount');
    var link = document.getElementById('enq-upi-link');
    var qrbox = document.getElementById('enq-upi-qr');
    var meta = document.getElementById('enq-upi-meta');
    if (meta) meta.textContent = T.upiPayee + ': ' + UPI_PAYEE + ' · ' + T.upiId + ': ' + UPI_ID;
    function refresh() {
      var amount = amt ? parseAdvance(amt.value) : '';
      var uri = buildUpiUri(amount);
      if (link) {
        link.setAttribute('href', uri);
        link.setAttribute('data-upi-uri', uri);
      }
      paintQr(qrbox, uri);
      var hint = document.getElementById('enq-upi-hint');
      if (hint) hint.hidden = !!amount;
    }
    if (amt) amt.addEventListener('input', refresh);
    refresh();
    window.atriclUpi = { buildUpiUri: buildUpiUri, parseAdvance: parseAdvance, configured: upiConfigured(), preview: demo, id: UPI_ID, payee: UPI_PAYEE };
  }

  /* ---------- enquiry / cart page ---------- */
  function initApp(app) {
    var list = document.getElementById('enq-items');
    var form = document.getElementById('enq-form');
    var err = document.getElementById('enq-error'), ok = document.getElementById('enq-ok');
    var summary = document.getElementById('enq-count');
    var fields = ['name', 'phone', 'company', 'city', 'gstin', 'delivery', 'message'];
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
          (it.path || it.url ? ' · <a href="' + esc(it.path || it.url) + '">' + T.page + '</a>' : '') +
          ' · <span class="enq-por">' + T.por + '</span></p>' +
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
    function validGstin(s) { return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(s.replace(/\s/g, '').toUpperCase()); }
    function validate() {
      var items = load(), v = {};
      fields.forEach(function (n) { v[n] = f(n) ? clean(f(n).value) : ''; });
      fields.forEach(function (n) { if (f(n)) f(n).removeAttribute('aria-invalid'); });
      var bad = null, msg = '';
      if (!items.length) msg = T.errItems;
      else if (!v.name) { bad = 'name'; msg = T.errName; }
      else if (!/^[6-9]\d{9}$/.test(digits(v.phone))) { bad = 'phone'; msg = T.errPhone; }
      else if (!v.city) { bad = 'city'; msg = T.errCity; }
      else if (v.gstin && !validGstin(v.gstin)) { bad = 'gstin'; msg = T.errGstin; }
      if (v.gstin) v.gstin = v.gstin.replace(/\s/g, '').toUpperCase();
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
      if (d.v.gstin) L.push(T.lGstin + ': ' + d.v.gstin);
      if (d.v.delivery) L.push(T.lDelivery + ': ' + d.v.delivery);
      if (d.v.message) L.push('', T.lMsg + ': ' + d.v.message);
      L.push('', '— ' + T.footer);
      return L.join('\n');
    }
    window.atriclEnquiry = { buildText: buildText, load: load, addItem: addItem };
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
          var href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(T.subject(d.items.length, who)) + '&body=' + encodeURIComponent(buildText(d, false));
          var w = window.open(href, '_blank', 'noopener');
          if (!w) location.href = href;
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
    initUpi();
    window.addEventListener('storage', function (e) { if (e.key === KEY) { render(); updateBadges(); } });
  }

  function init() {
    makeBadge(); makeFab(); updateBadges();
    document.querySelectorAll('[data-enq]').forEach(initSlot);
    var shop = document.querySelector('[data-shop]'); if (shop) initShop(shop);
    var app = document.querySelector('[data-enq-app]'); if (app) initApp(app);
    window.addEventListener('storage', function (e) { if (e.key === KEY) updateBadges(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
