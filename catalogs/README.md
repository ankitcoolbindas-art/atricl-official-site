# ATRICL brand catalogs

This directory contains owner-confirmed manufacturer catalog downloads for the five authorised electrical brands listed on the site. PDFs are deliberately kept out until the owner uploads and confirms them.

## Naming

- Current edition: `{brand-slug}-catalog-current.pdf`
- Previous editions: `{brand-slug}-catalog-YYYY-MM.pdf` or `{brand-slug}-catalog-vN.pdf`
- Keep current PDFs in `current/` and dated/versioned previous PDFs in `archive/`.

Use the exact filenames documented in [`current/README.md`](current/README.md). After a PDF is uploaded, update [`MANIFEST.md`](MANIFEST.md) and the matching card in `../catalogs.html` so the button points to `catalogs/current/...` and has the `download` attribute. Do not add an unauthorised brand or an unconfirmed document.
