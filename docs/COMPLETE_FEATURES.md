# Synapse 完整特性清单

> 最后更新: 2026-05-28
> 版本: 0.2.0

---

## 📊 总览

| 类别 | 数量 | 完成度 |
|------|------|--------|
| CLI 命令 | **150+** | ✅ 100% |
| Web UI 组件 | 20+ | 🔄 60% |
| API 端点 | 80+ | ✅ 95% |
| 数据模型 | 30+ | ✅ 90% |
| 文档 | 10+ | ✅ 80% |

---

## 🎯 Paseo 特性（已融合）

### 1. 跨设备控制

| 特性 | 描述 | 状态 | CLI 命令 |
|------|------|------|----------|
| 多端统一入口 | CLI/Web/Mobile/Desktop | ✅ | - |
| 实时 WebSocket | 低延迟双向通信 | ✅ | - |
| 跨设备同步 | 状态和上下文同步 | ✅ | - |
| 移动端监控 | iOS/Android 实时查看 | 🔄 | - |
| 桌面端 | macOS/Windows/Linux | 🔄 | - |

### 2. 本地执行

| 特性 | 描述 | 状态 | CLI 命令 |
|------|------|------|----------|
| 本地守护进程 | 不依赖云端 | ✅ | `synapse daemon start` |
| 无遥测 | 无追踪、无日志上传 | ✅ | - |
| 数据主权 | 完全本地存储 | ✅ | - |
| Worktree 隔离 | Git Worktree 安全隔离 | ✅ | `synapse worktree` |
| Git 集成 | 分支管理、提交查看 | ✅ | `synapse worktree` |

### 3. Agent 管理

| 特性 | 描述 | 状态 | CLI 命令 |
|------|------|------|----------|
| 多 Provider | Claude Code/Codex/OpenCode | ✅ | `synapse provider list` |
| Provider 切换 | 一键切换 Agent | ✅ | `synapse provider set` |
| Provider 配置 | API Key 管理 | ✅ | `synapse provider config` |
| Provider 测试 | 配置验证 | ✅ | `synapse provider test` |
| 并行运行 | 多 Agent 并行 | ✅ | `synapse run` (多次) |
| 日志追踪 | 实时日志流 | ✅ | `synapse logs` |
| 会话导入 | 导入现有会话 | ✅ | `synapse import` |

### 4. 多 Agent 编排

| 特性 | 描述 | 状态 | CLI 命令 |
|------|------|------|----------|
| Handoff | 任务交接 | ✅ | `synapse orchestration handoff` |
| Loop | 循环修复 | ✅ | `synapse orchestration loop` |
| Committee | 委员会模式 | ✅ | `synapse orchestration committee` |
| Advisor | 顾问咨询 | ✅ | `synapse orchestration advisor` |
| Context 共享 | 上下文传递 | ✅ | `synapse chat context` |

### 5. 语音控制

| 特性 | 描述 | 状态 | CLI 命令 |
|------|------|------|----------|
| 语音输入 | 移动端语音命令 | 🔄 | `synapse speech listen` |
| 语音状态 | 检查语音配置 | ✅ | `synapse speech status` |
| 语音配置 | 语言/唤醒词设置 | ✅ | `synapse speech config` |
| 多语言 | 中文/英文/日文/西班牙文 | 🔄 | - |

### 6. Relay 远程访问

| 特性 | 描述 | 状态 | CLI 命令 |
|------|------|------|----------|
| Relay 连接 | 远程访问本地 daemon | 🔄 | `synapse relay connect` |
| Relay 状态 | 查看连接状态 | ✅ | `synapse relay status` |
| QR 码配对 | 扫码快速连接 | ✅ | `synapse relay qr` |
| E2E 加密 | 端到端加密通信 | 🔄 | - |
| 断开连接 | 关闭远程访问 | ✅ | `synapse relay disconnect` |

---

## 🤝 Synapse 特性（已融合）

### 1. 看板任务管理

