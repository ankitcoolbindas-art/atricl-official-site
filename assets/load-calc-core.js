/* ATRICL load / cable / MCB calculator: pure formulas (no DOM).
   INDICATIVE ONLY. Not a certified design. Follow IS 732 and local CEA rules,
   and have a licensed electrician check every design.
   Cable ratings: PVC (70 °C) insulated cables, IS 3961-style values at 30 °C
   reference ambient, "in conduit / enclosed" column (the conservative one).
   Conductor resistance: IS 8130 class 2 maximum DC resistance at 20 °C.
   Loaded in the browser as window.ATRICLCalc and in Node via require(). */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ATRICLCalc = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var VOLTS = { 1: 230, 3: 415 };
  /* Standard protective-device ratings (A), IS/IEC 60898 / 60947-2 series. */
  var RATINGS = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800];
  var SIZES = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];
  /* Current ratings (A) at 30 °C, PVC 70 °C, multicore cable.
     [conduit/enclosed, in air]; 2-core for single phase, 3/4-core for three phase. */
  var AMPS = {
    cu: {
      1: { conduit: [16, 22, 30, 38, 53, 71, 94, 117, 142, 181, 219, 253, 291, 332, 390], air: [22, 30, 38, 49, 68, 91, 121, 150, 181, 231, 280, 324, 372, 425, 500] },
      3: { conduit: [14, 19.5, 26, 33, 46, 62, 82, 101, 122, 156, 188, 218, 250, 286, 336], air: [19.5, 27, 36, 46, 63, 85, 112, 138, 168, 213, 258, 299, 344, 392, 461] }
    },
    al: {
      1: { conduit: [null, 17, 23, 30, 41, 55, 73, 91, 110, 141, 170, 197, 227, 259, 304], air: [null, 23, 30, 38, 53, 71, 94, 116, 141, 180, 218, 252, 290, 331, 390] },
      3: { conduit: [null, 15, 20, 26, 36, 48, 64, 78, 95, 121, 146, 170, 195, 223, 262], air: [null, 21, 28, 36, 49, 66, 87, 107, 130, 166, 201, 233, 268, 305, 359] }
    }
  };
  /* Max DC resistance at 20 °C, ohm/km (IS 8130 class 2). */
  var R20 = {
    cu: [12.1, 7.41, 4.61, 3.08, 1.83, 1.15, 0.727, 0.524, 0.387, 0.268, 0.193, 0.153, 0.124, 0.0991, 0.0754],
    al: [18.1, 12.1, 7.41, 4.61, 3.08, 1.91, 1.20, 0.868, 0.641, 0.443, 0.320, 0.253, 0.206, 0.164, 0.125]
  };
  var R_HOT = 1.2; /* 20 °C -> 70 °C conductor temperature, ~ +20 % */
  var AMBIENT = { 30: 1.0, 35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71 };

  function num(v) { var n = typeof v === 'number' ? v : parseFloat(String(v == null ? '' : v).replace(',', '.')); return isFinite(n) ? n : NaN; }
  function round(n, d) { var p = Math.pow(10, d || 0); return Math.round(n * p) / p; }

  /* Design current Ib (A). phase 1 or 3, kw > 0, pf in (0, 1]. */
  function designCurrent(kw, phase, pf, volts) {
    kw = num(kw); pf = num(pf); var v = num(volts) || VOLTS[phase];
    if (!(kw > 0) || !(pf > 0 && pf <= 1) || !v || (phase !== 1 && phase !== 3)) return NaN;
    var w = kw * 1000;
    return phase === 3 ? w / (Math.sqrt(3) * v * pf) : w / (v * pf);
  }
  function kwFromCurrent(amps, phase, pf, volts) {
    amps = num(amps); pf = num(pf); var v = num(volts) || VOLTS[phase];
    if (!(amps > 0) || !(pf > 0 && pf <= 1) || !v) return NaN;
    return (phase === 3 ? Math.sqrt(3) * v * amps * pf : v * amps * pf) / 1000;
  }
  /* Smallest standard rating >= Ib x 1.25, plus the next one up as the range top. */
  function breakerRange(ib) {
    ib = num(ib); if (!(ib > 0)) return null;
    var need = ib * 1.25, i;
    for (i = 0; i < RATINGS.length; i++) if (RATINGS[i] >= need - 1e-9) break;
    if (i >= RATINGS.length) return { min: null, max: null, need: need, beyond: true, device: 'beyond' };
    var lo = RATINGS[i], hi = RATINGS[Math.min(i + 1, RATINGS.length - 1)];
    return { min: lo, max: hi, need: need, beyond: false, device: deviceType(lo) };
  }
  function deviceType(rating) { return rating <= 63 ? 'mcb' : rating <= 125 ? 'mcb-or-mccb' : 'mccb'; }
  function ambientFactor(t) { return AMBIENT[t] || AMBIENT[40]; }
  /* Smallest cable whose derated rating >= the protective device rating In (Ib <= In <= Iz). */
  function cableBand(inA, phase, material, install, ambient) {
    inA = num(inA); material = material === 'al' ? 'al' : 'cu'; install = install === 'air' ? 'air' : 'conduit';
    if (!(inA > 0) || (phase !== 1 && phase !== 3)) return null;
    var col = AMPS[material][phase][install], f = ambientFactor(ambient);
    for (var i = 0; i < SIZES.length; i++) {
      if (col[i] == null) continue;
      if (col[i] * f >= inA - 1e-9) {
        var j = Math.min(i + 1, SIZES.length - 1);
        return { min: SIZES[i], max: SIZES[j], minIdx: i, rating: round(col[i] * f, 1), factor: f, beyond: false };
      }
    }
    return { min: null, max: null, beyond: true, factor: f };
  }
  /* Approximate voltage drop: resistive part only, conductor at 70 °C.
     1-phase: 2 x I x L x R ; 3-phase: sqrt(3) x I x L x R. lengthM in metres. */
  function voltageDrop(ib, lengthM, size, material, phase) {
    ib = num(ib); lengthM = num(lengthM); size = num(size); material = material === 'al' ? 'al' : 'cu';
    var idx = SIZES.indexOf(size);
    if (!(ib > 0) || !(lengthM > 0) || idx < 0 || (phase !== 1 && phase !== 3)) return null;
    var r = R20[material][idx] * R_HOT / 1000; /* ohm per metre */
    var volts = (phase === 3 ? Math.sqrt(3) : 2) * ib * lengthM * r;
    return { volts: volts, percent: volts / VOLTS[phase] * 100 };
  }
  /* Smallest size (>= fromSize) keeping drop <= limitPct. */
  function sizeForDrop(ib, lengthM, material, phase, limitPct, fromSize) {
    var start = Math.max(0, SIZES.indexOf(num(fromSize)));
    for (var i = start; i < SIZES.length; i++) {
      if (material === 'al' && R20.al[i] == null) continue;
      var vd = voltageDrop(ib, lengthM, SIZES[i], material, phase);
      if (vd && vd.percent <= limitPct + 1e-9) return SIZES[i];
    }
    return null;
  }
  /* One call for the UI. opts: {mode:'kw'|'amps', value, phase, pf, material, install, ambient, length} */
  function calculate(opts) {
    var phase = num(opts.phase) === 3 ? 3 : 1, pf = num(opts.pf), value = num(opts.value);
    var errors = [];
    if (!(value > 0)) errors.push('value');
    if (!(pf > 0 && pf <= 1)) errors.push('pf');
    var len = opts.length === '' || opts.length == null ? null : num(opts.length);
    if (len !== null && !(len > 0 && len <= 2000)) errors.push('length');
    if (errors.length) return { ok: false, errors: errors };
    var ib = opts.mode === 'amps' ? value : designCurrent(value, phase, pf);
    var kw = opts.mode === 'amps' ? kwFromCurrent(value, phase, pf) : value;
    var br = breakerRange(ib);
    var cab = br && !br.beyond ? cableBand(br.min, phase, opts.material, opts.install, num(opts.ambient)) : null;
    var vd = null, vdSize = null;
    if (len && cab && !cab.beyond) {
      vd = voltageDrop(ib, len, cab.min, opts.material, phase);
      if (vd && vd.percent > 5) vdSize = sizeForDrop(ib, len, opts.material, phase, 5, cab.min);
    }
    return { ok: true, phase: phase, volts: VOLTS[phase], pf: pf, kw: kw, ib: ib, breaker: br, cable: cab, length: len, drop: vd, sizeFor5pc: vdSize, material: opts.material === 'al' ? 'al' : 'cu' };
  }

  return {
    VOLTS: VOLTS, RATINGS: RATINGS, SIZES: SIZES, AMPS: AMPS, R20: R20,
    designCurrent: designCurrent, kwFromCurrent: kwFromCurrent, breakerRange: breakerRange, deviceType: deviceType,
    cableBand: cableBand, voltageDrop: voltageDrop, sizeForDrop: sizeForDrop, ambientFactor: ambientFactor, calculate: calculate, round: round
  };
});
