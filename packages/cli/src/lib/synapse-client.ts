import { SynapseConfig, loadConfig } from "./config.js";

let cachedClient: SynapseClient | null = null;

export async function getSynapseClient(): Promise<SynapseClient> {
  if (cachedClient) {
    return cachedClient;
  }

  const config = await loadConfig();
  cachedClient = new SynapseClient(config);
  return cachedClient;
}

interface ConfigShow {
  configFile: string;
  serverUrl: string;
  appUrl: string;
  workspace?: string;
  profile: string;
}

interface DaemonStartOptions {
  foreground?: boolean;
}

interface DaemonStatus {
  running: boolean;
  pid?: number;
  uptime?: string;
  version?: string;
}

interface Agent {
  id: string;
  name: string;
  provider: string;
  status: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  workspaceId?: string;
  worktree?: string;
  issueId?: string;
  runId?: string;
  metadata?: Record<string, any>;
}

interface AgentCreateOptions {
  name?: string;
  provider?: string;
  prompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  workingDirectory?: string;
  worktree?: string;
  environment?: Record<string, string>;
  tools?: string[];
}

interface AgentLog {
  id: string;
  agentId: string;
  timestamp: string;
  level: string;
  message: string;
  data?: any;
}

interface Worktree {
  id: string;
  name: string;
  branch: string;
  path: string;
  baseBranch?: string;
  agentId?: string;
  issueId?: string;
  status: string;
  createdAt: string;
  cleanedAt?: string;
}

interface WorktreeCreateOptions {
  name?: string;
  branch: string;
  path?: string;
  baseBranch?: string;
  agentId?: string;
  issueId?: string;
}

