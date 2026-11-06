#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
umask 077
mkdir -p backups
archive=$(mktemp "backups/state-$(date -u +%Y%m%dT%H%M%SZ)-XXXXXX.tar.gz")
docker compose stop openclaw
trap 'docker compose start openclaw >/dev/null' EXIT
docker compose run --rm --no-deps --entrypoint tar openclaw -czf - -C /home/node .openclaw </dev/null > "$archive"
gzip -t "$archive"
sha256sum "$archive" > "$archive.sha256"
echo "Backup: $archive (contains private configuration and sessions)"
