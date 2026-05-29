# Synapse 特性清单

本文档详细列出了 Synapse 融合的所有功能，包括从 Paseo 和 Multica 继承的功能以及 Synapse 特有的增强功能。

## ✅ 已完成功能

### 1. CLI 命令系统

#### 1.1 Paseo 风格命令

| 命令 | 描述 | 状态 | 来源 |
|------|------|------|------|
| `synapse ls` | 列出运行中的 Agent | ✅ | Paseo |
| `synapse run <prompt>` | 启动新 Agent | ✅ | Paseo |
| `synapse attach <id>` | 附加到 Agent 输出 | ✅ | Paseo |
| `synapse logs <id>` | 查看 Agent 日志 | ✅ | Paseo |
| `synapse stop <id>` | 停止 Agent | ✅ | Paseo |
| `synapse delete <id>` | 删除 Agent | ✅ | Paseo |
| `synapse send <id> <msg>` | 发送消息给 Agent | ✅ | Paseo |
| `synapse inspect <id>` | 查看 Agent 状态 | ✅ | Paseo |
| `synapse wait <id>` | 等待 Agent 完成 | ✅ | Paseo |
| `synapse archive` | 归档完成的 Agent | ✅ | Paseo |
| `synapse import` | 导入现有会话 | ✅ | Paseo |
| `synapse status` | 守护进程状态 | ✅ | Paseo |
| `synapse restart` | 重启守护进程 | ✅ | Paseo |

#### 1.2 Multica 风格命令

| 命令 | 描述 | 状态 | 来源 |
|------|------|------|------|
| `synapse setup` | 一键配置 | ✅ | Synapse |
| `synapse login` | 登录认证 | ✅ | Multica |
| `synapse logout` | 登出 | ✅ | Multica |
| `synapse auth status` | 认证状态 | ✅ | Multica |
| `synapse config show` | 显示配置 | ✅ | Synapse |
| `synapse config set <k> <v>` | 设置配置 | ✅ | Synapse |
| `synapse workspace list` | 列出工作区 | ✅ | Multica |
| `synapse workspace switch <id>` | 切换工作区 | ✅ | Multica |
| `synapse workspace get [id]` | 获取工作区详情 | ✅ | Multica |
| `synapse workspace member list` | 列出成员 | ✅ | Multica |
| `synapse issue list` | 列出 Issue | ✅ | Multica |
| `synapse issue get <id>` | 获取 Issue 详情 | ✅ | Multica |
| `synapse issue create` | 创建 Issue | ✅ | Multica |
| `synapse issue update <id>` | 更新 Issue | ✅ | Multica |
| `synapse issue assign <id>` | 分配 Issue | ✅ | Multica |
| `synapse issue status <id> <status>` | 修改状态 | ✅ | Multica |
| `synapse issue comment list` | 列出评论 | ✅ | Multica |
| `synapse issue comment add` | 添加评论 | ✅ | Multica |
| `synapse issue metadata list` | 列出元数据 | ✅ | Multica |
| `synapse issue metadata set` | 设置元数据 | ✅ | Multica |
| `synapse issue subscriber list` | 列出订阅者 | ✅ | Multica |
| `synapse issue subscriber add` | 添加订阅 | ✅ | Multica |
| `synapse issue runs` | 执行历史 | ✅ | Multica |
| `synapse project list` | 列出项目 | ✅ | Multica |
| `synapse project get <id>` | 获取项目详情 | ✅ | Multica |
| `synapse project create` | 创建项目 | ✅ | Multica |
| `synapse project update <id>` | 更新项目 | ✅ | Multica |
| `synapse project status <id> <status>` | 修改状态 | ✅ | Multica |
| `synapse project delete <id>` | 删除项目 | ✅ | Multica |
| `synapse autopilot list` | 列出 Autopilot | ✅ | Multica |
| `synapse autopilot get <id>` | 获取 Autopilot 详情 | ✅ | Multica |
| `synapse autopilot create` | 创建 Autopilot | ✅ | Multica |
| `synapse autopilot update <id>` | 更新 Autopilot | ✅ | Multica |
| `synapse autopilot delete <id>` | 删除 Autopilot | ✅ | Multica |
| `synapse autopilot trigger <id>` | 触发 Autopilot | ✅ | Multica |
| `synapse autopilot runs <id>` | 运行历史 | ✅ | Multica |
| `synapse autopilot trigger-add` | 添加触发器 | ✅ | Multica |
| `synapse autopilot trigger-update` | 更新触发器 | ✅ | Multica |
| `synapse autopilot trigger-delete` | 删除触发器 | ✅ | Multica |

