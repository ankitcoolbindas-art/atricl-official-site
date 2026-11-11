const { test, expect } = require('@playwright/test');
const fs = require('fs');

const SHOT = process.env.SHOT_DIR || '/workspace';

test.describe.configure({ mode: 'serial' });

test('enquiry cart, shop, WhatsApp/email, UPI hide, EN+HI', async ({ page, context, baseURL }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/Failed to load resource|gtag|googletagmanager/.test(m.text())) {
      errors.push(m.text());
    }
  });
  await page.route(/googletagmanager|google-analytics/, (route) => route.abort());

  const opened = [];
  await page.addInitScript(() => {
    window.__opened = [];
    window.open = function (u) { window.__opened.push(u); return { closed: false }; };
    window.confirm = () => true;
  });

  await page.setViewportSize({ width: 390, height: 844 });

  // --- EN switchgear widgets ---
  await page.goto('/products-switchgear.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  await expect(page.locator('.enq-add')).toHaveCount(9);
  await expect(page.locator('.enq-badge')).toBeVisible();
  await expect(page.locator('.enq-fab')).toBeVisible();

  const mcc = page.locator('.enq-add').nth(2);
  const opts = await mcc.locator('option').allTextContents();
  expect(opts.length).toBe(2);
  expect(opts[1]).toMatch(/WiNbreak1/);
  await mcc.locator('select').selectOption({ label: opts[1] });
  await mcc.locator('input[type="number"]').fill('3');
  await mcc.locator('button.enq-btn').click();

  let st = await page.evaluate(() => JSON.parse(localStorage.getItem('atricl_enquiry_v1')));
  expect(st).toHaveLength(1);
  expect(st[0].qty).toBe(3);
  expect(st[0].brand).toBe('C&S Electric');
  expect(st[0].family).toBe('MCCBs');
  expect(st[0].name).toMatch(/WiNbreak1/);
  expect(st[0].url).toBe('https://www.atricl.com/products-switchgear.html');

  await expect(page.locator('.enq-badge__n').first()).toHaveText('1');
  await expect(page.locator('.enq-badge').first()).toHaveAttribute('aria-label', /Enquiry cart, 1 item/);
  await expect(mcc.locator('.enq-status')).toContainText('Added to your list');

  const atc = await page.evaluate(() => (window.dataLayer || []).filter((a) => a[0] === 'event' && a[1] === 'add_to_cart').map((a) => a[2]));
  expect(atc.length).toBeGreaterThan(0);
  expect(atc[0].item_brand).toBe('C&S Electric');
  expect(atc[0].item_name).toMatch(/WiNbreak1/);
  expect(atc[0].items[0].quantity).toBe(3);

  await mcc.locator('button.enq-btn').click();
  st = await page.evaluate(() => JSON.parse(localStorage.getItem('atricl_enquiry_v1')));
  expect(st).toHaveLength(1);
  expect(st[0].qty).toBe(6);

  await page.locator('.enq-add').first().locator('select').focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const activeIsBtn = await page.evaluate(() => document.activeElement.classList.contains('enq-btn'));
  expect(activeIsBtn).toBe(true);
  await page.keyboard.press('Enter');
  st = await page.evaluate(() => JSON.parse(localStorage.getItem('atricl_enquiry_v1')));
  expect(st).toHaveLength(2);
  expect(st[1].name).toBe('MCB, RCCB, Isolator & ACCL');

  // --- Siemens RFQ ---
  await page.goto('/products-siemens.html', { waitUntil: 'networkidle' });
  await expect(page.locator('.enq-add--rfq')).toHaveCount(15);
  await expect(page.locator('.enq-add .enq-btn').first()).toHaveText('Add to RFQ');
  await expect(page.locator('.enq-add').first()).toHaveAttribute('aria-label', 'Add Air Circuit Breakers — 3WJ to enquiry list');
  await page.locator('.enq-add .enq-btn').first().click();

  // --- shop page: catalogue + add ---
  await page.goto('/shop.html', { waitUntil: 'networkidle' });
  const cardCount = await page.locator('.shop-card').count();
  expect(cardCount).toBe(29);
  await expect(page.locator('.shop-card__price').first()).toHaveText('Price on request');
  const siemensCards = page.locator('.shop-card--rfq');
  await expect(siemensCards.first().locator('.enq-btn')).toHaveText('Add to RFQ');
  const prices = await page.locator('.shop-card__price').allTextContents();
  expect(prices.every((t) => t === 'Price on request')).toBe(true);
  expect(prices.some((t) => /₹\s*\d|Rs\.?\s*\d/.test(t))).toBe(false);

  const fan = page.locator('.shop-card[data-product-id="khul-bldc-fan"]');
  await fan.locator('input[type="number"]').fill('2');
  await fan.locator('button.enq-btn').click();
  st = await page.evaluate(() => JSON.parse(localStorage.getItem('atricl_enquiry_v1')));
  expect(st.some((it) => it.brand === 'Khul BLDC fan' && it.qty === 2)).toBe(true);

  // --- HI lighting labels ---
  await page.goto('/hi/products-lighting.html', { waitUntil: 'networkidle' });
  await expect(page.locator('.enq-add .enq-btn').first()).toHaveText('इन्क्वायरी में जोड़ें');
  await expect(page.locator('.enq-add .enq-field span').first()).toHaveText('रेंज / आइटम');
  await expect(page.locator('.enq-badge').first()).toHaveAttribute('href', '/hi/cart.html');
  await page.locator('.enq-add .enq-btn').first().click();
  await expect(page.locator('.enq-status').first()).toContainText('जुड़ गया');

  // widgets on all 18 product/brand pages
  const pages = ['products', 'products-switchgear', 'products-lighting', 'products-siemens', 'brands-cs-electric', 'brands-khul-bldc-fan', 'brands-greatwhite', 'brands-ledure-lighting', 'brands-jiva'];
  const counts = [];
  for (const p of pages) {
    for (const pre of ['', 'hi/']) {
      await page.goto(`/${pre}${p}.html`, { waitUntil: 'domcontentloaded' });
      await page.locator('.enq-badge').first().waitFor();
      counts.push(`${pre}${p}:${await page.locator('.enq-add').count()}`);
    }
  }
  expect(counts.some((c) => /:0$/.test(c))).toBe(false);

  // enquiry.html redirects to cart.html
  const resp = await page.goto('/enquiry.html', { waitUntil: 'networkidle' });
  expect(page.url()).toMatch(/\/cart\.html/);

  // --- cart page EN ---
  await page.goto('/cart.html', { waitUntil: 'networkidle' });
  const itemCount = await page.locator('.enq-item').count();
  expect(itemCount).toBeGreaterThanOrEqual(4);
  await expect(page.locator('.enq-item--rfq')).toHaveCount(1);
  await expect(page.locator('.enq-por').first()).toHaveText('Price on request');
  await expect(page.locator('#enq-upi')).toBeHidden();
  const robots = await page.locator('meta[name="robots"]').count();
  expect(robots).toBe(0);

  // qty edit: first item was MCCB qty 6
  await page.locator('.enq-item [data-act="inc"]').first().click();
  st = await page.evaluate(() => JSON.parse(localStorage.getItem('atricl_enquiry_v1')));
  expect(st[0].qty).toBe(7);

  const qi = page.locator('.enq-item input[data-act="qty"]').nth(1);
  await qi.fill('12');
  await qi.blur();
  st = await page.evaluate(() => JSON.parse(localStorage.getItem('atricl_enquiry_v1')));
  expect(st[1].qty).toBe(12);

  await page.locator('.enq-item input[data-act="note"]').first().fill('250A 4P 36kA');
  st = await page.evaluate(() => JSON.parse(localStorage.getItem('atricl_enquiry_v1')));
  expect(st[0].note).toBe('250A 4P 36kA');

  const beforeRemove = await page.locator('.enq-item').count();
  await page.locator('.enq-item [data-act="remove"]').last().click();
  await expect(page.locator('.enq-item')).toHaveCount(beforeRemove - 1);

  // validation
  await page.locator('[data-enq-send="whatsapp"]').click();
  await expect(page.locator('#enq-error')).toContainText(/name/i);
  expect(await page.evaluate(() => document.activeElement && document.activeElement.id === 'enq-name')).toBe(true);

  await page.locator('#enq-name').fill('Ravi Kumar');
  await page.locator('#enq-phone').fill('12345');
  await page.locator('[data-enq-send="whatsapp"]').click();
  await expect(page.locator('#enq-error')).toContainText(/10-digit/);

  await page.locator('#enq-phone').fill('');
  await page.locator('#enq-phone').fill('+91 98765 43210');
  await page.locator('#enq-company').fill('Ravi Electricals');
  await page.locator('#enq-city').fill('Ranchi');
  await page.locator('#enq-gstin').fill('20AAXHA7677Q1ZD');
  await page.locator('#enq-delivery').fill('Kanke Road site');
  await page.locator('#enq-message').fill('Need by next week');

  await page.screenshot({ path: `${SHOT}/cart-preview-mobile-en.png`, fullPage: true });

  await page.locator('[data-enq-send="whatsapp"]').click();
  const wa = await page.evaluate(() => (window.__opened || [])[0] || '');
  expect(wa.startsWith('https://wa.me/918873752101?text=')).toBe(true);
  const txt = decodeURIComponent(wa.split('?text=')[1] || '');
  expect(txt).toMatch(/1\. WiNbreak1 MCCB/);
  expect(txt).toMatch(/Brand: C&S Electric · Range: MCCBs/);
  expect(txt).toMatch(/Qty: 7/);
  expect(txt).toMatch(/Spec: 250A 4P 36kA/);
  expect(txt).toMatch(/Page: https:\/\/www\.atricl\.com\/products-switchgear\.html/);
  expect(txt).toMatch(/\[RFQ\]/);
  expect(txt).toMatch(/Name: Ravi Kumar/);
  expect(txt).toMatch(/Phone: \+91 98765 43210/);
  expect(txt).toMatch(/Company: Ravi Electricals/);
  expect(txt).toMatch(/City: Ranchi/);
  expect(txt).toMatch(/GSTIN: 20AAXHA7677Q1ZD/);
  expect(txt).toMatch(/Delivery location: Kanke Road site/);
  expect(txt).toMatch(/Message: Need by next week/);
  expect(txt).not.toMatch(/₹\s*\d|Rs\.?\s*\d/);
  fs.writeFileSync(`${SHOT}/cart-preview-wa-en.txt`, wa + '\n\n' + txt);

  const leadWa = await page.evaluate(() => (window.dataLayer || []).some((a) => a[0] === 'event' && a[1] === 'generate_lead' && a[2] && a[2].method === 'whatsapp'));
  expect(leadWa).toBe(true);
  await expect(page.locator('#enq-ok')).toContainText(/ready in WhatsApp/);

  await page.locator('[data-enq-send="email"]').click();
  const mail = await page.evaluate(() => (window.__opened || []).find((u) => String(u).startsWith('mailto:')) || '');
  expect(mail.startsWith('mailto:atricl001@gmail.com?subject=')).toBe(true);
  const sub = decodeURIComponent((mail.match(/subject=([^&]*)/) || [])[1] || '');
  const body = decodeURIComponent((mail.match(/body=(.*)$/) || [])[1] || '');
  expect(sub).toMatch(/^Enquiry: \d+ items — Ravi Kumar, Ranchi$/);
  expect(body).toMatch(/^Hello ATRICL/);
  expect(body).not.toMatch(/\*Items/);
  expect(body).toMatch(/GSTIN: 20AAXHA7677Q1ZD/);
  fs.writeFileSync(`${SHOT}/cart-preview-mail-en.txt`, mail + '\n\n' + sub + '\n' + body);

  const leadMail = await page.evaluate(() => (window.dataLayer || []).some((a) => a[0] === 'event' && a[1] === 'generate_lead' && a[2] && a[2].method === 'email'));
  expect(leadMail).toBe(true);

  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('#enq-name')).toHaveValue('Ravi Kumar');
  await expect(page.locator('#enq-gstin')).toHaveValue('20AAXHA7677Q1ZD');

  // desktop screenshots
  // desktop screenshots
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/cart.html', { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${SHOT}/cart-preview-desktop-en.png`, fullPage: true });

  await page.goto('/shop.html', { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${SHOT}/cart-preview-shop-desktop-en.png`, fullPage: true });

  await page.goto('/products-switchgear.html#cs-electric-ranges', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    const el = document.querySelector('#cs-electric-ranges');
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 100);
  });
  await page.screenshot({ path: `${SHOT}/cart-preview-switchgear-desktop-en.png` });

  // UPI hidden by default, shown with ?preview_upi=1 and marked as demo
  await page.goto('/cart.html', { waitUntil: 'networkidle' });
  await expect(page.locator('#enq-upi')).toBeHidden();
  await page.goto('/cart.html?preview_upi=1', { waitUntil: 'networkidle' });
  await expect(page.locator('#enq-upi')).toBeVisible();
  await expect(page.locator('#enq-upi-demo')).toBeVisible();
  await expect(page.locator('#enq-upi-demo')).toContainText(/not a real payment/i);
  const uri0 = await page.locator('#enq-upi-link').getAttribute('href');
  expect(uri0.startsWith('upi://pay?')).toBe(true);
  expect(uri0).toContain('pa=REPLACE-ME%40upi');
  expect(uri0).toContain('pn=ATRICL');
  expect(uri0).not.toMatch(/[?&]am=/);
  await expect(page.locator('#enq-upi-qr svg')).toBeVisible();
  await page.locator('#enq-upi-amount').fill('1500');
  const uri1 = await page.locator('#enq-upi-link').getAttribute('href');
  expect(uri1).toMatch(/[?&]am=1500(?:&|$)/);
  await page.locator('#enq-upi').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOT}/cart-preview-upi-desktop-en.png` });

  // --- HI cart ---
  await page.goto('/hi/cart.html', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-enq-send="whatsapp"]')).toHaveText(/WhatsApp पर भेजें/);
  await expect(page.locator('label[for="enq-name"]')).toContainText('आपका नाम');
  await expect(page.locator('.enq-item [data-act="remove"]').first()).toContainText('हटाएँ');
  await page.screenshot({ path: `${SHOT}/cart-preview-desktop-hi.png`, fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.screenshot({ path: `${SHOT}/cart-preview-mobile-hi.png`, fullPage: true });

  await page.locator('#enq-clear-after').check();
  const before = await page.evaluate(() => window.__opened && window.__opened.slice());
  await page.locator('[data-enq-send="whatsapp"]').click();
  const waHi = await page.evaluate(() => (window.__opened || []).slice(-1)[0] || '');
  const t2 = decodeURIComponent((waHi.split('?text=')[1]) || '');
  expect(t2).toMatch(/^नमस्ते ATRICL/);
  expect(t2).toMatch(/मात्रा: 7/);
  expect(t2).toMatch(/शहर: Ranchi/);
  expect(t2).toMatch(/GSTIN: 20AAXHA7677Q1ZD/);
  fs.writeFileSync(`${SHOT}/cart-preview-wa-hi.txt`, t2);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('atricl_enquiry_v1') || '[]').length)).toBe(0);
  await expect(page.locator('#enq-items')).toContainText(/खाली है/);

  await page.locator('[data-enq-send="email"]').click();
  await expect(page.locator('#enq-error')).toContainText(/कम से कम एक आइटम/);

  await page.goto('/hi/shop.html', { waitUntil: 'networkidle' });
  await expect(page.locator('.shop-card')).toHaveCount(29);
  await expect(page.locator('.shop-card__price').first()).toHaveText('मूल्य अनुरोध पर');
  await page.screenshot({ path: `${SHOT}/cart-preview-shop-mobile-hi.png`, fullPage: true });

  expect(errors, 'no JS errors: ' + JSON.stringify(errors)).toEqual([]);
});
