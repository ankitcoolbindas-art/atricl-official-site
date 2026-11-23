# CI quality checks (dev-only)

> **Activation step (one-time):** the workflow file is parked at `tools/ci/quality.workflow.yml`
> because the bot's GitHub token cannot push files under `.github/workflows/` (it lacks the
> `workflow` scope). To switch CI on, move it in this PR:
> `git mv tools/ci/quality.workflow.yml .github/workflows/quality.yml` (or create that file in the
> GitHub web editor with the same contents).

Once activated, `.github/workflows/quality.yml` runs on pull requests that touch HTML or assets, and on demand:

- **html-validate** (`tools/ci/html-validate.sh`, config `tools/ci/htmlvalidate.json`): the recommended
  ruleset, with purely stylistic rules switched off (`tel-non-breaking`, trailing whitespace, inline
  style, `<br/>` style) and existing low-risk noise as warnings (raw `&`, implicit button/input type).
  Real errors (broken attributes, missing iframe titles, parser errors) fail the job.
- **Lighthouse CI** (`tools/ci/lighthouserc.json`): serves the repo with a local static server and
  audits a few EN + HI pages. Budgets are **warn-only** and the job is `continue-on-error`, so it
  never blocks a PR. Reports are uploaded as the `lighthouse-report` artifact (not to public storage).
  Vercel previews are behind Vercel SSO, so the default run uses the local server; the manual
  `target_url` input can point at a public URL instead.

Run locally from the repo root:

```
bash tools/ci/html-validate.sh
npx @lhci/cli@0.16 autorun --config=tools/ci/lighthouserc.json
```

Nothing here deploys, changes `vercel.json`, or touches the live site.
