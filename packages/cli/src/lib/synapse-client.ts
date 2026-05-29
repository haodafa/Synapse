import { readFileSync, existsSync } from "node:fs";
import { join, homedir } from "node:path";
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

export interface SynapseClient {
  config: {
    show(): Promise<ConfigShow>;
    set(key: string, value: string): Promise<void>;
  };
  daemon: {
    start(options?: DaemonStartOptions): Promise<void>;
    stop(): Promise<void>;
    status(): Promise<DaemonStatus>;
  };
  agent: {
    list(): Promise<Agent[]>;
    get(id: string): Promise<Agent>;
    create(options: AgentCreateOptions): Promise<Agent>;
    stop(id: string): Promise<void>;
    send(id: string, message: string): Promise<void>;
    attach(id: string): Promise<void>;
    logs(id: string): Promise<AgentLog[]>;
  };
  worktree: {
    list(): Promise<Worktree[]>;
    create(options: WorktreeCreateOptions): Promise<Worktree>;
    delete(id: string): Promise<void>;
  };
  issue: {
    list(options?: IssueListOptions): Promise<Issue[]>;
    get(id: string): Promise<Issue>;
    create(options: IssueCreateOptions): Promise<Issue>;
    update(id: string, options: IssueUpdateOptions): Promise<void>;
    delete(id: string): Promise<void>;
  };
  workspace: {
    list(): Promise<Workspace[]>;
    get(id?: string): Promise<Workspace>;
    switch(id: string): Promise<void>;
    memberList(id?: string): Promise<Member[]>;
  };
  project: {
    list(options?: ProjectListOptions): Promise<Project[]>;
    get(id: string): Promise<Project>;
    create(options: ProjectCreateOptions): Promise<Project>;
    update(id: string, options: ProjectUpdateOptions): Promise<void>;
    delete(id: string): Promise<void>;
  };
  autopilot: {
    list(options?: AutopilotListOptions): Promise<Autopilot[]>;
    get(id: string): Promise<Autopilot>;
    create(options: AutopilotCreateOptions): Promise<Autopilot>;
    trigger(id: string): Promise<AutopilotRun>;
    delete(id: string): Promise<void>;
  };
  skill: {
    list(): Promise<Skill[]>;
    get(id: string): Promise<Skill>;
    create(options: SkillCreateOptions): Promise<Skill>;
    update(id: string, options: SkillUpdateOptions): Promise<void>;
    delete(id: string): Promise<void>;
    recommend(task: string): Promise<Skill[]>;
  };
  squad: {
    list(): Promise<Squad[]>;
    get(id: string): Promise<Squad>;
    create(options: SquadCreateOptions): Promise<Squad>;
    assign(squadId: string, issueId: string): Promise<void>;
    delete(id: string): Promise<void>;
  };
  orchestration: {
    handoff(options: HandoffOptions): Promise<HandoffResult>;
    getHandoff(id: string): Promise<Handoff>;
    listHandoffs(options?: HandoffListOptions): Promise<Handoff[]>;
    waitForHandoff(id: string): Promise<void>;
    loop(options: LoopOptions): Promise<LoopResult>;
    getLoopStatus(id: string): Promise<LoopStatus>;
    stopLoop(id: string): Promise<void>;
    listLoops(options?: LoopListOptions): Promise<LoopStatus[]>;
    committee(options: CommitteeOptions): Promise<CommitteeResult>;
    listCommitteeHistory(options?: HistoryOptions): Promise<CommitteeRecord[]>;
    advisor(options: AdvisorOptions): Promise<AdvisorResponse>;
    listAdvisors(): Promise<Advisor[]>;
    registerAdvisor(options: RegisterAdvisorOptions): Promise<Advisor>;
    listAdvisorHistory(options?: HistoryOptions): Promise<AdvisorHistoryRecord[]>;
  };
  ws: {
    connect(): Promise<void>;
    disconnect(): void;
    send(message: any): void;
    on(event: string, handler: (data: any) => void): void;
    off(event: string, handler: (data: any) => void): void;
  };
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

class SynapseClient implements SynapseClient {
  private config: SynapseConfig;
  private serverUrl: string;
  private ws: WebSocket | null = null;
  private wsHandlers: Map<string, Set<(data: any) => void>> = new Map();

