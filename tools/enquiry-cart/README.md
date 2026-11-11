# Enquiry cart + UPI (preview)

Local checks for the enquiry cart, shop catalogue and optional UPI advance step.

From the repo root:

```
python3 -m http.server 8002 --bind 127.0.0.1
# in another shell
cd tools/enquiry-cart && npx playwright test
```

The test runner uses the system Chrome at `/usr/bin/google-chrome` when present.

These pages are **not** in `sitemap.xml` yet. Do not merge without owner approval, and do not go live until a real UPI VPA replaces `REPLACE-ME@upi` in `assets/cart.js` (the pay section stays hidden until then).