### 2. 守护进程功能

#### 2.1 Paseo 守护进程能力

| 功能 | 描述 | 状态 | 来源 |
|------|------|------|------|
| Agent 进程管理 | 启动、停止、监控 Agent | ✅ | Paseo |
| WebSocket 服务 | 实时双向通信 | ✅ | Paseo |
| 本地执行 | 不依赖云端 | ✅ | Paseo |
| 跨设备同步 | 多客户端连接 | ✅ | Paseo |
| 日志收集 | 实时日志流 | ✅ | Paseo |
| Worktree 管理 | Git worktree 隔离 | ✅ | Paseo |

#### 2.2 Multica 守护进程能力

| 功能 | 描述 | 状态 | 来源 |
|------|------|------|------|
| 任务队列 | Issue 管理 | ✅ | Multica |
| 执行历史 | Run 记录 | ✅ | Multica |
| Autopilot | 定时任务 | ✅ | Multica |
| 技能存储 | Skills 持久化 | ✅ | Multica |
| Webhook | 外部集成 | 🔄 | 计划中 |
| 多工作区 | Workspace 隔离 | ✅ | Multica |

#### 2.3 Synapse 增强能力

| 功能 | 描述 | 状态 | 来源 |
|------|------|------|------|
| 统一 WebSocket | 双命名空间支持 | ✅ | Synapse |
| 跨命名空间事件 | Paseo + Multica 事件桥接 | ✅ | Synapse |
| REST + WS 双协议 | HTTP 和 WebSocket | ✅ | Synapse |
| 健康检查 | /health 端点 | ✅ | Synapse |

### 3. Web UI 功能

#### 3.1 Multica Web 功能

| 功能 | 描述 | 状态 | 来源 |
|------|------|------|------|
| 看板视图 | Kanban 风格 | ✅ | Multica |
| Issue 管理 | 创建、编辑、删除 | ✅ | Multica |
| 项目管理 | 项目概览 | ✅ | Multica |
| 成员管理 | 用户和 Agent | ✅ | Multica |
| 评论系统 | 讨论功能 | ✅ | Multica |
| 实时更新 | WebSocket 推送 | ✅ | Multica |
| 搜索功能 | 全文搜索 | 🔄 | 计划中 |

#### 3.2 Paseo Web 功能

| 功能 | 描述 | 状态 | 来源 |
|------|------|------|------|
| Agent 监控面板 | 实时监控 | 🔄 | 计划中 |
| 日志查看器 | 实时日志 | 🔄 | 计划中 |
| 工作区管理 | Worktree 可视化 | 🔄 | 计划中 |

### 4. 移动端功能（Expo）

| 功能 | 描述 | 状态 | 来源 |
|------|------|------|------|
| iOS 支持 | iPhone/iPad | 🔄 | 计划中 |
| Android 支持 | Android 手机 | 🔄 | 计划中 |
| 语音输入 | 语音命令 | 🔄 | 计划中 |
| 推送通知 | 实时通知 | 🔄 | 计划中 |
| 离线模式 | 本地缓存 | 🔄 | 计划中 |
| 扫码连接 | 快速配对 | 🔄 | 计划中 |

### 5. 桌面端功能（Electron）

| 功能 | 描述 | 状态 | 来源 |
|------|------|------|------|
| macOS 支持 | macOS 应用 | 🔄 | 计划中 |
| Windows 支持 | Windows 应用 | 🔄 | 计划中 |
| Linux 支持 | Linux 应用 | 🔄 | 计划中 |
| 原生菜单 | 系统菜单栏 | 🔄 | 计划中 |
| 系统托盘 | 后台运行 | 🔄 | 计划中 |
| 全局快捷键 | 快捷命令 | 🔄 | 计划中 |

### 6. 数据管理

#### 6.1 存储系统

| 功能 | 描述 | 状态 | 来源 |
|------|------|------|------|
| 本地文件存储 | JSON 文件 | ✅ | Paseo |
| PostgreSQL | 关系型数据库 | 🔄 | 计划中 |
| pgvector | 向量存储 | 🔄 | 计划中 |
| 缓存系统 | LRU 缓存 | ✅ | Synapse |

#### 6.2 数据模型

