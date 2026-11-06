# 在树莓派 5 上部署 OpenClaw + DeepSeek

一条命令安装 **JishuShell 管理面板**，浏览器打开板子 **8090 端口**，再通过网页配置和运行 OpenClaw。

## 一键安装管理面板

在具备 Bash、curl、网络连接和 sudo 权限的 Linux ARM64 板子上执行：

```bash
curl -fsSL https://raw.githubusercontent.com/inteintegrity/openclaw-deepseek-pi5/main/scripts/install-jishushell.sh | bash
```

也可以下载本仓库后运行 `bash scripts/install-jishushell.sh`。

脚本会校验固定来源的官方安装器，并使用 JishuShell 0.8.7 安装选项。Node.js、Docker、Nomad、OpenClaw 运行时和系统服务由上游安装器准备。过程中可能需要 sudo 密码和安装选项确认。如果已经安装，脚本会显示当前版本和面板地址，不重装、不删除应用。

## 在浏览器中继续

电脑浏览器打开：

```text
http://<板子IP>:8090
```

1. 首次访问时设置管理员密码。
2. 使用自己的 API Key 和可用模型 ID 配置模型提供商。
3. 点击“安装应用”，选择 OpenClaw，填写名称并创建应用。
4. 等待“运行中”和 Gateway 在线，如提示则完成浏览器设备配对。
5. 在内嵌聊天窗口运行下面的系统报告任务。

面板通过 Docker 管理应用容器，JishuShell 面板自身由官方安装器配置为宿主机服务。管理员密码和模型密钥由用户填写，不预置在脚本中。

公司网关需要实际 API 地址和准确模型 ID，能否完全通过表单配置取决于当前版本；有鉴权的内网网关可能需要补充提供商设置。完整步骤见 [JishuShell 网页面板部署说明](docs/jishushell.md)。

## 运行真实工具任务

在聊天中输入：

> 使用工具检查当前 OpenClaw 容器的架构和 Node.js 版本。把实际结果保存到 demo/system-report.md，再读回校验，并用简短表格展示。不要读取凭据或访问网络服务。

展开工具活动记录，查看命令执行、文件写入和读回过程。报告描述的是容器环境；提示词和工具结果会发送到配置的模型网关完成推理。

## 检查安装状态

下载仓库后可运行：

```bash
bash scripts/install-jishushell.sh --check
bash scripts/install-jishushell.sh --dry-run
```

`--check` 检查已安装面板，`--dry-run` 校验官方安装器并显示计划。它们不代表已完成全新操作系统上的安装测试，实际检查范围见[验证记录](docs/validation.md)。

## 可选：独立 Compose 部署

仓库仍保留已经单独验证的 Dockerfile、Compose 配置、`.env.example`、持久化存储、自动工具验证和备份恢复脚本：

- [中文 Compose 说明](docs/compose.zh-CN.md)
- [English Compose guide](docs/compose.md)

该路径使用 18889 端口和独立数据卷，启动与验证脚本用于独立容器，不直接操作 JishuShell 管理的应用。

## 来源与测试

JishuShell 入口从官方仓库固定提交下载安装器，并检查 SHA-256。本仓库不打包上游安装器，不包含 API Key 或账号密码。独立 Compose 方案使用固定摘要的官方 OpenClaw 镜像。

```bash
npm test
```

CI 检查配置逻辑、脚本语法、安装入口帮助和 Compose 语法。部署脚本采用 MIT 许可证，上游软件保留各自许可证。