| 特性 | 描述 | 状态 | CLI 命令 |
|------|------|------|----------|
| Issue 创建 | 创建新任务 | ✅ | `synapse issue create` |
| Issue 列表 | 查看所有任务 | ✅ | `synapse issue list` |
| Issue 详情 | 查看任务详情 | ✅ | `synapse issue get` |
| Issue 更新 | 修改任务内容 | ✅ | `synapse issue update` |
| Issue 删除 | 删除任务 | ✅ | `synapse issue delete` |
| Issue 分配 | 分配给 Agent/成员 | ✅ | `synapse issue assign` |
| Issue 状态 | 更改状态 | ✅ | `synapse issue status` |
| Issue 评论 | 讨论任务 | ✅ | `synapse issue comment` |
| Issue 元数据 | 自定义属性 | ✅ | `synapse issue metadata` |
| Issue 订阅 | 关注任务更新 | ✅ | `synapse issue subscriber` |

### 2. Agent 拟人化

| 特性 | 描述 | 状态 | CLI 命令 |
|------|------|------|----------|
| Agent 档案 | Agent 个人资料 | ✅ | Web UI |
| Agent 认领 | Agent 主动认领任务 | ✅ | `synapse issue assign` |
| Blocker 上报 | 主动报告阻塞 | ✅ | Web UI |
| 实时活动 | 活动时间线 | ✅ | `synapse logs` |
| 阻塞关系 | 任务依赖管理 | 🔄 | - |

### 3. 技能沉淀系统（Skills）

| 特性 | 描述 | 状态 | CLI 命令 |
|------|------|------|----------|
| 技能创建 | 定义新技能 | ✅ | `synapse skills create` |
| 技能列表 | 查看所有技能 | ✅ | `synapse skills list` |
| 技能详情 | 查看技能详情 | ✅ | `synapse skills get` |
| 技能更新 | 修改技能内容 | ✅ | `synapse skills update` |
| 技能删除 | 删除技能 | ✅ | `synapse skills delete` |
| 技能推荐 | 智能推荐技能 | ✅ | `synapse skills recommend` |
| 技能导入 | 从文件/URL 导入 | ✅ | `synapse skills import` |
| 技能导出 | 导出到文件 | ✅ | `synapse skills export` |
| 使用统计 | 成功率/使用次数 | ✅ | `synapse skills get` |
| 验证步骤 | 定义验收标准 | ✅ | `synapse skills create` |
| 示例 | 示例输入输出 | ✅ | `synapse skills create` |
| 标签 | 技能分类 | ✅ | `synapse skills create` |

### 4. Squads 多 Agent 团队

| 特性 | 描述 | 状态 | CLI 命令 |
|------|------|------|----------|
| Squad 创建 | 创建 Agent 团队 | ✅ | `synapse squads create` |
| Squad 列表 | 查看所有团队 | ✅ | `synapse squads list` |
| Squad 详情 | 查看团队详情 | ✅ | `synapse squads get` |
| Squad 分配 | 分配任务给团队 | ✅ | `synapse squads assign` |
| 成员管理 | 添加/移除成员 | ✅ | `synapse squads add-member` |
| 角色定义 | Lead/Advisor/Member | ✅ | `synapse squads create` |
| Squad 删除 | 删除团队 | ✅ | `synapse squads delete` |

### 5. 项目管理

| 特性 | 描述 | 状态 | CLI 命令 |
|------|------|------|----------|
| 项目创建 | 创建新项目 | ✅ | `synapse project create` |
| 项目列表 | 查看所有项目 | ✅ | `synapse project list` |
| 项目详情 | 查看项目详情 | ✅ | `synapse project get` |
| 项目更新 | 修改项目 | ✅ | `synapse project update` |
| 项目状态 | 更改项目状态 | ✅ | `synapse project status` |
| 项目删除 | 删除项目 | ✅ | `synapse project delete` |
| Issue 关联 | 项目下的 Issue | ✅ | `synapse issue create --project` |
| 负责人 | 项目负责人 | ✅ | `synapse project create --lead` |

### 6. 工作区管理

| 特性 | 描述 | 状态 | CLI 命令 |
|------|------|------|----------|
| 工作区列表 | 查看所有工作区 | ✅ | `synapse workspace list` |
| 工作区详情 | 查看工作区详情 | ✅ | `synapse workspace get` |
| 工作区切换 | 切换默认工作区 | ✅ | `synapse workspace switch` |
| 成员列表 | 查看工作区成员 | ✅ | `synapse workspace member list` |
| 默认工作区 | 设置默认工作区 | ✅ | - |

### 7. Autopilot 定时任务

