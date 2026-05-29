export type AgentStatus =
  | "idle"
  | "starting"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export interface Agent {
  id: string;
  name: string;
  provider: string;
  status: AgentStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  workspaceId?: string;
  worktree?: string;
  issueId?: string;
  runId?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  environment?: Record<string, string>;
  tools?: string[];
  metadata?: Record<string, any>;
}

export interface AgentActivity {
  id: string;
  agentId: string;
  type: "started" | "stopped" | "message" | "error" | "tool_use" | "file_change";
  message: string;
  timestamp: string;
  data?: any;
}

export interface Worktree {
  id: string;
  name: string;
  branch: string;
  path: string;
  baseBranch?: string;
  agentId?: string;
  issueId?: string;
  status: "active" | "completed" | "failed" | "cleaned";
  createdAt: string;
  cleanedAt?: string;
}

export interface AgentLog {
  id: string;
  agentId: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  data?: any;
}

export interface AgentCommand {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

export function getAgentStatusColor(status: AgentStatus): string {
  const colors: Record<AgentStatus, string> = {
    idle: "#6b7280",
    starting: "#f59e0b",
    running: "#10b981",
    paused: "#8b5cf6",
    completed: "#3b82f6",
    failed: "#ef4444",
    cancelled: "#6b7280",
  };
  return colors[status];
}

export function getAgentStatusText(status: AgentStatus): string {
  const texts: Record<AgentStatus, string> = {
    idle: "Idle",
    starting: "Starting",
    running: "Running",
    paused: "Paused",
    completed: "Completed",
    failed: "Failed",
    cancelled: "Cancelled",
  };
  return texts[status];
}

export function getProviderIcon(provider: string): string {
  const icons: Record<string, string> = {
    claude_code: "🤖",
    codex: "💻",
    copilot: "🔮",
    opencode: "⚡",
    pi: "🌊",
    gemini: "✨",
    cursor: "🎯",
  };
  return icons[provider] || "🤖";
}
