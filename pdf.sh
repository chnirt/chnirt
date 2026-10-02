#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

PDF_OPTS_RESUME='{"format":"A4","margin":{"top":"16mm","right":"14mm","bottom":"16mm","left":"14mm"}}'
PDF_OPTS_COVER='{"format":"A4","margin":{"top":"20mm","right":"20mm","bottom":"20mm","left":"20mm"}}'

if ! command -v npx >/dev/null 2>&1; then
  echo "npx not found. Install Node.js first." >&2
  exit 1
fi

if [[ ! -f README.md ]]; then
  echo "README.md not found" >&2
  exit 1
fi

if [[ ! -f COVER_LETTER.md ]]; then
  echo "COVER_LETTER.md not found" >&2
  exit 1
fi

# md-to-pdf needs Puppeteer's Chrome; install if missing
if [[ ! -d "${HOME}/.cache/puppeteer" ]] || ! find "${HOME}/.cache/puppeteer" -type f -name chrome -print -quit 2>/dev/null | grep -q .; then
  echo "Installing Puppeteer Chrome..."
  npx puppeteer browsers install chrome
fi

echo "Generating resume PDF..."
npx --yes md-to-pdf README.md --pdf-options "$PDF_OPTS_RESUME"

echo "Generating cover letter PDF..."
npx --yes md-to-pdf COVER_LETTER.md --pdf-options "$PDF_OPTS_COVER"

echo "Created:"
echo "  $(pwd)/README.pdf"
echo "  $(pwd)/COVER_LETTER.pdf"