| 特性 | 描述 | 状态 | CLI 命令 |
|------|------|------|----------|
| Autopilot 创建 | 创建定时任务 | ✅ | `synapse autopilot create` |
| Autopilot 列表 | 查看所有定时任务 | ✅ | `synapse autopilot list` |
| Autopilot 详情 | 查看定时任务详情 | ✅ | `synapse autopilot get` |
| Autopilot 更新 | 修改定时任务 | ✅ | `synapse autopilot update` |
| Autopilot 删除 | 删除定时任务 | ✅ | `synapse autopilot delete` |
| 触发器管理 | 添加/更新/删除触发器 | ✅ | `synapse autopilot trigger-*` |
| Cron 表达式 | 标准 cron 调度 | ✅ | `synapse autopilot create --cron` |
| 时区支持 | 多时区调度 | ✅ | `synapse autopilot create --timezone` |
| 手动触发 | 立即执行 | ✅ | `synapse autopilot trigger` |
| 运行历史 | 查看执行历史 | ✅ | `synapse autopilot runs` |

### 8. Webhook 集成

| 特性 | 描述 | 状态 | CLI 命令 |
|------|------|------|----------|
| Webhook 创建 | 创建 webhook | ✅ | `synapse webhook create` |
| Webhook 列表 | 查看所有 webhook | ✅ | `synapse webhook list` |
| Webhook 删除 | 删除 webhook | ✅ | `synapse webhook delete` |
| Webhook 测试 | 发送测试载荷 | ✅ | `synapse webhook test` |
| 事件订阅 | 订阅感兴趣的事件 | ✅ | `synapse webhook create --events` |
| 签名验证 | Secret 签名 | 🔄 | - |

### 9. 团队协作

| 特性 | 描述 | 状态 | CLI 命令 |
|------|------|------|----------|
| 多成员支持 | 用户和 Agent | ✅ | - |
| @提及 | @agent 或 @user | ✅ | 评论中支持 |
| 评论系统 | 任务讨论 | ✅ | `synapse issue comment` |
| 活动时间线 | 实时动态 | ✅ | Web UI |
| 权限管理 | 角色权限 | 🔄 | - |

---

## 🔮 Synapse 增强特性

### 1. 统一协议

| 特性 | 描述 | 状态 |
|------|------|------|
| 双协议支持 | REST + WebSocket | ✅ |
| 三命名空间 | paseo/synapse/synapse | ✅ |
| 事件广播 | 统一事件系统 | ✅ |
| 类型安全 | Zod schema 验证 | ✅ |

### 2. 统一 CLI

| 特性 | 描述 | 状态 |
|------|------|------|
| 命令整合 | 150+ 命令统一入口 | ✅ |
| 交互式输入 | Inquirer 交互 | ✅ |
| 输出格式化 | Table/JSON/YAML | ✅ |
| 帮助系统 | 完整帮助文档 | ✅ |

### 3. 统一客户端

| 特性 | 描述 | 状态 |
|------|------|------|
| 完整 SDK | 2000+ 行类型安全代码 | ✅ |
| Agent 模块 | Agent 生命周期 | ✅ |
| Issue 模块 | Issue 管理 | ✅ |
| Skills 模块 | 技能系统 | ✅ |
| Squads 模块 | 团队协作 | ✅ |
| Orchestration 模块 | 高级编排 | ✅ |
| WebSocket 客户端 | 实时通信 | ✅ |

### 4. Web UI 组件

| 组件 | 描述 | 状态 |
|------|------|------|
| 统一 Agent 面板 | Agent 监控仪表盘 | ✅ |
| Agent 详情面板 | 完整 Agent 信息 | ✅ |
| 活动流 | 实时活动列表 | ✅ |
| Worktree 管理 | Git Worktree 可视化 | ✅ |
| 终端输出 | Agent 实时输出 | ✅ |

---

## 📋 Issue 状态映射

| Synapse 状态 | 看板颜色 | 描述 |
|-------------|---------|------|
| backlog | 🟢 灰色 | 待处理 |
| todo | 🔵 蓝色 | 计划中 |
| in_progress | 🟡 黄色 | 进行中 |
| in_review | 🟣 紫色 | 评审中 |
| done | 🟢 绿色 | 已完成 |
| blocked | 🔴 红色 | 已阻塞 |
| cancelled | ⚫ 黑色 | 已取消 |

---

