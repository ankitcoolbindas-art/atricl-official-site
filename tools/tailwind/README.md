# Tailwind build (static, committed output)

The site no longer loads the Tailwind Play CDN at runtime. The CSS is pre-built and committed:

- `assets/tailwind.css`: English pages (root, `blog/`, `le/`)
- `assets/tailwind-hi.css`: Hindi pages (`hi/`, `hi/blog/`), with the Devanagari font stacks

Vercel does not run any build step. After adding or changing Tailwind classes in any HTML, rebuild from the repo root and commit both files:

```
npx tailwindcss@3.4.17 -c tools/tailwind/en.config.js -i tools/tailwind/input.css -o assets/tailwind.css --minify
npx tailwindcss@3.4.17 -c tools/tailwind/hi.config.js -i tools/tailwind/input.css -o assets/tailwind-hi.css --minify
```

If you skip the rebuild, any new class you add will have no styles.
