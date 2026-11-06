# OpenClaw + DeepSeek on Raspberry Pi 5

Install the **JishuShell web panel**, open your board on port **8090**, and manage OpenClaw from the browser.

[中文说明](README.zh-CN.md)

## One-command web-panel setup

On a Linux ARM64 board with Bash, curl, network access, and sudo privileges:

```bash
curl -fsSL https://raw.githubusercontent.com/inteintegrity/openclaw-deepseek-pi5/main/scripts/install-jishushell.sh | bash
```

Or run `bash scripts/install-jishushell.sh` from a clone of this repository.

The helper verifies a fixed official installer and asks it to install JishuShell 0.8.7. The upstream installer prepares Node.js, Docker, Nomad, the OpenClaw runtime, and system services. It may ask for sudo credentials and installation choices. On an existing installation, the helper displays the current version and panel address without reinstalling or deleting applications.

## Continue in the browser

Open:

```text
http://<BOARD_IP>:8090
```

1. Set your administrator password on first access.
2. Configure a model provider using your own API key and available model ID.
3. Choose **Install Application → OpenClaw**, enter an application name, and create the application.
4. Wait for **Running** and an online Gateway. Complete browser device pairing if requested.
5. Use the embedded chat to run the report task below.

The web panel manages the application containers. The panel itself is installed as a host service by the official installer. Model credentials and the first administrator password are supplied by the operator, rather than embedded in an installation script.

For company gateways, use the actual API endpoint and model identifier. Provider-field support depends on the JishuShell version; an authenticated private gateway may need additional provider configuration. See the [complete web-panel guide](docs/jishushell.md).

## Run a real tool task

Ask in chat:

> Inspect this OpenClaw container's architecture and Node.js version using your tools. Save the actual results to demo/system-report.md, read it back, and present a short table. Do not access credentials or network services.

Expand the tool activity to inspect execution, writing, and reading. The report describes the container. Prompts and tool results are sent to your configured model gateway for inference.

## Inspect the installation

From a clone:

```bash
bash scripts/install-jishushell.sh --check
bash scripts/install-jishushell.sh --dry-run
```

`--check` inspects the existing panel; `--dry-run` verifies the upstream installer and displays its plan. Neither is a claim of a complete fresh-OS installation test. Exact checks are documented in the [validation record](docs/validation.md).

## Optional standalone Compose deployment

For a direct container deployment without the management panel, the repository also includes the independently tested Dockerfile, Compose configuration, `.env.example`, persistent storage, automated tool verification, and backup/recovery scripts:

- [English Compose guide](docs/compose.md)
- [中文 Compose 说明](docs/compose.zh-CN.md)

This path uses port 18889 and its own data volume. Its startup and verification commands are separate from JishuShell-managed instances.

## Source and tests

The JishuShell entry point downloads the official installer at a pinned commit and checks its SHA-256. No upstream installer code, API keys, or account credentials are bundled here. The optional Compose path uses a digest-pinned official OpenClaw image.

```bash
npm test
```

CI checks configuration behavior, shell syntax, installer help, and Compose syntax. Deployment helpers are MIT licensed; upstream software retains its own licenses.