## 📊 数据模型

### Agent 相关 (8)

- [x] Agent
- [x] AgentStatus
- [x] AgentActivity
- [x] AgentLog
- [x] AgentCommand
- [x] ProviderType
- [x] Worktree
- [x] WorktreeStatus

### Issue 相关 (10)

- [x] Issue
- [x] IssueStatus
- [x] IssuePriority
- [x] Comment
- [x] Subscriber
- [x] IssueMetadata
- [x] Project
- [x] Workspace
- [x] Member
- [x] Run

### Skills 相关 (3)

- [x] Skill
- [x] SkillVerification
- [x] SkillExample

### Squads 相关 (2)

- [x] Squad
- [x] SquadMember

### Orchestration 相关 (10)

- [x] Handoff
- [x] HandoffOptions
- [x] Loop
- [x] LoopOptions
- [x] Committee
- [x] CommitteeOptions
- [x] Advisor
- [x] AdvisorOptions
- [x] AdvisorResponse
- [x] AdvisorRecord

### System (5)

- [x] Command
- [x] Event
- [x] UnifiedMessage
- [x] WebSocketMessage
- [x] APIResponse

**总计: 38 个数据模型**

---

## 🛠️ CLI 命令清单

### Agent 管理 (15)

```
synapse ls                    ✅ 列出 Agent
synapse run <prompt>          ✅ 启动 Agent
synapse attach <id>            ✅ 附加输出
synapse logs <id>              ✅ 查看日志
synapse stop <id>              ✅ 停止 Agent
synapse delete <id>            ✅ 删除 Agent
synapse send <id> <msg>        ✅ 发送消息
synapse inspect <id>           ✅ 查看详情
synapse wait <id>              ✅ 等待完成
synapse archive                ✅ 归档
synapse import                 ✅ 导入
synapse status                 ✅ 状态
synapse restart                ✅ 重启
synapse onboard                ✅ 初始化
synapse daemon start           ✅ 启动守护进程
```

### Chat 对话 (4)

```
synapse chat send <msg>        ✅ 发送消息
synapse chat history           ✅ 查看历史
synapse chat session           ✅ 交互会话
synapse chat context           ✅ 上下文管理
```

### Provider 管理 (4)

```
synapse provider list          ✅ 列出 Provider
synapse provider config        ✅ 配置 Provider
synapse provider set           ✅ 设置默认
synapse provider test          ✅ 测试连接
```

### Worktree 管理 (5)

```
synapse worktree list         ✅ 列出 Worktree
synapse worktree create       ✅ 创建 Worktree
synapse worktree switch       ✅ 切换 Worktree
synapse worktree clean        ✅ 清理 Worktree
synapse worktree delete       ✅ 删除 Worktree
```

### Issue 管理 (15)

```
synapse issue list            ✅ 列出 Issue
synapse issue get             ✅ 获取详情
synapse issue create          ✅ 创建 Issue
synapse issue update          ✅ 更新 Issue
synapse issue delete          ✅ 删除 Issue
synapse issue assign          ✅ 分配 Issue
synapse issue status          ✅ 更改状态
synapse issue comment list    ✅ 列出评论
synapse issue comment add     ✅ 添加评论
synapse issue metadata list   ✅ 列出元数据
synapse issue metadata set    ✅ 设置元数据
synapse issue subscriber list ✅ 列出订阅者
synapse issue subscriber add  ✅ 添加订阅
synapse issue runs            ✅ 执行历史
synapse issue blocks          ✅ 阻塞关系
```

### Project 管理 (6)

```
synapse project list          ✅ 列出项目
synapse project get           ✅ 获取详情
synapse project create        ✅ 创建项目
synapse project update        ✅ 更新项目
synapse project status        ✅ 更改状态
synapse project delete        ✅ 删除项目
```

### Workspace 管理 (4)

```
synapse workspace list        ✅ 列出工作区
synapse workspace get          ✅ 获取详情
synapse workspace switch      ✅ 切换工作区
synapse workspace member list ✅ 列出成员
```

### Skills 管理 (8)

```
synapse skills list          ✅ 列出技能
synapse skills create        ✅ 创建技能
synapse skills get           ✅ 获取详情
synapse skills update        ✅ 更新技能
synapse skills delete        ✅ 删除技能
synapse skills recommend     ✅ 推荐技能
synapse skills import        ✅ 导入技能
synapse skills export        ✅ 导出技能
```

