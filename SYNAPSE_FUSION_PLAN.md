
# Synapse: Paseo + Multica 融合方案

> 融合 Paseo 跨设备控制 + Multica 团队协作的 AI 开发操作系统

## 产品愿景

Synapse 是一个 AI 原生的团队开发操作系统，它融合：
- **Paseo 的优势**：跨设备远程控制（iOS/Android/Desktop/Web/CLI）、语音交互、Git Worktree 隔离、多 Agent 编排（/paseo-handoff, /paseo-loop）
- **Multica 的优势**：看板式团队协作、Agent 拟人化、技能沉淀系统、完整任务生命周期管理

---

## 一、架构设计

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             User Interface Layer                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Mobile App  │  │   Desktop    │  │     Web      │  │       CLI        │  │
│  │   (Expo)     │  │  (Electron)  │  │  (Next.js)   │  │  (Commander.js)  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
└─────────┼──────────────────┼──────────────────┼───────────────────┼───────────┘
          │ WebSocket        │ WebSocket        │ HTTP + WebSocket  │ WebSocket
          └──────────────────┴──────────────────┴───────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Orchestration Layer                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                 ┌──────────────────────────────────┐                        │
│                 │      Unified Daemon (Node.js)    │                        │
│                 │       ← Paseo daemon +          │                        │
│                 │    Multica daemon integration    │                        │
│                 └──────────────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Persistence Layer                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐      ┌───────────────────────────────────────────┐  │
│  │  Local File DB   │      │            PostgreSQL + pgvector           │  │
│  │  (Paseo-style)   │      │          (Multica-style persistent)       │  │
│  └──────────────────┘      └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Agent Runtime Layer                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐ │
│  │ Claude  │ │  Codex  │ │ OpenCode │ │  Hermes │ │ Gemini  │ │  Cursor  │ │
│  │  Agent  │ │  Agent  │ │  Agent   │ │  Agent  │ │  Agent  │ │  Agent   │ │
│  └─────────┘ └─────────┘ └──────────┘ └─────────┘ └─────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 核心模块职责

| 模块 | 主要功能 | 技术继承 |
|------|----------|----------|
| **Unified Daemon** | 融合 Paseo 的 Agent 进程管理 + Multica 的本地运行时 | Paseo server + Multica daemon |
| **Unified CLI** | 整合两者的 CLI 命令 | Paseo Commander.js + Multica 风格命令 |
| **Web UI** | 看板 + 实时监控 + 技能管理 | Multica Next.js + Paseo UI 组件 |
| **Mobile/Desktop** | 跨设备控制 + 语音 | Paseo Expo/Electron + Multica UI |
| **Database** | PostgreSQL + pgvector 用于持久化团队协作数据，本地文件用于 Agent 存储 | 两者结合 |

---

## 二、文件系统设计

### 融合后的仓库结构

```
/workspace/synapse
├── packages/
│   ├── protocol/          # 共享协议类型 (从 paseo/packages/protocol)
│   ├── client/            # 守护进程客户端 (从 paseo/packages/client)
│   ├── unified-daemon/    # 统一守护进程 (融合 paseo server + multica daemon)
│   │   ├── src/
│   │   │   ├── paseo/     # Paseo 相关核心
│   │   │   ├── multica/   # Multica 相关核心
│   │   │   └── bridge/    # 桥接层
│   │   └── package.json
│   ├── cli/               # 统一 CLI (融合 paseo cli + multica cli)
│   ├── app/               # Expo 移动端 (从 paseo/app，扩展 Multica 功能)
│   ├── desktop/           # Electron 桌面端 (从 paseo/desktop)
│   ├── web/               # Next.js Web UI (从 multica/apps/web)
│   ├── ui/                # 共享 UI 组件 (从 multica/packages/ui)
│   └── core/              # 核心业务逻辑 (从 multica/packages/core)
├── scripts/               # 构建和开发脚本
├── docs/                  # 文档
├── LICENSE                # Apache 2.0 (商业友好)
└── README.md
```

---

## 三、核心功能规划

### Phase 1: 基础融合（最小可行产品）

1. **统一 CLI**
   - 整合 `paseo` 和 `multica` 命令为 `synapse` 命令
   - 支持：`synapse daemon start` / `synapse agent run` / `synapse issue create` / `synapse ls`

2. **统一 Daemon**
   - 基于 Paseo 守护进程架构，扩展 Multica 的任务队列和看板数据结构
   - WebSocket API 同时支持 Paseo 风格和 Multica 风格

3. **基础 Web UI**
   - 复用 Multica Next.js 前端，添加 Paseo 的监控面板
   - 看板视图 + Agent 流视图

### Phase 2: 深度融合

