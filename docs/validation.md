# Validation record

Verified on November 6, 2026. Earlier JishuShell results are not counted as evidence for this independent deployment.

## Environment

| Item | Observed value |
| --- | --- |
| Hardware | Raspberry Pi 5 Model B Rev 1.1, 16 GB RAM |
| Host OS / architecture | Debian GNU/Linux 13, aarch64 |
| Docker Engine | 26.1.5+dfsg1 |
| Docker Compose | v2.40.3 |
| Existing Debian buildx | 0.13.1; the start helper selected the classic builder |
| OpenClaw official image | 2026.10.10 |
| Official multi-platform manifest | `sha256:1e5ee6c7d02d5b5f64f9cf26a30c7ef7d4ec292f0d25fa590f4b7e103e8bf799` |
| Container Node.js | v24.22.1 |
| Model route | Operator-provided OpenAI-compatible DeepSeek LAN gateway |

The test used a new Compose project and new named data volume on the existing Pi. It did not use JishuShell's state, model proxy, patched templates, or locally modified OpenClaw image. Docker/Compose installation and OS flashing are prerequisites, not part of the clean-state claim.

## Checks performed

| Check | Result |
| --- | --- |
| Config unit tests | 7 passed |
| Bash script syntax | Passed |
| `docker compose config --quiet` | Passed |
| Fresh image build and fresh volume startup | Healthy |
| Actual DeepSeek agent task | Passed |
| Actual report file matches unique task ID, Node version, and architecture | Passed twice, including after recreation |
| `docker compose down` followed by the default `scripts/start.sh` | Passed; report retained |
| Generated token retained across recreation | Passed; compared hashes without disclosing the token |
| `scripts/backup.sh` | Passed; gzip integrity and SHA-256 checked |
| Restore into an isolated project and data volume | Healthy; saved report present |
| Recovery test resources | Removed after validation |
| Gateway `/healthz` | HTTP 200 |
| Control UI HTML and entry JavaScript | HTTP 200 |

The verification checks actual files produced by an agent task, not only HTTP connectivity. It does not assert that every OpenClaw feature or external integration works.

## Limits

- Browser pairing remains enabled and requires explicit operator approval. No device was automatically approved by this repository's tests.
- API credentials and private gateway addresses are not included in the repository or these records.
- Other reComputer R Series hardware, a complete OS reinstall, public HTTPS hosting, Feishu/WeChat, vision input, and local-model inference were not tested.
- The local-binding/SSH-tunnel workflow is the documented access path. Direct public exposure is outside scope.
