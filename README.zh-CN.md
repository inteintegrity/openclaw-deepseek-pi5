# 在树莓派 5 上部署 OpenClaw + DeepSeek

使用 Docker Compose 运行 OpenClaw，并接入兼容 OpenAI 接口的 DeepSeek 网关。下载仓库、填写自己的 API 配置后即可启动，**无需 JishuShell**。

## 仓库内容

- 固定版本、固定镜像摘要的官方 OpenClaw 2026.10.10 运行环境。
- 首次启动自动生成配置和 Gateway token，重建容器后保留身份。
- 用于会话、工作区文件和浏览器配对的持久化数据卷。
- 真实工具验证：执行系统命令、写入报告、读回报告，并核对实际运行环境。
- 启动、登录链接、CLI、验证和停机备份脚本。

智能体和工具在容器内运行，模型推理通过你配置的 API 完成，提示词和工具结果会发送到该网关。本仓库提供部署代码，OpenClaw 和模型服务本身来自上游。

## 环境要求

- 树莓派 5 上的 64 位 Linux、Docker Engine、Docker Compose v2。
- 可用的 OpenAI 兼容 API 地址、API Key 和准确的模型 ID。
- 首次安装时能访问 Docker Hub，运行时能访问模型网关。
- 预留数 GB 存储空间，用于镜像和应用数据。

本项目的实机验证范围为 Pi 5 ARM64，不据此声称所有 reComputer R 系列设备均已逐一测试。

## 下载并启动

```bash
git clone https://github.com/inteintegrity/openclaw-deepseek-pi5.git
cd openclaw-deepseek-pi5
cp .env.example .env
```

编辑 `.env`，填写自己的 `DEEPSEEK_BASE_URL`、`DEEPSEEK_API_KEY` 和 `DEEPSEEK_MODEL`。Base URL 必须是实际 API 地址，例如以 `/v1` 结尾的接口，不是控制台地址。接入经过管理员批准的内网网关时，显式设置 `ALLOW_PRIVATE_NETWORK=true`。

```bash
bash scripts/start.sh
```

脚本基于固定的官方镜像构建很小的部署层，并等待健康检查通过，不会在宿主机安装 Node.js，也不需要从源码编译 OpenClaw。也可直接使用：

```bash
docker compose up -d --build --wait --wait-timeout 240
```

如果没有 buildx 或版本低于 0.17，请使用启动脚本；它会选择实测 Docker Engine 支持的经典构建器。直接使用 Compose 构建需要兼容的构建插件。

## 打开网页

默认只绑定板子的 **127.0.0.1:18889**。在板子桌面上可以直接打开 `http://localhost:18889`。若使用电脑浏览器，在电脑上运行下列命令，将用户名和板子地址替换为自己的：

```bash
ssh -N -L 18889:127.0.0.1:18889 <SSH_USER>@<BOARD_IP>
```

保持隧道运行，然后在电脑浏览器打开 `http://localhost:18889`。在板子上获取登录链接：

```bash
bash scripts/dashboard.sh
```

在目标浏览器打开输出的私有链接。如界面要求“批准此浏览器”，先查看待配对设备，再批准**该浏览器显示的准确请求**：

```bash
bash scripts/cli.sh devices list
bash scripts/cli.sh devices approve <REQUEST_ID>
```

设备配对由操作者完成。脚本不自动批准浏览器，也不关闭设备鉴权。默认本地端口和 SSH 隧道方案无需反向代理或 JishuShell 补丁。

## 运行 demo

在聊天框中输入：

> 使用工具检查当前 OpenClaw 容器的架构和 Node.js 版本。把实际结果保存到 demo/system-report.md，再读回校验，并用简短表格展示。不要读取凭据或访问网络服务。

展开活动记录，查看工具实际做了什么。报告保存在持久化数据卷内的 `/home/node/.openclaw/workspace/demo/`，描述的是容器环境，不是宿主机的完整硬件清单。

自动验证模型调用和工具执行：

```bash
bash scripts/verify.sh
```

验证脚本为每次运行创建唯一任务，检查智能体返回成功，再读取真实文件，核对验证 ID、Node.js 版本和架构。它会实际调用模型并消耗 API 配额。运行超时或失败后，先检查输出的会话 ID，再决定是否重试。

## 配置项

| 变量 | 用途 |
| --- | --- |
| `DEEPSEEK_BASE_URL` | OpenAI 兼容 API 的 Base URL |
| `DEEPSEEK_API_KEY` | 模型密钥，不要提交 `.env` |
| `DEEPSEEK_MODEL` | 网关实际提供的模型 ID |
| `ALLOW_PRIVATE_NETWORK` | 是否允许经过批准的局域网 API，默认 `false` |
| `HOST_PORT` | 宿主机端口，默认 `18889` |
| `BIND_ADDRESS` | 宿主机监听地址，默认 `127.0.0.1` |
| `PUBLIC_ORIGIN` | 浏览器实际使用的源地址，默认 `http://localhost:18889` |
| `OPENCLAW_GATEWAY_TOKEN` | 可选，手动设置时至少 32 字符；留空则首次自动生成并保留 |

修改 `.env` 后重新执行 `bash scripts/start.sh`。自动生成的 Gateway token 不会因为重建容器而改变。生成的配置中使用环境变量引用模型密钥；`.env` 和备份均应私下保存。

如确需直接通过局域网访问，应主动调整 `BIND_ADDRESS` 和 `PUBLIC_ORIGIN`，并满足 OpenClaw 的浏览器访问要求。此 demo 不包含公网暴露操作。

## 停止、重建和备份

```bash
docker compose down
bash scripts/start.sh
```

`down` 删除容器和网络，但保留命名数据卷；重新启动后，会话与工作区仍在。

```bash
bash scripts/backup.sh
```

备份脚本会停止 Gateway，打包状态目录，检查 gzip 完整性并生成 SHA-256 文件，然后重新启动。备份包含私有配置和会话，已从 Git 中忽略。

校验与恢复操作见[备份和恢复](docs/backup.md)。`docker compose down --volumes` 会删除数据卷，因此不属于日常重建步骤。

## 常见问题

| 现象 | 检查方式 |
| --- | --- |
| 启动时报配置错误 | 替换全部示例 API 值，查看 `docker compose logs --tail=100 openclaw` |
| 内网模型请求被拒绝 | 确认接口经过批准，再设置 `ALLOW_PRIVATE_NETWORK=true` |
| 模型不存在或返回 401 | 核对准确模型 ID、密钥和 API 地址 |
| 浏览器无法连接 | 检查服务健康、SSH 隧道、端口占用和 `PUBLIC_ORIGIN` |
| 要求批准浏览器 | 使用 CLI 核对并批准具体请求，保留鉴权机制 |
| 首次下载失败 | 检查官方镜像源的网络连通性；Dockerfile 已固定官方镜像摘要 |

## 测试与验证

配置逻辑测试无需安装 npm 依赖：

```bash
npm test
```

实机验证记录和实际执行的检查见[验证记录](docs/validation.md)。CI 检查配置逻辑、脚本语法和 Compose 语法，不声称验证你的私有 API 或代为完成浏览器配对。

本仓库的部署代码采用 MIT 许可证。OpenClaw 及官方镜像中的软件保留各自的上游许可证。
