/* ATRICL form helpers (EN + HI): PIN-code autofill and GSTIN check.
   Markup:
     <input data-pin data-pin-city="#city-input-id">   PIN field; city is filled on blur
     <input data-gstin>                                 optional GSTIN field, checked on blur
   Each field can have a sibling <p data-hint-for="field-id"> for the inline message.
   PIN lookups: api.postalpincode.in, fallback searchpincode.in, cached in sessionStorage.
   Any failure "fails open": the visitor just types the city by hand. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.ATRICLForm = api; if (typeof document !== 'undefined') api.autoInit(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var GST_STATES = { '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh', '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh', '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram', '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat', '26': 'Dadra & Nagar Haveli and Daman & Diu', '27': 'Maharashtra', '29': 'Karnataka', '30': 'Goa', '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu', '34': 'Puducherry', '35': 'Andaman & Nicobar Islands', '36': 'Telangana', '37': 'Andhra Pradesh', '38': 'Ladakh', '97': 'Other Territory', '99': 'Centre Jurisdiction' };

  function normGstin(s) { return String(s || '').replace(/\s/g, '').toUpperCase(); }
  /* Check character per the GSTN mod-36 scheme over the first 14 characters. */
  function gstinCheckChar(first14) {
    var sum = 0;
    for (var i = 0; i < 14; i++) {
      var v = CHARS.indexOf(first14.charAt(i)); if (v < 0) return null;
      var p = v * (i % 2 === 0 ? 1 : 2);
      sum += Math.floor(p / 36) + (p % 36);
    }
    return CHARS.charAt((36 - (sum % 36)) % 36);
  }
  /* -> { ok, reason: 'empty'|'length'|'format'|'state'|'checksum'|null, state } */
  function checkGstin(raw) {
    var s = normGstin(raw);
    if (!s) return { ok: false, reason: 'empty' };
    if (s.length !== 15) return { ok: false, reason: 'length' };
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(s)) return { ok: false, reason: 'format' };
    var st = s.slice(0, 2);
    if (!GST_STATES[st]) return { ok: false, reason: 'state' };
    if (gstinCheckChar(s.slice(0, 14)) !== s.charAt(14)) return { ok: false, reason: 'checksum' };
    return { ok: true, reason: null, state: GST_STATES[st], value: s };
  }
  function validGstin(raw) { return checkGstin(raw).ok; }
  function validPin(raw) { return /^[1-9][0-9]{5}$/.test(String(raw || '').replace(/\s/g, '')); }
  /* Both APIs return [{ Status, PostOffice: [{ District, State, ... }] }]. */
  function parsePin(json) {
    var r = Array.isArray(json) ? json[0] : json;
    if (!r || String(r.Status).toLowerCase() !== 'success' || !Array.isArray(r.PostOffice) || !r.PostOffice.length) return null;
    var po = r.PostOffice[0], district = String(po.District || '').trim(), state = String(po.State || '').trim();
    if (!district && !state) return null;
    return { district: district, state: state, label: district && state ? district + ', ' + state : (district || state) };
  }

  /* ---------- browser wiring ---------- */
  var SOURCES = ['https://api.postalpincode.in/pincode/', 'https://searchpincode.in/api/pincode/'];
  var CACHE = 'atricl_pin_';
  function fetchJson(url, ms) {
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var t = setTimeout(function () { if (ctl) ctl.abort(); }, ms);
    return fetch(url, { signal: ctl ? ctl.signal : undefined, credentials: 'omit', referrerPolicy: 'no-referrer' })
      .then(function (r) { clearTimeout(t); if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .catch(function (e) { clearTimeout(t); throw e; });
  }
  function lookupPin(pin) {
    try { var c = sessionStorage.getItem(CACHE + pin); if (c) return Promise.resolve(JSON.parse(c)); } catch (e) {}
    var i = 0;
    function next() {
      if (i >= SOURCES.length) return Promise.resolve(null);
      var url = SOURCES[i++] + pin;
      return fetchJson(url, 5000).then(function (j) { var p = parsePin(j); return p || next(); }, next);
    }
    return next().then(function (p) {
      if (p) { try { sessionStorage.setItem(CACHE + pin, JSON.stringify(p)); } catch (e) {} }
      return p;
    });
  }
  function texts() {
    var hi = (document.documentElement.lang || '').indexOf('hi') === 0;
    return hi ? {
      looking: 'PIN से शहर ढूँढ रहे हैं…', found: function (l) { return '✓ ' + l + ' (PIN से भरा गया — चाहें तो बदलें)'; },
      notFound: 'यह PIN नहीं मिला। कृपया शहर खुद लिखें।', badPin: 'PIN कोड 6 अंकों का होता है।',
      gOk: function (s) { return '✓ GSTIN का फ़ॉर्मेट और चेक-अंक सही हैं (' + s + ')। रजिस्ट्रेशन की पुष्टि हम बाद में करेंगे।'; },
      gBad: { length: 'GSTIN 15 अक्षर का होता है (जैसे 20AAAAA0000A1ZG)।', format: 'GSTIN का फ़ॉर्मेट सही नहीं लग रहा। कृपया दोबारा देखें।', state: 'GSTIN के पहले दो अंक (राज्य कोड) सही नहीं हैं।', checksum: 'GSTIN का आख़िरी अक्षर (चेक-अंक) मेल नहीं खा रहा। कहीं टाइपिंग की गलती तो नहीं?' }
    } : {
      looking: 'Looking up your PIN…', found: function (l) { return '✓ ' + l + ' (filled from PIN, edit if needed)'; },
      notFound: 'Couldn’t look up this PIN. Please type your city.', badPin: 'A PIN code has 6 digits.',
      gOk: function (s) { return '✓ GSTIN format and check digit look right (' + s + '). We confirm registration separately.'; },
      gBad: { length: 'A GSTIN has 15 characters (for example 20AAAAA0000A1ZG).', format: 'This GSTIN doesn’t look right. Please check it again.', state: 'The first two digits (state code) of this GSTIN are not valid.', checksum: 'The last character (check digit) doesn’t match. Please check for a typo.' }
    };
  }
  function hintFor(el) {
    var h = el.id && document.querySelector('[data-hint-for="' + el.id + '"]');
    if (!h) { h = document.createElement('p'); h.className = 'form-hint'; if (el.id) h.setAttribute('data-hint-for', el.id); h.setAttribute('aria-live', 'polite'); el.insertAdjacentElement('afterend', h); }
    if (el.id && !el.getAttribute('aria-describedby')) { if (!h.id) h.id = el.id + '-hint'; el.setAttribute('aria-describedby', h.id); }
    return h;
  }
  function say(el, msg, kind) { var h = hintFor(el); h.textContent = msg || ''; h.setAttribute('data-kind', kind || ''); h.style.color = { ok: '#166534', warn: '#b45309', info: '#64748b' }[kind] || ''; }

  function initPin(el) {
    var T = texts(), city = document.querySelector(el.getAttribute('data-pin-city') || '');
    var lastPin = '';
    el.addEventListener('input', function () { var d = el.value.replace(/\D/g, '').slice(0, 6); if (d !== el.value) el.value = d; });
    el.addEventListener('blur', function () {
      var pin = el.value.replace(/\s/g, '');
      if (!pin) { say(el, ''); el.removeAttribute('aria-invalid'); return; }
      if (!validPin(pin)) { say(el, T.badPin, 'warn'); return; }
      if (pin === lastPin && (!city || city.value.trim())) return;
      lastPin = pin; el.removeAttribute('aria-invalid'); say(el, T.looking, 'info');
      lookupPin(pin).then(function (p) {
        if (el.value.replace(/\s/g, '') !== pin) return;
        if (!p) { say(el, T.notFound, 'warn'); return; }
        if (city && (!city.value.trim() || city.getAttribute('data-autofilled') === '1')) {
          city.value = p.label; city.setAttribute('data-autofilled', '1');
          city.dispatchEvent(new Event('input', { bubbles: true }));
        }
        say(el, T.found(p.label), 'ok');
      }, function () { say(el, T.notFound, 'warn'); });
    });
    if (city) city.addEventListener('input', function (e) { if (e.isTrusted) city.removeAttribute('data-autofilled'); });
  }
  function initGstin(el) {
    var T = texts();
    el.addEventListener('blur', function () {
      var r = checkGstin(el.value);
      if (r.reason === 'empty') { say(el, ''); el.removeAttribute('aria-invalid'); return; }
      if (r.ok) { el.value = r.value; el.removeAttribute('aria-invalid'); say(el, T.gOk(r.state), 'ok'); }
      else { el.setAttribute('aria-invalid', 'true'); say(el, T.gBad[r.reason], 'warn'); }
    });
    el.addEventListener('input', function () { if (el.getAttribute('aria-invalid')) { el.removeAttribute('aria-invalid'); say(el, ''); } });
  }
  function autoInit() {
    function go() {
      document.querySelectorAll('[data-pin]').forEach(initPin);
      document.querySelectorAll('[data-gstin]').forEach(initGstin);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  }
  return { checkGstin: checkGstin, validGstin: validGstin, gstinCheckChar: gstinCheckChar, validPin: validPin, parsePin: parsePin, lookupPin: lookupPin, autoInit: autoInit, GST_STATES: GST_STATES };
});