  constructor(config: SynapseConfig) {
    this.config = config;
    this.serverUrl = config.serverUrl || "http://localhost:8080";
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.serverUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(this.config.token ? { Authorization: `Bearer ${this.config.token}` } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  config = {
    async show(): Promise<ConfigShow> {
      return {
        configFile: this.config.configPath,
        serverUrl: this.serverUrl,
        appUrl: this.config.appUrl || "http://localhost:3000",
        workspace: this.config.workspaceId,
        profile: this.config.profile || "default",
      };
    },

    async set(key: string, value: string): Promise<void> {
      switch (key) {
        case "server_url":
          this.config.serverUrl = value;
          break;
        case "app_url":
          this.config.appUrl = value;
          break;
        case "workspace_id":
          this.config.workspaceId = value;
          break;
        case "profile":
          this.config.profile = value;
          break;
      }
      await import("./config.js").then(({ saveConfig }) =>
        saveConfig(this.config)
      );
    },
  };

  daemon = {
    async start(options?: DaemonStartOptions): Promise<void> {
      console.log("Starting Synapse daemon...");
    },

    async stop(): Promise<void> {
      console.log("Stopping Synapse daemon...");
    },

    async status(): Promise<DaemonStatus> {
      return {
        running: true,
        pid: process.pid,
        uptime: "0s",
        version: "0.1.0",
      };
    },
  };

  agent = {
    async list(): Promise<Agent[]> {
      return this.request<Agent[]>("/api/agents");
    },

    async get(id: string): Promise<Agent> {
      return this.request<Agent>(`/api/agents/${id}`);
    },

    async create(options: AgentCreateOptions): Promise<Agent> {
      return this.request<Agent>("/api/agents", {
        method: "POST",
        body: JSON.stringify(options),
      });
    },

    async stop(id: string): Promise<void> {
      await this.request(`/api/agents/${id}/stop`, { method: "POST" });
    },

    async send(id: string, message: string): Promise<void> {
      await this.request(`/api/agents/${id}/send`, {
        method: "POST",
        body: JSON.stringify({ message }),
      });
    },

    async attach(id: string): Promise<void> {
      console.log(`Attaching to agent ${id}...`);
    },

    async logs(id: string): Promise<AgentLog[]> {
      return this.request<AgentLog[]>(`/api/agents/${id}/logs`);
    },
  };

  worktree = {
    async list(): Promise<Worktree[]> {
      return this.request<Worktree[]>("/api/worktrees");
    },

    async create(options: WorktreeCreateOptions): Promise<Worktree> {
      return this.request<Worktree>("/api/worktrees", {
        method: "POST",
        body: JSON.stringify(options),
      });
    },

    async delete(id: string): Promise<void> {
      await this.request(`/api/worktrees/${id}`, { method: "DELETE" });
    },
  };

  issue = {
    async list(options?: IssueListOptions): Promise<Issue[]> {
      const workspaceId = this.config.workspaceId;
      const params = new URLSearchParams();
      if (options?.status) params.append("status", options.status);
      if (options?.priority) params.append("priority", options.priority);
      if (options?.assignee) params.append("assignee", options.assignee);
      if (options?.limit) params.append("limit", options.limit.toString());

      return this.request<Issue[]>(
        `/api/workspaces/${workspaceId}/issues?${params}`
      );
    },

    async get(id: string): Promise<Issue> {
      const workspaceId = this.config.workspaceId;
      return this.request<Issue>(
        `/api/workspaces/${workspaceId}/issues/${id}`
      );
    },

    async create(options: IssueCreateOptions): Promise<Issue> {
      const workspaceId = this.config.workspaceId;
      return this.request<Issue>(`/api/workspaces/${workspaceId}/issues`, {
        method: "POST",
        body: JSON.stringify(options),
      });
    },

    async update(id: string, options: IssueUpdateOptions): Promise<void> {
      const workspaceId = this.config.workspaceId;
      await this.request(`/api/workspaces/${workspaceId}/issues/${id}`, {
        method: "PATCH",
        body: JSON.stringify(options),
      });
    },

    async delete(id: string): Promise<void> {
      const workspaceId = this.config.workspaceId;
      await this.request(`/api/workspaces/${workspaceId}/issues/${id}`, {
        method: "DELETE",
      });
    },
  };

  workspace = {
    async list(): Promise<Workspace[]> {
      return this.request<Workspace[]>("/api/workspaces");
    },

    async get(id?: string): Promise<Workspace> {
      const workspaceId = id || this.config.workspaceId;
      if (!workspaceId) {
        throw new Error("No workspace ID specified");
      }
      return this.request<Workspace>(`/api/workspaces/${workspaceId}`);
    },

    async switch(id: string): Promise<void> {
      this.config.workspaceId = id;
      await import("./config.js").then(({ saveConfig }) =>
        saveConfig(this.config)
      );
    },

    async memberList(id?: string): Promise<Member[]> {
      const workspaceId = id || this.config.workspaceId;
      return this.request<Member[]>(
        `/api/workspaces/${workspaceId}/members`
      );
    },
  };

  project = {
    async list(options?: ProjectListOptions): Promise<Project[]> {
      const workspaceId = this.config.workspaceId;
      const params = new URLSearchParams();
      if (options?.status) params.append("status", options.status);

      return this.request<Project[]>(
        `/api/workspaces/${workspaceId}/projects?${params}`
      );
    },

    async get(id: string): Promise<Project> {
      const workspaceId = this.config.workspaceId;
      return this.request<Project>(
        `/api/workspaces/${workspaceId}/projects/${id}`
      );
    },

    async create(options: ProjectCreateOptions): Promise<Project> {
      const workspaceId = this.config.workspaceId;
      return this.request<Project>(`/api/workspaces/${workspaceId}/projects`, {
        method: "POST",
        body: JSON.stringify(options),
      });
    },

    async update(id: string, options: ProjectUpdateOptions): Promise<void> {
      const workspaceId = this.config.workspaceId;
      await this.request(`/api/workspaces/${workspaceId}/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(options),
      });
    },

    async delete(id: string): Promise<void> {
      const workspaceId = this.config.workspaceId;
      await this.request(`/api/workspaces/${workspaceId}/projects/${id}`, {
        method: "DELETE",
      });
    },
  };

  autopilot = {
    async list(options?: AutopilotListOptions): Promise<Autopilot[]> {
      const workspaceId = this.config.workspaceId;
      const params = new URLSearchParams();
      if (options?.status) params.append("status", options.status);

      return this.request<Autopilot[]>(
        `/api/workspaces/${workspaceId}/autopilots?${params}`
      );
    },

    async get(id: string): Promise<Autopilot> {
      const workspaceId = this.config.workspaceId;
      return this.request<Autopilot>(
        `/api/workspaces/${workspaceId}/autopilots/${id}`
      );
    },

    async create(options: AutopilotCreateOptions): Promise<Autopilot> {
      const workspaceId = this.config.workspaceId;
      return this.request<Autopilot>(
        `/api/workspaces/${workspaceId}/autopilots`,
        {
          method: "POST",
          body: JSON.stringify(options),
        }
      );
    },

    async trigger(id: string): Promise<AutopilotRun> {
      const workspaceId = this.config.workspaceId;
      return this.request<AutopilotRun>(
        `/api/workspaces/${workspaceId}/autopilots/${id}/trigger`,
        { method: "POST" }
      );
    },

    async delete(id: string): Promise<void> {
      const workspaceId = this.config.workspaceId;
      await this.request(
        `/api/workspaces/${workspaceId}/autopilots/${id}`,
        { method: "DELETE" }
      );
    },
  };

  skill = {
    async list(): Promise<Skill[]> {
      return this.request<Skill[]>("/api/skills");
    },

    async get(id: string): Promise<Skill> {
      return this.request<Skill>(`/api/skills/${id}`);
    },

    async create(options: SkillCreateOptions): Promise<Skill> {
      return this.request<Skill>("/api/skills", {
        method: "POST",
        body: JSON.stringify(options),
      });
    },

    async update(id: string, options: SkillUpdateOptions): Promise<void> {
      await this.request(`/api/skills/${id}`, {
        method: "PATCH",
        body: JSON.stringify(options),
      });
    },

    async delete(id: string): Promise<void> {
      await this.request(`/api/skills/${id}`, { method: "DELETE" });
    },

    async recommend(task: string): Promise<Skill[]> {
      return this.request<Skill[]>("/api/skills/recommend", {
        method: "POST",
        body: JSON.stringify({ task }),
      });
    },
  };

  squad = {
    async list(): Promise<Squad[]> {
      const workspaceId = this.config.workspaceId;
      return this.request<Squad[]>(`/api/workspaces/${workspaceId}/squads`);
    },

    async get(id: string): Promise<Squad> {
      const workspaceId = this.config.workspaceId;
      return this.request<Squad>(`/api/workspaces/${workspaceId}/squads/${id}`);
    },

    async create(options: SquadCreateOptions): Promise<Squad> {
      const workspaceId = this.config.workspaceId;
      return this.request<Squad>(`/api/workspaces/${workspaceId}/squads`, {
        method: "POST",
        body: JSON.stringify(options),
      });
    },

    async assign(squadId: string, issueId: string): Promise<void> {
      const workspaceId = this.config.workspaceId;
      await this.request(
        `/api/workspaces/${workspaceId}/squads/${squadId}/assign`,
        {
          method: "POST",
          body: JSON.stringify({ issueId }),
        }
      );
    },

    async delete(id: string): Promise<void> {
      const workspaceId = this.config.workspaceId;
      await this.request(`/api/workspaces/${workspaceId}/squads/${id}`, {
        method: "DELETE",
      });
    },
  };

  orchestration = {
    async handoff(options: HandoffOptions): Promise<HandoffResult> {
      return this.request<HandoffResult>("/api/orchestration/handoffs", {
        method: "POST",
        body: JSON.stringify(options),
      });
    },

    async getHandoff(id: string): Promise<Handoff> {
      return this.request<Handoff>(`/api/orchestration/handoffs/${id}`);
    },

    async listHandoffs(options?: HandoffListOptions): Promise<Handoff[]> {
      const params = new URLSearchParams();
      if (options?.status) params.append("status", options.status);
      if (options?.from) params.append("from", options.from);
      if (options?.to) params.append("to", options.to);

      return this.request<Handoff[]>(
        `/api/orchestration/handoffs?${params}`
      );
    },

    async waitForHandoff(id: string): Promise<void> {
      return new Promise((resolve, reject) => {
        const check = async () => {
          try {
            const handoff = await this.orchestration.getHandoff(id);
            if (handoff.status === "completed" || handoff.status === "failed") {
              resolve();
            } else {
              setTimeout(check, 1000);
            }
          } catch (error) {
            reject(error);
          }
        };
        check();
      });
    },

    async loop(options: LoopOptions): Promise<LoopResult> {
      return this.request<LoopResult>("/api/orchestration/loops", {
        method: "POST",
        body: JSON.stringify(options),
      });
    },

    async getLoopStatus(id: string): Promise<LoopStatus> {
      return this.request<LoopStatus>(`/api/orchestration/loops/${id}`);
    },

    async stopLoop(id: string): Promise<void> {
      await this.request(`/api/orchestration/loops/${id}`, {
        method: "DELETE",
      });
    },

    async listLoops(options?: LoopListOptions): Promise<LoopStatus[]> {
      const params = new URLSearchParams();
      if (options?.status) params.append("status", options.status);

      return this.request<LoopStatus[]>(
        `/api/orchestration/loops?${params}`
      );
    },

    async committee(options: CommitteeOptions): Promise<CommitteeResult> {
      return this.request<CommitteeResult>("/api/orchestration/committees", {
        method: "POST",
        body: JSON.stringify(options),
      });
    },

    async listCommitteeHistory(
      options?: HistoryOptions
    ): Promise<CommitteeRecord[]> {
      const params = new URLSearchParams();
      if (options?.limit) params.append("limit", options.limit.toString());

      return this.request<CommitteeRecord[]>(
        `/api/orchestration/committees/history?${params}`
      );
    },

    async advisor(options: AdvisorOptions): Promise<AdvisorResponse> {
      return this.request<AdvisorResponse>("/api/orchestration/advisor", {
        method: "POST",
        body: JSON.stringify(options),
      });
    },

    async listAdvisors(): Promise<Advisor[]> {
      return this.request<Advisor[]>("/api/orchestration/advisors");
    },

    async registerAdvisor(
      options: RegisterAdvisorOptions
    ): Promise<Advisor> {
      return this.request<Advisor>("/api/orchestration/advisors", {
        method: "POST",
        body: JSON.stringify(options),
      });
    },

    async listAdvisorHistory(
      options?: HistoryOptions
    ): Promise<AdvisorHistoryRecord[]> {
      const params = new URLSearchParams();
      if (options?.limit) params.append("limit", options.limit.toString());
      if (options?.agentName) params.append("agent", options.agentName);

      return this.request<AdvisorHistoryRecord[]>(
        `/api/orchestration/advisor/history?${params}`
      );
    },
  };

  ws = {
    async connect(): Promise<void> {
      return new Promise((resolve, reject) => {
        try {
          this.ws = new WebSocket(`ws://localhost:8080`);

          this.ws.onopen = () => {
            console.log("WebSocket connected");
            resolve();
          };

          this.ws.onmessage = (event) => {
            try {
              const message = JSON.parse(event.data);
              const handlers = this.wsHandlers.get(message.type);
              if (handlers) {
                handlers.forEach((handler) => handler(message));
              }
            } catch (error) {
              console.error("Failed to parse WebSocket message:", error);
            }
          };

          this.ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            reject(error);
          };

          this.ws.onclose = () => {
            console.log("WebSocket disconnected");
          };
        } catch (error) {
          reject(error);
        }
      });
    },

    disconnect(): void {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
    },

    send(message: any): void {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      }
    },

    on(event: string, handler: (data: any) => void): void {
      if (!this.wsHandlers.has(event)) {
        this.wsHandlers.set(event, new Set());
      }
      this.wsHandlers.get(event)!.add(handler);
    },

    off(event: string, handler: (data: any) => void): void {
      const handlers = this.wsHandlers.get(event);
      if (handlers) {
        handlers.delete(handler);
      }
    },
  };
}
