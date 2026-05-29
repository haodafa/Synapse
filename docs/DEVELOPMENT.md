# Synapse 开发指南

## 项目概述

Synapse 是一个融合了 Paseo 和 Synapse 优秀特性的 AI 开发操作系统。它将 Paseo 的跨设备控制能力与 Synapse 的团队协作功能完美结合，为开发团队提供了一个强大、统一的工作平台。

## 核心特性

### 1. 跨设备控制（继承自 Paseo）

- **多端统一入口**：iOS、Android、桌面、Web、CLI
- **语音控制**：通过 Expo 实现的移动端语音指令
- **实时监控**：WebSocket 实时查看 Agent 进度
- **Worktree 隔离**：Git worktree 隔离确保安全

### 2. 团队协作（继承自 Synapse）

- **看板式任务管理**：Kanban 风格的任务面板
- **Agent 拟人化**：Agent 作为团队成员参与协作
- **完整生命周期**：enqueue → claim → start → complete/fail
- **技能沉淀**：成功的任务自动变成可复用技能
- **Squads**：多 Agent 协作团队

### 3. 高级编排（Synapse 特有）

- **跨 Agent 交接**：无缝的任务交接机制
- **循环修复**：自动重试直到验收通过
- **委员会模式**：多 Agent 共同诊断问题
- **技能调用**：基于历史成功经验自动选择最佳方案

## 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                      用户界面层                               │
├─────────────────────────────────────────────────────────────┤
│  CLI (Commander.js)  │  Web (Next.js)  │  Mobile (Expo)  │
└──────────────────────┴─────────────────┴──────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    统一守护进程层                              │
├─────────────────────────────────────────────────────────────┤
│         Node.js + Express + WebSocket Server               │
│         ┌────────────────┐  ┌────────────────┐            │
│         │  Paseo Engine  │  │  Synapse Engine │            │
│         └────────────────┘  └────────────────┘            │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                      数据存储层                              │
├─────────────────────────────────────────────────────────────┤
│     PostgreSQL + pgvector     │     Local File System       │
└──────────────────────────────┴──────────────────────────────┘
```

## 快速开始

### 环境要求

- Node.js >= 20.0.0
- npm >= 10.0.0
- Git
- PostgreSQL 15+ (可选，用于持久化)

### 安装

```bash
# 克隆项目
git clone https://github.com/synapse-ai/synapse.git
cd synapse

# 安装依赖
npm install

# 构建所有包
npm run build
```

### 启动守护进程

```bash
# 启动统一守护进程
synapse daemon start

# 或者使用 Node 直接运行
node packages/unified-daemon/src/daemon.ts
```

### 使用 CLI

```bash
# 查看帮助
synapse --help

# 列出运行中的 Agent
synapse ls

# 启动新 Agent
synapse run "修复项目中的 TypeScript 错误"

# 创建 Issue
synapse issue create --title "实现用户认证" --priority high

# 查看工作区
synapse workspace list