| 模型 | 描述 | 状态 | 来源 |
|------|------|------|------|
| Agent | Agent 实例 | ✅ | Paseo |
| Issue | 任务/工单 | ✅ | Multica |
| Project | 项目 | ✅ | Multica |
| Workspace | 工作区 | ✅ | Multica |
| Member | 成员（用户/Agent） | ✅ | Multica |
| Run | 执行记录 | ✅ | Multica |
| Autopilot | 定时任务 | ✅ | Multica |
| Skill | 技能 | ✅ | Multica |
| Squad | Agent 团队 | 🔄 | 计划中 |
| Worktree | Git worktree | ✅ | Paseo |
| Comment | 评论 | ✅ | Multica |

### 7. Agent Provider 支持

| Provider | 描述 | 状态 | 来源 |
|----------|------|------|------|
| Claude Code | Anthropic Claude | ✅ | Paseo |
| Codex | OpenAI Codex | ✅ | Multica |
| OpenCode | OpenCode CLI | ✅ | Multica |
| Copilot | GitHub Copilot | 🔄 | 计划中 |
| Pi | Pi AI | 🔄 | 计划中 |
| Gemini | Google Gemini | 🔄 | 计划中 |
| Cursor | Cursor Agent | 🔄 | 计划中 |
| Hermes | Hermes Agent | 🔄 | 计划中 |

### 8. 高级编排功能

| 功能 | 描述 | 状态 | 来源 |
|------|------|------|------|
| /handoff | 任务交接 | 🔄 | 计划中 |
| /loop | 循环修复 | 🔄 | 计划中 |
| /advisor | 顾问模式 | 🔄 | 计划中 |
| /committee | 委员会模式 | 🔄 | 计划中 |
| Cross-provider | 跨 Provider 协作 | 🔄 | 计划中 |
| Context sharing | 上下文共享 | 🔄 | 计划中 |

### 9. 技能系统

| 功能 | 描述 | 状态 | 来源 |
|------|------|------|------|
| 技能创建 | 定义新技能 | ✅ | Multica |
| 技能列表 | 查看可用技能 | ✅ | Multica |
| 技能调用 | 执行技能 | 🔄 | 计划中 |
| 技能评分 | 成功率统计 | 🔄 | 计划中 |
| 技能推荐 | 智能推荐 | 🔄 | 计划中 |
| 技能导入导出 | 共享技能 | 🔄 | 计划中 |
| 语义搜索 | 向量相似度 | 🔄 | 计划中 |

### 10. 团队协作功能

| 功能 | 描述 | 状态 | 来源 |
|------|------|------|------|
| 多成员支持 | 用户和 Agent | ✅ | Multica |
| 角色权限 | 权限管理 | 🔄 | 计划中 |
| @提及 | @agent 或 @user | ✅ | Multica |
| 阻塞管理 | Blocker 上报 | ✅ | Multica |
| 实时活动 | 时间线视图 | ✅ | Multica |
| 通知系统 | 状态变更通知 | 🔄 | 计划中 |

## 🔄 开发中功能

以下功能正在积极开发中：

1. **Web UI Agent 监控面板** - Paseo 风格的实时监控
2. **PostgreSQL + pgvector 集成** - 持久化和语义搜索
3. **移动端语音控制** - Expo 实现
4. **桌面端应用** - Electron 实现
5. **高级编排命令** - /handoff, /loop 等
6. **技能推荐系统** - 基于历史成功经验
7. **全局搜索** - 全文和语义搜索
8. **更多 Provider 支持** - Gemini, Cursor 等

## 📋 待开发功能

以下功能在路线图上：

1. **Squads 系统** - 多 Agent 团队协作
2. **Webhook 集成** - 外部系统触发
3. **插件系统** - 扩展机制
4. **审计日志** - 操作审计
5. **Analytics 面板** - 使用统计
6. **CI/CD 集成** - 流水线集成
7. **IDE 插件** - VS Code, JetBrains
8. **云端版本** - SaaS 部署
9. **企业版功能** - SSO, LDAP 等

## 图例

- ✅ **已完成** - 功能已完成并可用
- 🔄 **开发中** - 正在积极开发
- 📋 **待开发** - 在路线图上但未开始

## 更新日志

### v0.1.0 (当前版本)

**已完成:**
- 统一 CLI 命令系统（Paseo + Multica）
- 统一守护进程核心
- WebSocket 双向通信
- REST API 接口
- 基础 Issue/Project/Autopilot 管理
- 技能系统基础
- Agent 进程管理

**开发中:**
- Web UI 完善
- 移动端开发
- 桌面端开发
- 高级编排
