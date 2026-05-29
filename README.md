# Synapse - AI 开发操作系统

<p align="center">
  <img src="https://via.placeholder.com/800x200/6366f1/ffffff?text=Synapse" alt="Synapse Logo" />
</p>

<p align="center">
  <strong>融合 Paseo + Synapse 的 AI 开发操作系统</strong>
</p>

<p align="center">
  <a href="https://github.com/haodafa/Synapse/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License" />
  </a>
  <a href="https://github.com/haodafa/Synapse/stargazers">
    <img src="https://img.shields.io/github/stars/haodafa/Synapse" alt="Stars" />
  </a>
  <a href="https://github.com/haodafa/Synapse/issues">
    <img src="https://img.shields.io/github/issues/haodafa/Synapse" alt="Issues" />
  </a>
</p>

---

## ✨ 核心特性

### 🌍 跨设备控制（继承自 Paseo）

<p>
  <strong>随时随地掌控你的 AI Agent</strong>
</p>

- 🌐 **多端统一** - iOS、Android、桌面、Web、CLI 五大入口
- 🎤 **语音交互** - 解放双手，用语音指挥 AI 工作
- ⚡ **实时响应** - WebSocket 低延迟双向通信
- 🔒 **本地优先** - 所有数据本地执行，无遥测、无追踪

### 👥 团队协作（继承自 Synapse）

<p>
  <strong>让 AI 成为真正的团队成员</strong>
</p>

- 📋 **看板管理** - Kanban 风格的任务面板，像管理团队一样管理 AI
- 🤖 **Agent 拟人化** - AI 有档案、能认领任务、会主动报告阻塞
- 📈 **技能沉淀** - 成功的经验自动变成可复用的团队技能
- 🔄 **完整生命周期** - enqueue → claim → start → complete/fail

### 🔮 高级编排（Synapse 特有）

<p>
  <strong>超越工具，成为 AI 操作系统</strong>
</p>

- 🔀 **跨 Agent 交接** - 无缝的任务交接，让不同 Agent 协作完成复杂任务
- 🔁 **循环修复** - 自动重试直到验收通过，无需人工干预
- 👥 **委员会模式** - 多 Agent 共同诊断，集体智慧决策
- 🧠 **智能技能** - 基于历史成功经验，自动选择最佳执行方案

## 🚀 快速开始

### 安装

```bash
# 克隆项目
git clone https://github.com/haodafa/Synapse.git
cd synapse

# 安装依赖
npm install

# 构建所有包
npm run build

# 链接 CLI
npm link
```

### 启动守护进程

```bash
# 启动统一守护进程
synapse daemon start

# 查看状态
synapse status
```

### 使用示例

```bash
# 🚀 启动 Agent（继承自 Paseo）
synapse run "重构项目的认证模块"

# 📋 创建 Issue（继承自 Synapse）
synapse issue create \
  --title "实现 JWT 认证" \
  --priority high \
  --assignee claude

# 👥 查看工作区
synapse workspace list

# ⚡ 查看运行中的 Agent
synapse ls

# 🤖 创建定时任务
synapse autopilot create \
  --title "每日代码审查" \
  --agent claude \
  --cron "0 9 * * 1-5"
```

## 🎯 适用场景

### 个人开发者

```
✓ 跨设备管理 AI 工作 - 出门用手机查看进度，回家用桌面接管
✓ 语音控制 - 做饭时语音询问进度，解放双手
✓ 本地执行 - 数据不上云，保护隐私
✓ 多 Agent 协作 - 复杂任务交给多个 Agent 并行处理
```

### 研发团队

```
✓ 看板管理 - AI 和人类在同一看板上并肩作战
✓ 技能积累 - 团队经验自动沉淀，新成员快速上手
✓ 任务分配 - 像分配任务给同事一样分配给 AI
✓ 透明协作 - 所有操作可追溯，团队成员实时可见
```

### 企业用户

```
✓ 完全自托管 - 数据完全在本地，满足合规要求
✓ 权限管理 - 细粒度的权限控制
✓ 审计日志 - 完整的操作审计
✓ 私有部署 - 支持企业内部部署
```