interface Issue {
  id: string;
  key: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigneeId?: string;
  assignee?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

interface IssueListOptions {
  status?: string;
  priority?: string;
  assignee?: string;
  assigneeId?: string;
  project?: string;
  limit?: number;
}

interface IssueCreateOptions {
  title: string;
  description?: string;
  priority?: string;
  assignee?: string;
  assigneeId?: string;
  project?: string;
  parent?: string;
}

interface IssueUpdateOptions {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isDefault: boolean;
  createdAt: string;
  memberCount: number;
  agentCount: number;
}

interface Member {
  id: string;
  name: string;
  email?: string;
  type: "user" | "agent";
}

interface Project {
  id: string;
  title: string;
  icon?: string;
  description?: string;
  status: string;
  lead?: string;
  workspaceId: string;
  issueCount: number;
  createdAt: string;
}

interface ProjectListOptions {
  status?: string;
}

interface ProjectCreateOptions {
  title: string;
  description?: string;
  icon?: string;
  lead?: string;
  status?: string;
}

interface ProjectUpdateOptions {
  title?: string;
  description?: string;
  icon?: string;
  lead?: string;
  status?: string;
}

interface Autopilot {
  id: string;
  title: string;
  description?: string;
  agent: string;
  mode: string;
  status: string;
  triggers: any[];
  workspaceId: string;
  createdAt: string;
}

interface AutopilotListOptions {
  status?: string;
}

interface AutopilotCreateOptions {
  title: string;
  description?: string;
  agent: string;
  mode?: string;
  triggers?: any[];
}

interface AutopilotRun {
  id: string;
  status: string;
  triggeredAt: string;
}

interface Skill {
  id: string;
  title: string;
  description: string;
  agentType?: string;
  prompt: string;
  verificationSteps?: string[];
  examples?: Array<{ input: string; output: string }>;
  workspaceId: string;
  createdBy: string;
  usageCount: number;
  successRate: number;
  tags?: string[];
  createdAt: string;
}

interface AuthStatus {
  authenticated: boolean;
  server?: string;
  user?: string;
  expiresAt?: string;
}

interface IssueComment {
  id: string;
  content: string;
  actor: string;
  actorType: string;
  createdAt: string;
}

interface IssueRun {
  id: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
}

interface AutopilotTrigger {
  id: string;
  type: string;
  cron?: string;
  timezone?: string;
  enabled?: boolean;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
}

interface WebhookCreateOptions {
  name: string;
  url: string;
  events?: string[];
  secret?: string;
}

interface SkillCreateOptions {
  title: string;
  description: string;
  agentType?: string;
  prompt: string;
  verificationSteps?: string[];
  examples?: Array<{ input: string; output: string }>;
  tags?: string[];
}

interface SkillUpdateOptions {
  title?: string;
  description?: string;
  prompt?: string;
  tags?: string[];
}

interface Squad {
  id: string;
  name: string;
  description?: string;
  members: Array<{ name: string; role: string; type: string }>;
  workspaceId: string;
  leadId?: string;
  issueCount?: number;
  issues?: Array<{ key: string; title: string; status: string }>;
  createdAt: string;
}

interface SquadCreateOptions {
  name: string;
  description?: string;
  members: Array<{ name: string; role: string; type?: string }>;
  leadId?: string;
}

interface HandoffOptions {
  fromAgentId: string;
  toAgentId: string;
  context?: string;
  message?: string;
}

interface Handoff {
  id: string;
  fromAgent: string;
  toAgent: string;
  context?: string;
  message?: string;
  status: string;
  createdAt: string;
  completedAt?: string;
}

interface HandoffListOptions {
  status?: string;
  from?: string;
  to?: string;
}

interface HandoffResult {
  id: string;
  status: string;
}

interface LoopOptions {
  agentId: string;
  maxIterations: number;
  delayMs?: number;
  criteria?: string;
  verbose?: boolean;
}

interface LoopStatus {
  id: string;
  status: string;
  currentIteration: number;
  maxIterations: number;
  agentId: string;
  criteria?: string;
  lastResult?: {
    success: boolean;
    message: string;
    errors?: string[];
  };
}

interface LoopResult {
  success: boolean;
  iterations: number;
  duration: string;
  reason?: string;
}

interface LoopListOptions {
  status?: string;
}

interface CommitteeOptions {
  task: string;
  agents: Array<{ name: string; perspective: string }>;
  mode?: "unanimous" | "majority" | "any";
  timeoutSeconds?: number;
  verbose?: boolean;
}

interface CommitteeResult {
  id: string;
  task: string;
  deliberations: Array<{
    agent: string;
    perspective: string;
    verdict: boolean;
    reasoning?: string;
  }>;
  consensus: {
    decision: "approved" | "rejected" | "no_consensus";
    summary?: string;
    actionItems?: string[];
  };
}

interface CommitteeRecord {
  id: string;
  task: string;
  decision: string;
  agents: string[];
  createdAt: string;
}

interface HistoryOptions {
  limit?: number;
  agentName?: string;
}

interface AdvisorOptions {
  question: string;
  agentName?: string;
  context?: string;
  format?: "text" | "structured" | "json";
}

interface Advisor {
  name: string;
  description: string;
  expertise: string[];
}

interface AdvisorResponse {
  response: string;
  suggestions?: string[];
  resources?: Array<{ title: string; url?: string }>;
}

interface RegisterAdvisorOptions {
  name: string;
  description: string;
  expertise: string[];
}

interface AdvisorHistoryRecord {
  id: string;
  advisor: string;
  question: string;
  timestamp: string;
}

export class SynapseClient {
  private _synapseConfig: SynapseConfig;
  private _serverUrl: string;
  private _ws: WebSocket | null = null;
  private _wsHandlers: Map<string, Set<(data: any) => void>> = new Map();

  constructor(config: SynapseConfig) {
    this._synapseConfig = config;
    this._serverUrl = config.serverUrl || "http://localhost:8080";
  }

