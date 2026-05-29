import { z } from "zod";

// ============ CORE UNIFIED TYPES ============

export const AgentStatusSchema = z.enum([
  "idle",
  "starting",
  "running",
  "paused",
  "completed",
  "failed",
  "cancelled"
]);

export type AgentStatus = z.infer<typeof AgentStatusSchema>;

export const IssueStatusSchema = z.enum([
  "backlog",
  "todo",
  "in_progress",
  "in_review",
  "done",
  "blocked",
  "cancelled"
]);

export type IssueStatus = z.infer<typeof IssueStatusSchema>;

export const PrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

export type Priority = z.infer<typeof PrioritySchema>;

// ============ AGENT TYPES (from Paseo) ============

export const ProviderTypeSchema = z.enum([
  "claude_code",
  "codex",
  "copilot",
  "opencode",
  "pi",
  "gemini",
  "cursor"
]);

export type ProviderType = z.infer<typeof ProviderTypeSchema>;

export const AgentConfigSchema = z.object({
  id: z.string(),
  provider: ProviderTypeSchema,
  prompt: z.string().optional(),
  model: z.string().optional(),
  maxTokens: z.number().optional(),
  temperature: z.number().optional(),
  systemPrompt: z.string().optional(),
  workingDirectory: z.string().optional(),
  worktree: z.string().optional(),
  environment: z.record(z.string()).optional(),
  tools: z.array(z.string()).optional(),
  timeout: z.number().optional(),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;

export const AgentInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: ProviderTypeSchema,
  status: AgentStatusSchema,
  createdAt: z.string(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  workspaceId: z.string().optional(),
  worktree: z.string().optional(),
  issueId: z.string().optional(),
  runId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type AgentInfo = z.infer<typeof AgentInfoSchema>;

export const AgentLogSchema = z.object({
  agentId: z.string(),
  timestamp: z.string(),
  level: z.enum(["info", "warn", "error", "debug"]),
  message: z.string(),
  data: z.any().optional(),
});

export type AgentLog = z.infer<typeof AgentLogSchema>;

// ============ ISSUE TYPES (from Synapse) ============

export const MemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
  type: z.enum(["user", "agent"]),
  avatarUrl: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type Member = z.infer<typeof MemberSchema>;

export const IssueSchema = z.object({
  id: z.string(),
  key: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: IssueStatusSchema,
  priority: PrioritySchema,
  assigneeId: z.string().optional(),
  assignee: z.string().optional(),
  projectId: z.string().optional(),
  parentId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  blockedBy: z.array(z.string()).optional(),
  blocking: z.array(z.string()).optional(),
});

export type Issue = z.infer<typeof IssueSchema>;

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  icon: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["planned", "in_progress", "paused", "completed", "cancelled"]),
  leadId: z.string().optional(),
  lead: z.string().optional(),
  workspaceId: z.string(),
  issueCount: z.number().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Project = z.infer<typeof ProjectSchema>;

export const WorkspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
  createdAt: z.string(),
  memberCount: z.number().default(0),
  agentCount: z.number().default(0),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;

export const CommentSchema = z.object({
  id: z.string(),
  content: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  authorType: z.enum(["user", "agent"]),
  issueId: z.string(),
  parentId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Comment = z.infer<typeof CommentSchema>;

// ============ RUN TYPES (from Synapse) ============

export const RunStatusSchema = z.enum([
  "pending",
  "running",
  "completed",
  "failed",
  "cancelled"
]);

export type RunStatus = z.infer<typeof RunStatusSchema>;

export const RunSchema = z.object({
  id: z.string(),
  issueId: z.string(),
  agentId: z.string(),
  agentName: z.string(),
  status: RunStatusSchema,
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  logs: z.array(z.string()).optional(),
  error: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type Run = z.infer<typeof RunSchema>;

// ============ AUTOPILOT TYPES (from Synapse) ============

export const TriggerTypeSchema = z.enum(["schedule", "webhook", "event"]);

export type TriggerType = z.infer<typeof TriggerTypeSchema>;

export const ScheduleTriggerSchema = z.object({
  type: z.literal("schedule"),
  cron: z.string(),
  timezone: z.string(),
  enabled: z.boolean().default(true),
});

export type ScheduleTrigger = z.infer<typeof ScheduleTriggerSchema>;

export const TriggerSchema = z.union([
  ScheduleTriggerSchema,
  z.object({
    type: z.enum(["webhook", "event"]),
    config: z.record(z.any()),
    enabled: z.boolean().default(true),
  })
]);

export type Trigger = z.infer<typeof TriggerSchema>;

export const AutopilotSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  agent: z.string(),
  mode: z.enum(["create_issue", "direct_execution", "scheduled_task"]),
  status: z.enum(["active", "paused"]),
  triggers: z.array(TriggerSchema).default([]),
  workspaceId: z.string(),
  lastRun: z.string().optional(),
  nextRun: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Autopilot = z.infer<typeof AutopilotSchema>;

// ============ SKILL TYPES (from Synapse) ============

export const SkillSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  agentType: ProviderTypeSchema.optional(),
  prompt: z.string(),
  verificationSteps: z.array(z.string()).optional(),
  examples: z.array(z.object({
    input: z.string(),
    output: z.string(),
  })).optional(),
  workspaceId: z.string(),
  createdBy: z.string(),
  usageCount: z.number().default(0),
  successRate: z.number().default(0),
  tags: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Skill = z.infer<typeof SkillSchema>;

// ============ SQUAD TYPES (from Synapse) ============

export const SquadRoleSchema = z.enum(["lead", "member", "advisor"]);

export type SquadRole = z.infer<typeof SquadRoleSchema>;

export const SquadMemberSchema = z.object({
  memberId: z.string(),
  name: z.string(),
  role: SquadRoleSchema,
  type: z.enum(["user", "agent"]),
  isOptional: z.boolean().default(false),
});

export type SquadMember = z.infer<typeof SquadMemberSchema>;

export const SquadSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  members: z.array(SquadMemberSchema),
  workspaceId: z.string(),
  leadId: z.string().optional(),
  createdAt: z.string(),
});

export type Squad = z.infer<typeof SquadSchema>;

// ============ UNIFIED COMMAND TYPES ============

export const CommandSchema = z.object({
  id: z.string(),
  type: z.enum([
    // Synapse commands
    "paseo.agent.start",
    "paseo.agent.stop",
    "paseo.agent.send",
    "paseo.agent.attach",
    "paseo.agent.logs",
    "paseo.agent.import",
    "paseo.worktree.create",
    "paseo.worktree.delete",
    // Synapse commands
    "synapse.issue.create",
    "synapse.issue.update",
    "synapse.issue.assign",
    "synapse.issue.status",
    "synapse.issue.comment",
    "synapse.run.start",
    "synapse.autopilot.trigger",
    "synapse.autopilot.create",
    // Synapse unified commands
    "synapse.cross.handoff",
    "synapse.skills.invoke",
    "synapse.squad.assign",
  ]),
  payload: z.any(),
  timestamp: z.number(),
  clientId: z.string().optional(),
});

export type Command = z.infer<typeof CommandSchema>;

export const EventSchema = z.object({
  id: z.string(),
  type: z.string(),
  payload: z.any(),
  timestamp: z.number(),
  source: z.enum(["daemon", "agent", "issue", "autopilot", "system"]),
});

export type Event = z.infer<typeof EventSchema>;

// ============ WORKTREE TYPES (from Paseo) ============

export const WorktreeSchema = z.object({
  id: z.string(),
  name: z.string(),
  branch: z.string(),
  path: z.string(),
  baseBranch: z.string().optional(),
  agentId: z.string().optional(),
  issueId: z.string().optional(),
  status: z.enum(["active", "completed", "failed", "cleaned"]),
  createdAt: z.string(),
  cleanedAt: z.string().optional(),
});

export type Worktree = z.infer<typeof WorktreeSchema>;
