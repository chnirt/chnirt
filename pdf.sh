#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if [[ ! -f README.md ]]; then
  echo "README.md not found" >&2
  exit 1
fi

if command -v npx >/dev/null 2>&1; then
  npx --yes md-to-pdf README.md \
    --pdf-options '{"format":"A4","margin":{"top":"16mm","right":"14mm","bottom":"16mm","left":"14mm"}}'
else
  echo "npx not found. Install Node.js first." >&2
  exit 1
fi

echo "Created: $(pwd)/README.pdf"
