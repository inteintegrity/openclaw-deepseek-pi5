# JishuShell web-panel deployment

[中文步骤](#中文步骤)

The recommended interactive path is:

**Run the installer → open the board on port 8090 → set your panel password → configure the model → create OpenClaw.**

On a Linux ARM64 board:

```bash
curl -fsSL https://raw.githubusercontent.com/inteintegrity/openclaw-deepseek-pi5/main/scripts/install-jishushell.sh | bash
```

Or, from a clone:

```bash
bash scripts/install-jishushell.sh
```

The entry point downloads an official JishuShell installer from a fixed upstream commit, verifies its SHA-256, and asks it to install JishuShell 0.8.7. The upstream installer prepares Node.js, Docker, Nomad, the agent runtime, and startup services. Administrator privileges, installation choices, and dependency downloads may still be required; one command does not mean unattended setup.

If JishuShell already exists for the current user, the helper displays its version and panel address instead of reinstalling or deleting it. Read-only inspection and installation planning are available:

```bash
bash scripts/install-jishushell.sh --check
bash scripts/install-jishushell.sh --dry-run
```

## Continue in the browser

1. On a PC that can reach the board, open `http://<BOARD_IP>:8090`.
2. Set the panel administrator password on first access.
3. Configure a model provider with your own API key and an available model. A private company gateway also needs its actual API base URL and exact model ID; direct official DeepSeek settings cannot be assumed to match it.
4. Choose **Install Application → OpenClaw**, enter an application name, and create the application.
5. Wait for **Running** and an online Gateway, then complete browser device pairing if requested.
6. Open chat and run the system-report task described in the project.

For a private OpenAI-compatible gateway, JishuShell 0.8.7's local-provider form may not expose every authentication field. Follow the provider configuration supported by that version; this installation helper does not inject company credentials or automatically configure a model. It does not patch agent runtimes or bypass device pairing.

JishuShell and its agent containers have their own lifecycle and data. The optional standalone Compose deployment in this repository uses port 18889 and a separate data volume. Installing the panel does not migrate that volume into a managed application.

## 中文步骤

在 Linux ARM64 板子上执行：

```bash
curl -fsSL https://raw.githubusercontent.com/inteintegrity/openclaw-deepseek-pi5/main/scripts/install-jishushell.sh | bash
```

安装完成后，电脑浏览器打开 `http://<板子IP>:8090`，再依次完成：

1. 首次设置面板管理员密码。
2. 用自己的 API Key 配置模型提供商；公司网关还需要准确的 API 地址和模型 ID。
3. 点击“安装应用”，选择 OpenClaw，填写名称并创建应用。
4. 等待应用运行、Gateway 在线，如提示则完成浏览器设备配对。
5. 在聊天窗口运行系统报告任务。

脚本校验固定来源的官方安装器，并使用 JishuShell 0.8.7 安装选项。运行环境和系统服务由上游安装器准备；过程中可能需要 sudo 密码、安装选项确认和网络下载。管理员密码与 API Key 在网页中由用户自己填写，不由脚本预设。

如果已安装 JishuShell，脚本会复用并显示面板地址，不重装、不删除现有应用。`--check` 检查已安装面板，`--dry-run` 查看上游安装计划。脚本不自动批准设备，也不修改模型鉴权规则。

公司自定义网关的配置字段取决于当前版本，0.8.7 的本地提供商表单可能不能填写全部鉴权字段，不能承诺所有网关都能只靠表单完成配置。独立 Compose 版本仍可作为可选部署方式，使用独立端口和数据卷，不会自动导入到 JishuShell。

## Source and verification boundary

- Upstream installer: `x-aijishu/jishushell`, commit `f6297e0d27491a5565651b5f941cffc4a9296f63`, `install/jishu-install.sh`.
- SHA-256: `160c81ad064eb0a1d5f775775f3cf8922bc234387d29f74d477a186b49ddcf6b`.
- The existing JishuShell 0.8.7 installation and its port-8090 panel were checked on the Pi. Wrapper checks and any installation-plan checks are recorded in `docs/validation.md`.
- A destructive reinstall of the live panel or a complete bare-OS installation is not claimed by these checks.
