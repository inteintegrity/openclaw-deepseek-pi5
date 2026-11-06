# OpenClaw + DeepSeek on Raspberry Pi 5

Run a persistent OpenClaw agent with an OpenAI-compatible DeepSeek gateway using Docker Compose. Clone this repository, configure your API, and start the application. **JishuShell is not required.**

[中文说明](README.zh-CN.md)

## What is included

- An official OpenClaw 2026.10.10 image pinned to its multi-platform manifest digest.
- Automatic first-run configuration and a persistent, generated Gateway token.
- A persistent data volume for sessions, workspace files, and browser pairing.
- A real verification task: execute commands, write a report, read it back, and compare it with the running container.
- Start, CLI, login-link, verification, and consistent-backup helpers.

The agent and tools run in the container. The configured gateway performs model inference and receives prompts and tool results. This repository provides deployment glue; OpenClaw and the model are upstream software/services.

## Requirements

- 64-bit Linux on Raspberry Pi 5, Docker Engine, and Docker Compose v2.
- A working OpenAI-compatible model API, API key, and exact model ID.
- Network access to Docker Hub for the first image download and to your model API.
- A few GB of free storage for the image and application state.

Only Pi 5 ARM64 is hardware-tested in this project. The official base-image manifest also includes other architectures; this is not a hardware-validation claim for every reComputer R Series device.

## Start

```bash
git clone https://github.com/inteintegrity/openclaw-deepseek-pi5.git
cd openclaw-deepseek-pi5
cp .env.example .env
```

Edit `.env` and replace `DEEPSEEK_BASE_URL`, `DEEPSEEK_API_KEY`, and `DEEPSEEK_MODEL` with your own values. The base URL is an API endpoint such as a `/v1` endpoint, not a dashboard URL. For an approved private LAN gateway, explicitly set `ALLOW_PRIVATE_NETWORK=true`.

```bash
bash scripts/start.sh
```

The script builds a small layer on the fixed official image and waits for health. It does not build OpenClaw from source or install Node.js on the host. Standard Docker Compose is also supported:

```bash
docker compose up -d --build --wait --wait-timeout 240
```

On hosts with no buildx or buildx older than 0.17, use the start helper; it selects the classic builder supported by the tested Docker Engine. Direct Compose builds need a compatible builder.

## Open the application

The default host binding is **127.0.0.1:18889**. On the Pi's desktop, open `http://localhost:18889`. To use a PC browser, run this on the PC, replacing the SSH user and board address:

```bash
ssh -N -L 18889:127.0.0.1:18889 <SSH_USER>@<BOARD_IP>
```

Keep the tunnel open and visit `http://localhost:18889` on the PC. On the Pi, obtain the private login link with:

```bash
bash scripts/dashboard.sh
```

Open the displayed link in the intended browser. If OpenClaw requests browser approval, inspect pending devices and approve **only the request shown in that browser**:

```bash
bash scripts/cli.sh devices list
bash scripts/cli.sh devices approve <REQUEST_ID>
```

Pairing is an operator step. This repository never automatically approves a browser or disables device authentication. The default local binding and SSH tunnel do not require a reverse proxy or JishuShell compatibility patches.

## Use the demo

In the chat UI, ask:

> Inspect this OpenClaw container's architecture and Node.js version using your tools. Save the actual results to demo/system-report.md, read it back, and present a short table. Do not access credentials or network services.

Expand the activity group to see the tool operations. The saved file is in `/home/node/.openclaw/workspace/demo/` inside the persistent volume. It describes the container, not a full host hardware inventory.

To run an automated model-and-tool check:

```bash
bash scripts/verify.sh
```

The check creates a unique verification task, requires a successful agent result, reads the actual saved file, and compares its ID, Node.js version, and architecture with the running container. It makes real model calls and consumes your provider quota. Inspect the printed session ID before retrying a failed/timeout run.

## Configuration

| Variable | Purpose |
| --- | --- |
| `DEEPSEEK_BASE_URL` | OpenAI-compatible API base URL |
| `DEEPSEEK_API_KEY` | Your model API key; never commit `.env` |
| `DEEPSEEK_MODEL` | Model identifier exposed by that gateway |
| `ALLOW_PRIVATE_NETWORK` | Explicit permission for an approved LAN API; default `false` |
| `HOST_PORT` | Host port; default `18889` |
| `BIND_ADDRESS` | Host interface; default `127.0.0.1` |
| `PUBLIC_ORIGIN` | Exact browser origin; default `http://localhost:18889` |
| `OPENCLAW_GATEWAY_TOKEN` | Optional explicit token, at least 32 characters; otherwise generated and retained |

After changing `.env`, run `bash scripts/start.sh` again. A generated Gateway token survives container recreation. The API key remains an environment reference in the generated config; `.env` and backups are private.

If you deliberately use direct LAN access, change `BIND_ADDRESS` and `PUBLIC_ORIGIN` to match that deployment and follow OpenClaw's requirements for browser access. Do not make the Gateway public as part of this demo.

## Stop, recreate, and back up

```bash
docker compose down
bash scripts/start.sh
```

`down` removes the container and network while retaining the named state volume. The second command recreates the application with its sessions and workspace intact.

```bash
bash scripts/backup.sh
```

The backup helper stops the Gateway, archives its state, checks gzip integrity, writes a SHA-256 file, and starts the Gateway again. Backups contain private configuration and sessions and are git-ignored.

For backup verification and restore instructions, see [backup and recovery](docs/backup.md). `docker compose down --volumes` deletes the data volume and is intentionally not part of normal recreation instructions.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Invalid configuration on startup | Replace all example API values; inspect `docker compose logs --tail=100 openclaw` |
| LAN model requests rejected | Confirm the exact endpoint is approved and set `ALLOW_PRIVATE_NETWORK=true` |
| Model not found or 401 | Verify the gateway's model ID and API key; a dashboard URL is not an API base URL |
| Browser cannot connect | Check service health, SSH tunnel, local port conflicts, and `PUBLIC_ORIGIN` |
| Browser approval screen | Approve its specific pending device request using the CLI; keep authentication enabled |
| First download fails | Check the official registry route; the Dockerfile pins an immutable official manifest |

## Tests and validation

No npm packages are needed to test the deployment configuration:

```bash
npm test
```

Hardware evidence and the exact checks performed are recorded in [validation](docs/validation.md). CI checks configuration behavior, shell syntax, and Compose syntax; it does not claim to test your private API or browser pairing.

Deployment code is MIT licensed. OpenClaw and software in its official image retain their respective upstream licenses.