## 🏗️ 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                         用户界面                             │
├──────────────┬──────────────────┬─────────────────────────┤
│  CLI         │  Web (Next.js)   │  Mobile (Expo)          │
│  终端命令    │  看板 + 监控     │  iOS + Android          │
├──────────────┴──────────────────┴─────────────────────────┤
│                    Synapse Unified Daemon                  │
│                    (Node.js + Express)                    │
├────────────────────┬───────────────────────────────────────┤
│   Paseo Engine     │        Synapse Engine                │
│   Agent 管理       │        任务队列                       │
│   Worktree 隔离    │        技能系统                       │
│   跨设备控制       │        团队协作                       │
├────────────────────┴───────────────────────────────────────┤
│                   数据存储层                                │
│   PostgreSQL + pgvector    │    本地文件系统               │
└─────────────────────────────────────────────────────────────┘
```

## 📦 核心模块

| 模块 | 描述 | 技术栈 |
|------|------|--------|
| **protocol** | 共享协议和类型定义 | TypeScript, Zod |
| **client** | 守护进程客户端 SDK | TypeScript |
| **unified-daemon** | 统一守护进程核心 | Node.js, Express, WebSocket |
| **cli** | 命令行工具 | Commander.js |
| **web** | Next.js Web UI | Next.js 16, React 19 |
| **app** | Expo 移动端 | React Native, Expo |
| **desktop** | Electron 桌面端 | Electron |
| **core** | 核心业务逻辑 | TypeScript |
| **ui** | UI 组件库 | React |

## 🛠️ 命令参考

### Agent 管理

```bash
synapse ls                    # 列出运行中的 Agent
synapse run "任务描述"         # 启动新 Agent
synapse attach <id>            # 附加到 Agent 输出
synapse logs <id>              # 查看 Agent 日志
synapse stop <id>              # 停止 Agent
synapse send <id> "消息"       # 向 Agent 发消息
synapse inspect <id>           # 查看 Agent 详情
synapse wait <id>              # 等待 Agent 完成
```

### Issue 管理

```bash
synapse issue list            # 列出 Issue
synapse issue create          # 创建 Issue
synapse issue get <id>        # 获取 Issue 详情
synapse issue update <id>     # 更新 Issue
synapse issue assign <id>     # 分配 Issue
synapse issue status <id>     # 修改状态
synapse issue comment add     # 添加评论
```

### 工作区和项目

```bash
synapse workspace list        # 列出工作区
synapse workspace switch <id> # 切换工作区
synapse project create        # 创建项目
synapse project list          # 列出项目
```

### 自动化

```bash
synapse autopilot list        # 列出 Autopilot
synapse autopilot create     # 创建 Autopilot
synapse autopilot trigger     # 触发执行
synapse autopilot runs        # 查看运行历史
```

### 高级编排

```bash
# 任务交接
synapse orchestration handoff <from> <to>

# 循环修复直到验收通过
synapse orchestration loop <agent-id> --criteria acceptance.txt

# 委员会模式（多 Agent 诊断）
synapse orchestration committee "修复安全问题" \
  --agents claude,codex,gemini \
  --perspectives security,performance,maintainability

# 顾问咨询
synapse orchestration advisor "如何优化数据库查询"
```

## 🌟 与其他工具的对比

| 特性 | Synapse | 仅 Paseo | 仅 Synapse |
|------|---------|---------|-----------|
| 跨设备控制 | ✅ | ✅ | ❌ |
| 团队协作 | ✅ | ❌ | ✅ |
| 看板管理 | ✅ | ❌ | ✅ |
| 语音控制 | ✅ | ✅ | ❌ |
| Worktree 隔离 | ✅ | ✅ | ❌ |
| 技能沉淀 | ✅ | ❌ | ✅ |
| 多 Agent 编排 | ✅ | ✅ | ❌ |
| Issue 管理 | ✅ | ❌ | ✅ |
| 本地优先 | ✅ | ✅ | ❌ |

## 📚 文档

- [开发指南](docs/DEVELOPMENT.md) - 完整的开发文档
- [特性清单](docs/FEATURES.md) - 所有功能的详细列表
- [API 参考](docs/API.md) - REST API 和 WebSocket API
- [FAQ](docs/FAQ.md) - 常见问题解答

## 🤝 贡献

欢迎贡献代码！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

Apache License 2.0 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Paseo](https://github.com/getpaseo/paseo) - 提供跨设备控制和本地执行技术
- [Synapse](https://github.com/synapse-ai/synapse) - 提供团队协作和技能沉淀方案

## 📬 联系方式

- GitHub Issues: [https://github.com/haodafa/Synapse/issues](https://github.com/haodafa/Synapse/issues)

---

<p align="center">
  <strong>让人类与 AI 一起工作，而不是让人类为 AI 工作</strong>
</p>
