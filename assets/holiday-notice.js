/* ATRICL holiday notice (EN + HI). Static data: assets/data/holidays-2026-27.json.
   Shows "Our office may be closed on X" on the contact page only when a Jharkhand
   public holiday (the office is in Ranchi) falls within the next DAYS_AHEAD days,
   plus a one-line note for Bihar-only public holidays in the same window.
   Preview a date: add ?holiday_date=YYYY-MM-DD to the URL. */
(function () {
  'use strict';
  var box = document.getElementById('holiday-notice'); if (!box) return;
  var DAYS_AHEAD = 7;
  var hi = (document.documentElement.lang || '').indexOf('hi') === 0;
  var src = box.getAttribute('data-src') || 'assets/data/holidays-2026-27.json';
  function istToday() {
    var q = /[?&]holiday_date=(\d{4}-\d{2}-\d{2})/.exec(location.search); if (q) return q[1];
    try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
    catch (e) { var d = new Date(Date.now() + 330 * 60000); return d.toISOString().slice(0, 10); }
  }
  function toUtc(s) { var p = s.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
  function addDays(s, n) { return new Date(toUtc(s) + n * 86400000).toISOString().slice(0, 10); }
  function fmt(s) {
    var o = { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' };
    if (hi) o = { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' };
    try { return new Intl.DateTimeFormat(hi ? 'hi-IN' : 'en-IN', o).format(new Date(toUtc(s))); } catch (e) { return s; }
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  /* Group consecutive dates: [{from, to, names[]}] */
  function group(list) {
    var out = [];
    list.forEach(function (h) {
      var nm = hi ? h.name_hi : h.name_en, last = out[out.length - 1];
      if (last && (h.date === last.to || h.date === addDays(last.to, 1))) {
        last.to = h.date; if (last.names.indexOf(nm) < 0) last.names.push(nm);
      } else out.push({ from: h.date, to: h.date, names: [nm] });
    });
    return out;
  }
  function when(g) {
    if (g.from === g.to) return fmt(g.from);
    return fmt(g.from) + ' – ' + fmt(g.to);
  }
  function render(data) {
    var today = istToday(), end = addDays(today, DAYS_AHEAD);
    var cov = data.coverage || {};
    if (cov.to && today > cov.to) return;
    var near = (data.holidays || []).filter(function (h) { return h.date >= today && h.date <= end; });
    var jh = near.filter(function (h) { return h.states.indexOf('JH') >= 0; });
    var jhDates = {}; jh.forEach(function (h) { jhDates[h.date] = 1; });
    var br = near.filter(function (h) { return h.states.indexOf('BR') >= 0 && h.states.indexOf('JH') < 0 && !jhDates[h.date]; });
    if (!jh.length && !br.length) return;
    var html = '';
    if (jh.length) {
      var groups = group(jh), many = groups.length > 1 || groups[0].from !== groups[0].to;
      var parts = groups.map(function (g) { return '<strong>' + esc(when(g)) + '</strong> (' + esc(g.names.join(', ')) + ')'; });
      html += '<p>' + (hi
        ? 'झारखंड में सार्वजनिक अवकाश के कारण हमारा ऑफ़िस ' + parts.join(' और ') + ' को बंद रह सकता है। आप WhatsApp या ईमेल पर अपनी इन्क्वायरी भेज सकते हैं।'
        : 'Our office may be closed on ' + parts.join(' and ') + (many ? ', public holidays in Jharkhand.' : ', a public holiday in Jharkhand.') + ' You can still send your enquiry on WhatsApp or email.') + '</p>';
    }
    if (br.length) {
      var bp = group(br).map(function (g) { return esc(when(g)) + ' (' + esc(g.names.join(', ')) + ')'; });
      html += '<p class="holiday-notice__sub">' + (hi ? 'बिहार में सार्वजनिक अवकाश: ' : 'Public holiday in Bihar: ') + bp.join('; ') + '</p>';
    }
    box.innerHTML = '<i class="fa-solid fa-calendar-day" aria-hidden="true"></i><div>' + html + '</div>';
    box.hidden = false;
  }
  fetch(src, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(render).catch(function () {});
})();
