#!/usr/bin/env bash
# Validate the site's HTML (EN + HI). Errors fail; stylistic rules are off or warnings.
# Usage (repo root): bash tools/ci/html-validate.sh
set -euo pipefail
shopt -s nullglob
files=( *.html blog/*.html tools/*.html hi/*.html hi/blog/*.html hi/tools/*.html )
echo "Validating ${#files[@]} HTML files"
npx --yes html-validate@11 --config tools/ci/htmlvalidate.json "${files[@]}"