# 列出 Autopilot
synapse autopilot list
```

## 目录结构

```
synapse/
├── packages/
│   ├── protocol/            # 共享协议类型定义
│   │   ├── src/
│   │   │   ├── types.ts    # 核心类型定义
│   │   │   └── index.ts    # 导出
│   │   └── package.json
│   │
│   ├── client/              # 守护进程客户端 SDK
│   │   ├── src/
│   │   │   ├── daemon-client.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── unified-daemon/      # 统一守护进程 ⭐
│   │   ├── src/
│   │   │   ├── daemon.ts    # 主入口
│   │   │   ├── websocket.ts  # WebSocket 服务器
│   │   │   ├── bridge/       # 桥接层
│   │   │   │   ├── websocket.ts
│   │   │   └── types.ts      # 统一类型
│   │   │   ├── paseo/        # Paseo 引擎
│   │   │   └── synapse/      # Synapse 引擎
│   │   └── package.json
│   │
│   ├── cli/                 # 命令行工具 ⭐
│   │   ├── src/
│   │   │   ├── cli.ts        # 主 CLI 入口
│   │   │   ├── commands/     # 命令目录
│   │   │   │   ├── agent/    # Agent 相关命令
│   │   │   │   ├── daemon/   # 守护进程命令
│   │   │   │   ├── synapse/  # Synapse 命令
│   │   │   │   ├── chat.ts
│   │   │   │   ├── loop.ts
│   │   │   │   ├── speech.ts
│   │   │   │   └── worktree.ts
│   │   │   ├── lib/          # 库文件
│   │   │   │   ├── synapse-client.ts  # Synapse 客户端
│   │   │   │   └── config.ts
│   │   │   └── output/       # 输出格式化
│   │   └── package.json
│   │
│   ├── app/                 # Expo 移动端
│   ├── desktop/             # Electron 桌面端
│   ├── web/                 # Next.js Web UI
│   ├── core/                # 核心业务逻辑
│   ├── ui/                  # UI 组件库
│   └── views/               # 视图组件
│
├── scripts/                  # 构建脚本
├── docs/                    # 文档
├── README.md
└── package.json             # 根 workspace 配置
```

## 开发指南

### 添加新的 Agent Provider

1. 在 `packages/protocol/src/types.ts` 中添加 Provider 类型
2. 在 `packages/unified-daemon/src/paseo/providers/` 创建 Provider 适配器
3. 在 CLI 中添加相应的命令
4. 更新文档

### 添加新的 CLI 命令

1. 在 `packages/cli/src/commands/` 创建命令文件
2. 在 `packages/cli/src/cli.ts` 中注册命令
3. 添加相应的帮助文档

### 扩展 Web UI

1. 在 `packages/web/` 中开发 Next.js 页面
2. 使用 `packages/ui/` 中的组件
3. 通过 `packages/client/` 与守护进程通信

## API 参考

### REST API

守护进程在 `http://localhost:8080` 提供以下 API：

#### Agent APIs

```
GET    /api/agents              # 列出所有 Agent
GET    /api/agents/:id          # 获取 Agent 详情
POST   /api/agents/:id/stop      # 停止 Agent
POST   /api/agents/:id/send      # 向 Agent 发送消息
```

#### Issue APIs

```
GET    /api/workspaces/:id/issues           # 列出 Issues
POST   /api/workspaces/:id/issues           # 创建 Issue
GET    /api/workspaces/:id/issues/:id       # 获取 Issue 详情
PATCH  /api/workspaces/:id/issues/:id       # 更新 Issue
POST   /api/workspaces/:id/issues/:id/status # 修改状态
POST   /api/workspaces/:id/issues/:id/assign  # 分配 Issue
```

#### 其他 APIs

```
GET    /api/workspaces          # 工作区列表
GET    /api/workspaces/:id     # 工作区详情
GET    /api/skills              # 技能列表
POST   /api/skills              # 创建技能
GET    /api/worktrees           # Worktree 列表
POST   /api/worktrees           # 创建 Worktree
```

### WebSocket API

通过 `ws://localhost:8080` 连接，支持以下消息类型：

#### Paseo 命名空间

```
paseo.agent:start    # 启动 Agent
paseo.agent:stop     # 停止 Agent
paseo.agent:send     # 发送消息
paseo.logs:subscribe # 订阅日志
```

#### Synapse 命名空间

```
synapse.issue:create   # 创建 Issue
synapse.issue:update   # 更新 Issue
synapse.issue:assign   # 分配 Issue
synapse.run:start      # 启动执行
synapse.autopilot:trigger # 触发 Autopilot
```

#### Synapse 命名空间

```
synapse.cross:handoff    # 跨 Agent 交接
synapse.skills:invoke     # 调用技能
synapse.worktree:create   # 创建 Worktree
synapse.ping              # 心跳检测
```

## 测试

```bash
# 运行所有测试
npm test

# 运行特定包的测试
npm run test --workspace=@synapse/cli

# 运行 e2e 测试
npm run test:e2e
```

## 构建发布

```bash
# 构建所有包
npm run build

# 发布到 npm
npm publish --access public
```

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

Apache 2.0

## 致谢

- [Paseo](https://github.com/getpaseo/paseo) - 提供跨设备控制和本地执行技术
- [Synapse](https://github.com/synapse-ai/synapse) - 提供团队协作和技能沉淀方案
