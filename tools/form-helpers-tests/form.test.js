// Unit tests for assets/form-helpers.js. Run: node --test tools/form-helpers-tests/*.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const F = require('../../assets/form-helpers.js');

test('valid GSTINs pass (format + state + check digit)', () => {
  assert.equal(F.validGstin('20AAXHA7677Q1ZD'), true); // ATRICL, Jharkhand
  assert.equal(F.validGstin('27AAPFU0939F1ZV'), true);
  assert.equal(F.validGstin(' 20aaxha7677q1zd '), true); // trims + uppercases
  assert.equal(F.checkGstin('20AAXHA7677Q1ZD').state, 'Jharkhand');
  assert.equal(F.validGstin('20AAAAA0000A1ZG'), true); // example used in messages
});
test('invalid GSTINs report a reason', () => {
  assert.equal(F.checkGstin('').reason, 'empty');
  assert.equal(F.checkGstin('20AAXHA7677Q1Z').reason, 'length');
  assert.equal(F.checkGstin('20AAXHA7677Q1XD').reason, 'format'); // 14th char must be Z
  assert.equal(F.checkGstin('2AAAXHA7677Q1ZD').reason, 'format');
  assert.equal(F.checkGstin('45AAXHA7677Q1ZD').reason, 'state');
  assert.equal(F.checkGstin('20AAXHA7677Q1ZE').reason, 'checksum');
  assert.equal(F.checkGstin('10AAXHA7677Q1ZD').reason, 'checksum'); // Bihar code, wrong check digit
});
test('check character', () => {
  assert.equal(F.gstinCheckChar('20AAXHA7677Q1Z'), 'D');
  assert.equal(F.gstinCheckChar('27AAPFU0939F1Z'), 'V');
});
test('PIN format', () => {
  assert.equal(F.validPin('834001'), true);
  assert.equal(F.validPin('800001'), true);
  assert.equal(F.validPin('034001'), false);
  assert.equal(F.validPin('83400'), false);
  assert.equal(F.validPin('83400a'), false);
});
test('parse PIN API responses (both providers share the shape)', () => {
  const ok = [{ Status: 'Success', PostOffice: [{ Name: 'Ranchi GPO', District: 'Ranchi', State: 'Jharkhand' }] }];
  assert.deepEqual(F.parsePin(ok), { district: 'Ranchi', state: 'Jharkhand', label: 'Ranchi, Jharkhand' });
  assert.equal(F.parsePin([{ Status: 'Error', PostOffice: null }]), null);
  assert.equal(F.parsePin([{ Status: '404', PostOffice: [] }]), null);
  assert.equal(F.parsePin(null), null);
});
