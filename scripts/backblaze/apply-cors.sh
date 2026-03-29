#!/usr/bin/env sh
set -eu

if [ "${1:-}" = "" ]; then
  echo "Usage: ./scripts/backblaze/apply-cors.sh YOUR_B2_ACCOUNT_AUTH_TOKEN"
  exit 1
fi

curl https://api.backblazeb2.com/b2api/v2/b2_update_bucket \
  -H "Authorization: $1" \
  -H "Content-Type: application/json" \
  --data-binary "@scripts/backblaze/cors-rules.json"
