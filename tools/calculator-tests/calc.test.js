// Unit tests for assets/load-calc-core.js. Run: node --test tools/calculator-tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../../assets/load-calc-core.js');
const close = (a, b, tol = 0.05) => assert.ok(Math.abs(a - b) <= tol, `${a} !~ ${b}`);

test('single-phase design current I = P / (V x pf)', () => {
  close(C.designCurrent(2.3, 1, 1), 10);
  close(C.designCurrent(4.6, 1, 0.8), 25);
});
test('three-phase design current I = P / (sqrt3 x V x pf)', () => {
  close(C.designCurrent(10, 3, 0.8), 17.39);
  close(C.designCurrent(15, 3, 0.8), 26.09);
  close(C.designCurrent(30, 3, 1), 41.74);
});
test('invalid inputs give NaN', () => {
  assert.ok(Number.isNaN(C.designCurrent(0, 3, 0.8)));
  assert.ok(Number.isNaN(C.designCurrent(5, 3, 1.2)));
  assert.ok(Number.isNaN(C.designCurrent(5, 2, 0.8)));
});
test('kW from current round-trips', () => {
  close(C.kwFromCurrent(C.designCurrent(7.5, 3, 0.85), 3, 0.85), 7.5, 1e-9);
});
test('breaker: next standard rating at or above Ib x 1.25', () => {
  assert.deepEqual([C.breakerRange(10).min, C.breakerRange(10).max], [16, 20]); // 12.5 -> 16
  assert.equal(C.breakerRange(12.8).min, 16);   // 16.0 exactly
  assert.equal(C.breakerRange(12.9).min, 20);   // 16.1 -> 20
  assert.equal(C.breakerRange(26.09).min, 40);  // 32.6 -> 40
  assert.equal(C.breakerRange(60).min, 80);     // 75 -> 80
  assert.equal(C.breakerRange(60).device, 'mcb-or-mccb');
  assert.equal(C.breakerRange(40).device, 'mcb');
  assert.equal(C.breakerRange(200).device, 'mccb');
  assert.equal(C.breakerRange(700).beyond, true);
});
test('cable: smallest size with derated rating >= In', () => {
  // 3-phase Cu conduit @30C: 10 mm2 = 46 A, 16 = 62 A
  assert.equal(C.cableBand(40, 3, 'cu', 'conduit', 30).min, 10);
  // @40C factor 0.87: 46*0.87 = 40.02 -> 10 still OK for 40 A
  assert.equal(C.cableBand(40, 3, 'cu', 'conduit', 40).min, 10);
  // 63 A @40C: 82*0.87 = 71.3 -> 25 mm2 (16 = 53.9 too small)
  assert.equal(C.cableBand(63, 3, 'cu', 'conduit', 40).min, 25);
  // Aluminium never offers 1.5 mm2
  assert.equal(C.cableBand(6, 1, 'al', 'conduit', 30).min, 2.5);
  // band max is the next size up
  assert.equal(C.cableBand(16, 1, 'cu', 'conduit', 30).max, 2.5);
  assert.equal(C.cableBand(1000, 3, 'cu', 'air', 30).beyond, true);
});
test('in-air ratings are higher than conduit', () => {
  assert.ok(C.cableBand(100, 3, 'cu', 'air', 40).min < C.cableBand(100, 3, 'cu', 'conduit', 40).min);
});
test('voltage drop (resistive, 70 C conductor)', () => {
  // 1-ph, 10 A, 20 m, 2.5 mm2 Cu: 2*10*20*7.41*1.2/1000 = 3.5568 V -> 1.546 %
  const v = C.voltageDrop(10, 20, 2.5, 'cu', 1);
  close(v.volts, 3.557, 0.001); close(v.percent, 1.546, 0.001);
  // 3-ph, 26.09 A, 50 m, 10 mm2 Cu: sqrt3*26.09*50*1.83*1.2/1000
  close(C.voltageDrop(26.09, 50, 10, 'cu', 3).volts, Math.sqrt(3) * 26.09 * 50 * 1.83 * 1.2 / 1000, 1e-9);
  assert.equal(C.voltageDrop(10, 20, 3, 'cu', 1), null); // not a standard size
});
test('size for <= 5 % drop grows with length', () => {
  const s = C.sizeForDrop(26.09, 300, 'cu', 3, 5, 10);
  assert.ok(s > 10);
  assert.ok(C.voltageDrop(26.09, 300, s, 'cu', 3).percent <= 5);
});
test('calculate(): 15 kW, 3-phase, pf 0.8, 40 C, conduit, Cu', () => {
  const r = C.calculate({ mode: 'kw', value: 15, phase: 3, pf: 0.8, material: 'cu', install: 'conduit', ambient: 40, length: 30 });
  assert.equal(r.ok, true);
  close(r.ib, 26.09);
  assert.equal(r.breaker.min, 40);
  assert.equal(r.breaker.max, 50);
  assert.equal(r.cable.min, 10); // In 40 A: 10 mm2 = 46 x 0.87 = 40.02 A
  assert.equal(r.cable.max, 16);
  close(r.drop.percent, Math.sqrt(3) * r.ib * 30 * 1.83 * 1.2 / 1000 / 415 * 100, 1e-9);
});
test('calculate(): amps mode and validation', () => {
  const r = C.calculate({ mode: 'amps', value: 20, phase: 1, pf: 1, material: 'al', install: 'conduit', ambient: 30, length: '' });
  assert.equal(r.ok, true); close(r.kw, 4.6); assert.equal(r.breaker.min, 25); assert.equal(r.drop, null);
  assert.deepEqual(C.calculate({ mode: 'kw', value: -1, phase: 3, pf: 0.8 }).errors, ['value']);
  assert.deepEqual(C.calculate({ mode: 'kw', value: 5, phase: 3, pf: 0 }).errors, ['pf']);
  assert.deepEqual(C.calculate({ mode: 'kw', value: 5, phase: 3, pf: 0.8, length: 5000 }).errors, ['length']);
});