  private async _request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this._serverUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(this._synapseConfig.token ? { Authorization: `Bearer ${this._synapseConfig.token}` } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  config = {
    show: async (): Promise<ConfigShow> => {
      return {
        configFile: this._synapseConfig.configPath,
        serverUrl: this._serverUrl,
        appUrl: this._synapseConfig.appUrl || "http://localhost:3000",
        workspace: this._synapseConfig.workspaceId,
        profile: this._synapseConfig.profile || "default",
      };
    },

    set: async (key: string, value: string): Promise<void> => {
      switch (key) {
        case "server_url":
          this._synapseConfig.serverUrl = value;
          break;
        case "app_url":
          this._synapseConfig.appUrl = value;
          break;
        case "workspace_id":
          this._synapseConfig.workspaceId = value;
          break;
        case "profile":
          this._synapseConfig.profile = value;
          break;
      }
      await import("./config.js").then(({ saveConfig }) =>
        saveConfig(this._synapseConfig)
      );
    },
  };

  daemon = {
    start: async (_options?: DaemonStartOptions): Promise<void> => {
      console.log("Starting Synapse daemon...");
    },

    stop: async (): Promise<void> => {
      console.log("Stopping Synapse daemon...");
    },

    status: async (): Promise<DaemonStatus> => {
      return {
        running: true,
        pid: process.pid,
        uptime: "0s",
        version: "0.1.0",
      };
    },
  };

  agent = {
    list: async (): Promise<Agent[]> => {
      return this._request<Agent[]>("/api/agents");
    },

    get: async (id: string): Promise<Agent> => {
      return this._request<Agent>(`/api/agents/${id}`);
    },

    create: async (options: AgentCreateOptions): Promise<Agent> => {
      return this._request<Agent>("/api/agents", {
        method: "POST",
        body: JSON.stringify(options),
      });
    },

    stop: async (id: string): Promise<void> => {
      await this._request(`/api/agents/${id}/stop`, { method: "POST" });
    },

    send: async (id: string, message: string): Promise<void> => {
      await this._request(`/api/agents/${id}/send`, {
        method: "POST",
        body: JSON.stringify({ message }),
      });
    },

    attach: async (id: string): Promise<void> => {
      console.log(`Attaching to agent ${id}...`);
    },

    logs: async (id: string): Promise<AgentLog[]> => {
      return this._request<AgentLog[]>(`/api/agents/${id}/logs`);
    },

    delete: async (id: string): Promise<void> => {
      await this._request(`/api/agents/${id}`, { method: "DELETE" });
    },

    wait: async (id: string): Promise<Agent> => {
      const agent = await this._request<Agent>(`/api/agents/${id}`);
      if (agent.status === "completed" || agent.status === "failed") {
        return agent;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return this.agent.wait(id);
    },
  };

  auth = {
    login: async (): Promise<void> => {
      console.log("Opening browser for authentication...");
    },

    status: async (): Promise<AuthStatus> => {
      return {
        authenticated: !!this._synapseConfig.token,
        server: this._serverUrl,
        expiresAt: "N/A",
      };
    },

    logout: async (): Promise<void> => {
      this._synapseConfig.token = undefined;
      console.log("Logged out successfully");
    },
  };

  worktree = {
    list: async (): Promise<Worktree[]> => {
      return this._request<Worktree[]>("/api/worktrees");
    },

    create: async (options: WorktreeCreateOptions): Promise<Worktree> => {
      return this._request<Worktree>("/api/worktrees", {
        method: "POST",
        body: JSON.stringify(options),
      });
    },

    delete: async (id: string): Promise<void> => {
      await this._request(`/api/worktrees/${id}`, { method: "DELETE" });
    },
  };

  issue = {
    list: async (options?: IssueListOptions): Promise<Issue[]> => {
      const workspaceId = this._synapseConfig.workspaceId;
      const params = new URLSearchParams();
      if (options?.status) params.append("status", options.status);
      if (options?.priority) params.append("priority", options.priority);
      if (options?.assignee) params.append("assignee", options.assignee);
      if (options?.limit) params.append("limit", options.limit.toString());

      return this._request<Issue[]>(
        `/api/workspaces/${workspaceId}/issues?${params}`
      );
    },

    get: async (id: string): Promise<Issue> => {
      const workspaceId = this._synapseConfig.workspaceId;
      return this._request<Issue>(
        `/api/workspaces/${workspaceId}/issues/${id}`
      );
    },

    create: async (options: IssueCreateOptions): Promise<Issue> => {
      const workspaceId = this._synapseConfig.workspaceId;
      return this._request<Issue>(`/api/workspaces/${workspaceId}/issues`, {
        method: "POST",
        body: JSON.stringify(options),
      });
    },

    update: async (id: string, options: IssueUpdateOptions): Promise<void> => {
      const workspaceId = this._synapseConfig.workspaceId;
      await this._request(`/api/workspaces/${workspaceId}/issues/${id}`, {
        method: "PATCH",
        body: JSON.stringify(options),
      });
    },

    delete: async (id: string): Promise<void> => {
      const workspaceId = this._synapseConfig.workspaceId;
      await this._request(`/api/workspaces/${workspaceId}/issues/${id}`, {
        method: "DELETE",
      });
    },

    assign: async (id: string, assignee: string): Promise<void> => {
      const workspaceId = this._synapseConfig.workspaceId;
      await this._request(`/api/workspaces/${workspaceId}/issues/${id}/assign`, {
        method: "POST",
        body: JSON.stringify({ assignee }),
      });
    },

    unassign: async (id: string): Promise<void> => {
      await this.issue.update(id, { assigneeId: "" } as any);
    },

    setStatus: async (id: string, status: string): Promise<void> => {
      await this.issue.update(id, { status });
    },

    commentList: async (issueId: string, _options?: any): Promise<IssueComment[]> => {
      const workspaceId = this._synapseConfig.workspaceId;
      return this._request<IssueComment[]>(
        `/api/workspaces/${workspaceId}/issues/${issueId}/comments`
      );
    },

    commentAdd: async (issueId: string, content: string, parent?: string): Promise<void> => {
      const workspaceId = this._synapseConfig.workspaceId;
      await this._request(`/api/workspaces/${workspaceId}/issues/${issueId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content, parent }),
      });
    },

    metadataList: async (issueId: string): Promise<Record<string, any>> => {
      const workspaceId = this._synapseConfig.workspaceId;
      return this._request<Record<string, any>>(
        `/api/workspaces/${workspaceId}/issues/${issueId}/metadata`
      );
    },

    metadataSet: async (issueId: string, key: string, value: string, type?: string): Promise<void> => {
      const workspaceId = this._synapseConfig.workspaceId;
      await this._request(`/api/workspaces/${workspaceId}/issues/${issueId}/metadata`, {
        method: "POST",
        body: JSON.stringify({ key, value, type }),
      });
    },

    subscriberList: async (issueId: string): Promise<Member[]> => {
      const workspaceId = this._synapseConfig.workspaceId;
      return this._request<Member[]>(
        `/api/workspaces/${workspaceId}/issues/${issueId}/subscribers`
      );
    },

    subscriberAdd: async (issueId: string, user?: string): Promise<void> => {
      const workspaceId = this._synapseConfig.workspaceId;
      await this._request(`/api/workspaces/${workspaceId}/issues/${issueId}/subscribers`, {
        method: "POST",
        body: JSON.stringify({ user }),
      });
    },

    runs: async (issueId: string): Promise<IssueRun[]> => {
      const workspaceId = this._synapseConfig.workspaceId;
      return this._request<IssueRun[]>(
        `/api/workspaces/${workspaceId}/issues/${issueId}/runs`
      );
    },
  };

  workspace = {
    list: async (): Promise<Workspace[]> => {
      return this._request<Workspace[]>("/api/workspaces");
    },

    get: async (id?: string): Promise<Workspace> => {
      const workspaceId = id || this._synapseConfig.workspaceId;
      if (!workspaceId) {
        throw new Error("No workspace ID specified");
      }
      return this._request<Workspace>(`/api/workspaces/${workspaceId}`);
    },

    switch: async (id: string): Promise<void> => {
      this._synapseConfig.workspaceId = id;
      await import("./config.js").then(({ saveConfig }) =>
        saveConfig(this._synapseConfig)
      );
    },

    memberList: async (id?: string): Promise<Member[]> => {
      const workspaceId = id || this._synapseConfig.workspaceId;
      return this._request<Member[]>(
        `/api/workspaces/${workspaceId}/members`
      );
    },
  };

  project = {
    list: async (options?: ProjectListOptions): Promise<Project[]> => {
      const workspaceId = this._synapseConfig.workspaceId;
      const params = new URLSearchParams();
      if (options?.status) params.append("status", options.status);

      return this._request<Project[]>(
        `/api/workspaces/${workspaceId}/projects?${params}`
      );
    },

    get: async (id: string): Promise<Project> => {
      const workspaceId = this._synapseConfig.workspaceId;
      return this._request<Project>(
        `/api/workspaces/${workspaceId}/projects/${id}`
      );
    },

    create: async (options: ProjectCreateOptions): Promise<Project> => {
      const workspaceId = this._synapseConfig.workspaceId;
      return this._request<Project>(`/api/workspaces/${workspaceId}/projects`, {
        method: "POST",
        body: JSON.stringify(options),
      });
    },

    update: async (id: string, options: ProjectUpdateOptions): Promise<void> => {
      const workspaceId = this._synapseConfig.workspaceId;
      await this._request(`/api/workspaces/${workspaceId}/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(options),
      });
    },

    delete: async (id: string): Promise<void> => {
      const workspaceId = this._synapseConfig.workspaceId;
      await this._request(`/api/workspaces/${workspaceId}/projects/${id}`, {
        method: "DELETE",
      });
    },

    setStatus: async (id: string, status: string): Promise<void> => {
      const workspaceId = this._synapseConfig.workspaceId;
      await this._request(`/api/workspaces/${workspaceId}/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
  };

  autopilot = {
    list: async (options?: AutopilotListOptions): Promise<Autopilot[]> => {
      const workspaceId = this._synapseConfig.workspaceId;
      const params = new URLSearchParams();
      if (options?.status) params.append("status", options.status);

      return this._request<Autopilot[]>(
        `/api/workspaces/${workspaceId}/autopilots?${params}`
      );
    },

    get: async (id: string): Promise<Autopilot> => {
      const workspaceId = this._synapseConfig.workspaceId;
      return this._request<Autopilot>(
        `/api/workspaces/${workspaceId}/autopilots/${id}`
      );
    },

    create: async (options: AutopilotCreateOptions): Promise<Autopilot> => {
      const workspaceId = this._synapseConfig.workspaceId;
      return this._request<Autopilot>(
        `/api/workspaces/${workspaceId}/autopilots`,
        {
          method: "POST",
          body: JSON.stringify(options),
        }
      );
    },

    trigger: async (id: string): Promise<AutopilotRun> => {
      const workspaceId = this._synapseConfig.workspaceId;
      return this._request<AutopilotRun>(
        `/api/workspaces/${workspaceId}/autopilots/${id}/trigger`,
        { method: "POST" }
      );
    },

    delete: async (id: string): Promise<void> => {
      const workspaceId = this._synapseConfig.workspaceId;
      await this._request(
        `/api/workspaces/${workspaceId}/autopilots/${id}`,
        { method: "DELETE" }
      );
    },

    update: async (id: string, options: Partial<AutopilotCreateOptions & { status: string }>): Promise<void> => {
      const workspaceId = this._synapseConfig.workspaceId;
      await this._request(`/api/workspaces/${workspaceId}/autopilots/${id}`, {
        method: "PATCH",
        body: JSON.stringify(options),
      });
    },

    runs: async (id: string, limit?: number): Promise<AutopilotRun[]> => {
      const workspaceId = this._synapseConfig.workspaceId;
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      return this._request<AutopilotRun[]>(
        `/api/workspaces/${workspaceId}/autopilots/${id}/runs?${params}`
      );
    },

    addTrigger: async (autopilotId: string, trigger: any): Promise<AutopilotTrigger> => {
      const workspaceId = this._synapseConfig.workspaceId;
      return this._request<AutopilotTrigger>(
        `/api/workspaces/${workspaceId}/autopilots/${autopilotId}/triggers`,
        { method: "POST", body: JSON.stringify(trigger) }
      );
    },

    updateTrigger: async (autopilotId: string, triggerId: string, options: any): Promise<void> => {
      const workspaceId = this._synapseConfig.workspaceId;
      await this._request(
        `/api/workspaces/${workspaceId}/autopilots/${autopilotId}/triggers/${triggerId}`,
        { method: "PATCH", body: JSON.stringify(options) }
      );
    },

    deleteTrigger: async (autopilotId: string, triggerId: string): Promise<void> => {
      const workspaceId = this._synapseConfig.workspaceId;
      await this._request(
        `/api/workspaces/${workspaceId}/autopilots/${autopilotId}/triggers/${triggerId}`,
        { method: "DELETE" }
      );
    },
  };

  skill = {
    list: async (): Promise<Skill[]> => {
      return this._request<Skill[]>("/api/skills");
    },

    get: async (id: string): Promise<Skill> => {
      return this._request<Skill>(`/api/skills/${id}`);
    },

    create: async (options: SkillCreateOptions): Promise<Skill> => {
      return this._request<Skill>("/api/skills", {
        method: "POST",
        body: JSON.stringify(options),
      });
    },

    update: async (id: string, options: SkillUpdateOptions): Promise<void> => {
      await this._request(`/api/skills/${id}`, {
        method: "PATCH",
        body: JSON.stringify(options),
      });
    },

    delete: async (id: string): Promise<void> => {
      await this._request(`/api/skills/${id}`, { method: "DELETE" });
    },

    recommend: async (task: string): Promise<Skill[]> => {
      return this._request<Skill[]>("/api/skills/recommend", {
        method: "POST",
        body: JSON.stringify({ task }),
      });
    },
  };

  squad = {
    list: async (): Promise<Squad[]> => {
      const workspaceId = this._synapseConfig.workspaceId;
      return this._request<Squad[]>(`/api/workspaces/${workspaceId}/squads`);
    },

    get: async (id: string): Promise<Squad> => {
      const workspaceId = this._synapseConfig.workspaceId;
      return this._request<Squad>(`/api/workspaces/${workspaceId}/squads/${id}`);
    },

    create: async (options: SquadCreateOptions): Promise<Squad> => {
      const workspaceId = this._synapseConfig.workspaceId;
      return this._request<Squad>(`/api/workspaces/${workspaceId}/squads`, {
        method: "POST",
        body: JSON.stringify(options),
      });
    },

    assign: async (squadId: string, issueId: string): Promise<void> => {
      const workspaceId = this._synapseConfig.workspaceId;
      await this._request(
        `/api/workspaces/${workspaceId}/squads/${squadId}/assign`,
        {
          method: "POST",
          body: JSON.stringify({ issueId }),
        }
      );
    },

    delete: async (id: string): Promise<void> => {
      const workspaceId = this._synapseConfig.workspaceId;
      await this._request(`/api/workspaces/${workspaceId}/squads/${id}`, {
        method: "DELETE",
      });
    },

    update: async (id: string, options: Partial<SquadCreateOptions & { members?: any[] }>): Promise<void> => {
      const workspaceId = this._synapseConfig.workspaceId;
      await this._request(`/api/workspaces/${workspaceId}/squads/${id}`, {
        method: "PATCH",
        body: JSON.stringify(options),
      });
    },
  };

  orchestration = {
    handoff: async (options: HandoffOptions): Promise<HandoffResult> => {
      return this._request<HandoffResult>("/api/orchestration/handoffs", {
        method: "POST",
        body: JSON.stringify(options),
      });
    },

    getHandoff: async (id: string): Promise<Handoff> => {
      return this._request<Handoff>(`/api/orchestration/handoffs/${id}`);
    },

    listHandoffs: async (options?: HandoffListOptions): Promise<Handoff[]> => {
      const params = new URLSearchParams();
      if (options?.status) params.append("status", options.status);
      if (options?.from) params.append("from", options.from);
      if (options?.to) params.append("to", options.to);

      return this._request<Handoff[]>(
        `/api/orchestration/handoffs?${params}`
      );
    },

    waitForHandoff: async (id: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const check = async () => {
          try {
            const handoff = await this.orchestration.getHandoff(id);
            if (handoff.status === "completed" || handoff.status === "failed") {
              resolve();
            } else {
              setTimeout(check, 1000);
            }
          } catch (error: any) {
            reject(error);
          }
        };
        check();
      });
    },

    loop: async (options: LoopOptions): Promise<LoopResult> => {
      return this._request<LoopResult>("/api/orchestration/loops", {
        method: "POST",
        body: JSON.stringify(options),
      });
    },

    getLoopStatus: async (id: string): Promise<LoopStatus> => {
      return this._request<LoopStatus>(`/api/orchestration/loops/${id}`);
    },

    stopLoop: async (id: string): Promise<void> => {
      await this._request(`/api/orchestration/loops/${id}`, {
        method: "DELETE",
      });
    },

    listLoops: async (options?: LoopListOptions): Promise<LoopStatus[]> => {
      const params = new URLSearchParams();
      if (options?.status) params.append("status", options.status);

      return this._request<LoopStatus[]>(
        `/api/orchestration/loops?${params}`
      );
    },

    committee: async (options: CommitteeOptions): Promise<CommitteeResult> => {
      return this._request<CommitteeResult>("/api/orchestration/committees", {
        method: "POST",
        body: JSON.stringify(options),
      });
    },

    listCommitteeHistory: async (
      options?: HistoryOptions
    ): Promise<CommitteeRecord[]> => {
      const params = new URLSearchParams();
      if (options?.limit) params.append("limit", options.limit.toString());

      return this._request<CommitteeRecord[]>(
        `/api/orchestration/committees/history?${params}`
      );
    },

    advisor: async (options: AdvisorOptions): Promise<AdvisorResponse> => {
      return this._request<AdvisorResponse>("/api/orchestration/advisor", {
        method: "POST",
        body: JSON.stringify(options),
      });
    },

    listAdvisors: async (): Promise<Advisor[]> => {
      return this._request<Advisor[]>("/api/orchestration/advisors");
    },

    registerAdvisor: async (
      options: RegisterAdvisorOptions
    ): Promise<Advisor> => {
      return this._request<Advisor>("/api/orchestration/advisors", {
        method: "POST",
        body: JSON.stringify(options),
      });
    },

    listAdvisorHistory: async (
      options?: HistoryOptions
    ): Promise<AdvisorHistoryRecord[]> => {
      const params = new URLSearchParams();
      if (options?.limit) params.append("limit", options.limit.toString());
      if (options?.agentName) params.append("agent", options.agentName);

      return this._request<AdvisorHistoryRecord[]>(
        `/api/orchestration/advisor/history?${params}`
      );
    },
  };

  ws = {
    connect: async (): Promise<void> => {
      return new Promise((resolve, reject) => {
        try {
          this._ws = new WebSocket(`ws://localhost:8080`);

          this._ws.onopen = () => {
            console.log("WebSocket connected");
            resolve();
          };

          this._ws.onmessage = (event: MessageEvent) => {
            try {
              const message = JSON.parse(event.data as string);
              const handlers = this._wsHandlers.get(message.type);
              if (handlers) {
                handlers.forEach((handler: (data: any) => void) => handler(message));
              }
            } catch (error: any) {
              console.error("Failed to parse WebSocket message:", error);
            }
          };

          this._ws.onerror = (event: Event) => {
            console.error("WebSocket error:", event);
            reject(event);
          };

          this._ws.onclose = () => {
            console.log("WebSocket disconnected");
          };
        } catch (error: any) {
          reject(error);
        }
      });
    },

    disconnect: (): void => {
      if (this._ws) {
        this._ws.close();
        this._ws = null;
      }
    },

    send: (message: any): void => {
      if (this._ws && this._ws.readyState === WebSocket.OPEN) {
        this._ws.send(JSON.stringify(message));
      }
    },

    on: (event: string, handler: (data: any) => void): void => {
      if (!this._wsHandlers.has(event)) {
        this._wsHandlers.set(event, new Set());
      }
      this._wsHandlers.get(event)!.add(handler);
    },

    off: (event: string, handler: (data: any) => void): void => {
      const handlers = this._wsHandlers.get(event);
      if (handlers) {
        handlers.delete(handler);
      }
    },
  };

  webhook = {
    list: async (): Promise<Webhook[]> => {
      return this._request<Webhook[]>("/api/webhooks");
    },

    create: async (options: WebhookCreateOptions): Promise<Webhook> => {
      return this._request<Webhook>("/api/webhooks", {
        method: "POST",
        body: JSON.stringify(options),
      });
    },

    delete: async (id: string): Promise<void> => {
      await this._request(`/api/webhooks/${id}`, { method: "DELETE" });
    },
  };
}
