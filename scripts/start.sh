#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
[[ -f .env ]] || { echo 'Copy .env.example to .env and configure your model endpoint first.' >&2; exit 1; }
docker compose version >/dev/null
buildx_info=$(docker buildx version 2>/dev/null || true)
if [[ $buildx_info =~ ([0-9]+)\.([0-9]+)\. ]] && (( BASH_REMATCH[1] > 0 || BASH_REMATCH[2] >= 17 )); then
  :
else
  # Compose's modern builder needs buildx >=0.17; Debian's older plugin can use the classic builder.
  export DOCKER_BUILDKIT=0
fi
docker compose up -d --build --wait --wait-timeout 240
echo 'OpenClaw is healthy. Run bash scripts/dashboard.sh for the browser login URL.'
