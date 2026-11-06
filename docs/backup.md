# Backup and recovery / 备份与恢复

`bash scripts/backup.sh` stops the service before archiving `/home/node/.openclaw`, validates gzip structure, and creates a SHA-256 sidecar. It restarts the service even when archiving fails. Keep `.env` separately in a private location; the archive does not replace your model API credentials.

Check an archive without restoring it:

```bash
sha256sum -c backups/state-<TIMESTAMP>.tar.gz.sha256
gzip -t backups/state-<TIMESTAMP>.tar.gz
```

Restore only an archive you created and trust. Restoration replaces files in the current state directory; back up that state first. From the same Compose project:

```bash
docker compose stop openclaw
docker compose run --rm --no-deps --entrypoint tar openclaw \
  -xzf - -C /home/node < backups/state-<TIMESTAMP>.tar.gz
docker compose up -d --wait --wait-timeout 240
```

Use an empty data volume for a full rollback. Extracting over an existing volume overlays files and does not remove files absent from the archive. Creating a second checkout with a different Compose project name (`docker compose -p recovery ...`) provides an isolated volume for recovery testing; avoid reusing the live host port.

The archive contains Gateway credentials, sessions, browser identities, and workspace data. Do not upload it to GitHub or include it in screenshots. Do not use a state archive from a newer OpenClaw version with an older runtime without following upstream migration/rollback guidance.

中文：备份前会停机，归档后校验并重新启动。`.env` 应单独私下保存。恢复会覆盖同名文件，应先备份当前状态；要完整回退，使用独立或空的数据卷，避免覆盖式解包后残留新文件。备份包含凭据和会话，不能公开发布。