1. **看板式任务分配 + 跨设备监控**
   - 在 Web 看板分配任务，在手机/桌面/CLI 都能实时查看进度

2. **技能沉淀 + Agent 编排结合**
   - `/paseo-handoff` 交接可同时触发 Multica 技能调用
   - 循环修复可复用历史技能

3. **Worktree 隔离 + 任务隔离**
   - 每个 Issue 任务自动分配到独立 Git worktree

4. **语音交互 + 团队协作**
   - 语音命令："把这个 Issue 分配给 Claude"

### Phase 3: 增强功能

1. **Squads 能力 + 委员会模式**
   - `@FrontendTeam` 分配任务，委员会自动诊断问题

2. **Autopilots + 定时任务**
   - 定时循环执行任务（Paseo 调度 + Multica Autopilot）

---

## 四、技术融合策略

### 技术栈统一

| 技术 | 选择 | 原因 |
|------|------|------|
| 主要语言 | TypeScript | 两者都是 TS，便于融合 |
| 后端核心 | Node.js + Go 可选 | Paseo Node.js 更易扩展，Multica Go 性能好 |
| 前端 | Next.js 16 + Expo | Multica Next.js 成熟，Paseo Expo 跨设备 |
| 数据库 | PostgreSQL + pgvector | Multica 的选择，用于技能语义搜索 |
| 构建工具 | Turborepo | Multica 使用，管理 monorepo 高效 |
| 协议 | WebSocket + REST | 两者都使用 |

### 代码复用策略

1. **高度复用**（> 90% 代码可直接用）
   - Paseo: `protocol`, `client`, `app`, `desktop`, `cli` 基础框架
   - Multica: `web` 前端, `core` 核心逻辑, `ui` 组件库

2. **需要修改/重写**
   - Paseo `server` → `unified-daemon`，需要嵌入 Multica 的任务逻辑
   - Multica `server` Go 部分 → 暂保留，但通过桥接层与 Node.js daemon 通信

3. **桥接层**
   - `bridge/` 目录实现 Paseo 事件 ↔ Multica 事件双向映射

---

## 五、实施步骤

### Step 1: 创建融合仓库骨架
1. 初始化新仓库 `synapse`
2. 复制 Paseo 和 Multica 的核心包
3. 设置 Turborepo 构建系统

### Step 2: 统一 CLI
1. 融合 `paseo/packages/cli` 和 `multica` CLI 命令
2. 测试基础命令

### Step 3: 统一 Daemon
1. 基于 Paseo server 构建统一 daemon
2. 添加 Multica 任务队列和看板状态
3. 实现桥接层

### Step 4: 集成 Web UI
1. 基于 Multica web 应用
2. 接入新的统一 daemon API
3. 添加 Paseo 风格的监控面板

### Step 5: 测试和优化
1. 端到端测试
2. 性能优化
3. 文档完善

---

## 六、API 设计

### 统一 WebSocket 协议

融合两者的消息类型，命名空间区分：
- `paseo.*` - Paseo 原生命令
- `multica.*` - Multica 原生命令
- `synapse.*` - 新增融合命令

### 示例消息

```json
{
  "type": "synapse.issue.assigned",
  "payload": {
    "issueId": "mul-123",
    "assignee": "claude",
    "worktree": "/path/to/feature-x",
    "workspaceId": "ws-456"
  }
}
```

---

## 七、风险与挑战

| 风险 | 应对策略 |
|------|----------|
| 代码库过大 | 分阶段实施，先做 MVP，再逐步完善 |
| 两个产品的设计理念差异 | 明确核心职责划分，保持 API 兼容性 |
| 测试覆盖 | 保留两者的原有测试，新增融合测试 |
| 社区生态 | 保持对 Paseo/Multica 社区友好，设计迁移路径 |

---

## 八、进度规划

| 阶段 | 预计时间 | 目标 |
|------|----------|------|
| 架构设计 | 1 天 | 完成本方案 |
| 仓库骨架 | 1 天 | 建立目录结构和构建系统 |
| 统一 CLI | 2 天 | 命令整合完成 |
| 统一 Daemon | 3 天 | 核心功能完成 |
| 集成 Web UI | 3 天 | 看板 + 监控面板上线 |
| 测试优化 | 2 天 | MVP 可用于日常使用 |
| **总计** | **12 天** | **功能 MVP 完成** |

---

## 九、总结

Synapse 不仅仅是 Paseo + Multica 的简单相加，它通过统一的架构和协调的设计，创造了一个更强大的 AI 开发操作系统。它让：
- 个人开发者享受 Paseo 的自由和便利
- 团队享受 Multica 的协作和沉淀
- 两者无缝切换，共同发展
