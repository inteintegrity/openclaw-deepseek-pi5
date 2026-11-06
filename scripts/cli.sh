#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
docker compose exec -T openclaw node /app/openclaw.mjs "$@"