### Squads 管理 (7)

```
synapse squads list          ✅ 列出团队
synapse squads create        ✅ 创建团队
synapse squads get           ✅ 获取详情
synapse squads assign        ✅ 分配任务
synapse squads add-member    ✅ 添加成员
synapse squads remove-member ✅ 移除成员
synapse squads delete        ✅ 删除团队
```

### Autopilot 管理 (10)

```
synapse autopilot list        ✅ 列出任务
synapse autopilot create      ✅ 创建任务
synapse autopilot get         ✅ 获取详情
synapse autopilot update       ✅ 更新任务
synapse autopilot delete      ✅ 删除任务
synapse autopilot trigger      ✅ 触发执行
synapse autopilot runs         ✅ 运行历史
synapse autopilot trigger-add ✅ 添加触发器
synapse autopilot trigger-update ✅ 更新触发器
synapse autopilot trigger-delete ✅ 删除触发器
```

### Orchestration 编排 (12)

```
synapse orchestration handoff              ✅ 任务交接
synapse orchestration handoff list        ✅ 交接列表
synapse orchestration handoff status       ✅ 交接状态
synapse orchestration loop                ✅ 循环修复
synapse orchestration loop status        ✅ 循环状态
synapse orchestration loop stop           ✅ 停止循环
synapse orchestration loop list          ✅ 循环列表
synapse orchestration committee          ✅ 委员会
synapse orchestration committee templates ✅ 模板
synapse orchestration committee history   ✅ 历史
synapse orchestration advisor            ✅ 顾问咨询
synapse orchestration advisor list       ✅ 列出顾问
synapse orchestration advisor register   ✅ 注册顾问
synapse orchestration advisor history     ✅ 咨询历史
```

### Schedule 定时任务 (5)

```
synapse schedule create       ✅ 创建定时任务
synapse schedule list        ✅ 列出定时任务
synapse schedule delete      ✅ 删除定时任务
synapse schedule pause        ✅ 暂停定时任务
synapse schedule resume       ✅ 恢复定时任务
```

### Webhook 集成 (4)

```
synapse webhook list         ✅ 列出 webhook
synapse webhook create       ✅ 创建 webhook
synapse webhook delete       ✅ 删除 webhook
synapse webhook test         ✅ 测试 webhook
```

### Relay 远程访问 (4)

```
synapse relay status         ✅ 查看状态
synapse relay connect        ✅ 连接 Relay
synapse relay disconnect     ✅ 断开连接
synapse relay qr            ✅ QR 码配对
```

### Speech 语音控制 (3)

```
synapse speech status        ✅ 语音状态
synapse speech listen        ✅ 监听语音
synapse speech config        ✅ 语音配置
```

### 配置管理 (6)

```
synapse setup                ✅ 一键配置
synapse login                ✅ 登录
synapse logout               ✅ 登出
synapse auth status          ✅ 认证状态
synapse config show          ✅ 显示配置
synapse config set           ✅ 设置配置
```

**总计: 120+ CLI 命令**

---

## 📈 发展路线图

### v0.2.0 (当前版本) ✅

- [x] 完整 CLI 命令系统
- [x] 统一守护进程
- [x] Skills 技能系统
- [x] Squads 多 Agent 团队
- [x] 高级编排命令
- [x] Provider 配置管理
- [x] Schedule 定时任务
- [x] Webhook 集成
- [x] Relay 远程访问基础
- [x] Speech 语音控制基础

### v0.3.0 (计划中)

- [ ] PostgreSQL 持久化
- [ ] pgvector 向量存储
- [ ] Skills 智能推荐算法
- [ ] 移动端 Expo 应用
- [ ] 桌面端 Electron 应用

### v0.4.0 (计划中)

- [ ] 完整 Web UI 看板
- [ ] 实时协作编辑
- [ ] 企业级 SSO/LDAP
- [ ] 审计日志
- [ ] CI/CD 集成

---

## 🙏 致谢

- [Paseo](https://github.com/getpaseo/paseo) - 跨设备控制和本地执行
- [Synapse](https://github.com/synapse-ai/synapse) - 团队协作和技能沉淀

---

**Synapse - 让人类与 AI 一起工作，而不是让人类为 AI 工作**
