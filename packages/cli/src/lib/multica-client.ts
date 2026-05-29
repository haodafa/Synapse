import { readFileSync, existsSync } from "node:fs";
import { join, homedir } from "node:path";
import { SynapseConfig, loadConfig } from "./config.js";

let cachedClient: SynapseClient | null = null;

export async function getMulticaClient(): Promise<SynapseClient> {
  if (cachedClient) {
    return cachedClient;
  }
  
  const config = await loadConfig();
  cachedClient = new SynapseClient(config);
  return cachedClient;
}

export interface MulticaClient {
  auth: {
    login(): Promise<void>;
    logout(): Promise<void>;
    status(): Promise<AuthStatus>;
  };
  config: {
    show(): Promise<ConfigShow>;
    set(key: string, value: string): Promise<void>;
  };
  workspace: {
    list(): Promise<Workspace[]>;
    get(id?: string): Promise<Workspace>;
    switch(id: string): Promise<void>;
    memberList(id?: string): Promise<Member[]>;
  };
  issue: {
    list(options?: IssueListOptions): Promise<Issue[]>;
    get(id: string): Promise<Issue>;
    create(options: IssueCreateOptions): Promise<Issue>;
    update(id: string, options: IssueUpdateOptions): Promise<void>;
    assign(id: string, assignee: string): Promise<void>;
    unassign(id: string): Promise<void>;
    setStatus(id: string, status: string): Promise<void>;
    commentList(issueId: string, options?: CommentListOptions): Promise<Comment[]>;
    commentAdd(issueId: string, content: string, parentId?: string): Promise<void>;
    metadataList(issueId: string): Promise<Record<string, any>>;
    metadataSet(issueId: string, key: string, value: any, type?: string): Promise<void>;
    subscriberList(issueId: string): Promise<Subscriber[]>;
    subscriberAdd(issueId: string, user?: string): Promise<void>;
    runs(issueId: string): Promise<Run[]>;
  };
  project: {
    list(options?: ProjectListOptions): Promise<Project[]>;
    get(id: string): Promise<Project>;
    create(options: ProjectCreateOptions): Promise<Project>;
    update(id: string, options: ProjectUpdateOptions): Promise<void>;
    setStatus(id: string, status: string): Promise<void>;
    delete(id: string): Promise<void>;
  };
  autopilot: {
    list(options?: AutopilotListOptions): Promise<Autopilot[]>;
    get(id: string): Promise<Autopilot>;
    create(options: AutopilotCreateOptions): Promise<Autopilot>;
    update(id: string, options: AutopilotUpdateOptions): Promise<void>;
    delete(id: string): Promise<void>;
    trigger(id: string): Promise<AutopilotRun>;
    runs(id: string, limit?: number): Promise<AutopilotRun[]>;
    addTrigger(autopilotId: string, trigger: TriggerOptions): Promise<Trigger>;
    updateTrigger(autopilotId: string, triggerId: string, options: TriggerUpdateOptions): Promise<void>;
    deleteTrigger(autopilotId: string, triggerId: string): Promise<void>;
  };
  daemon: {
    start(options?: DaemonStartOptions): Promise<void>;
    stop(): Promise<void>;
    status(): Promise<DaemonStatus>;
  };
  agent: {
    list(): Promise<Agent[]>;
    get(id: string): Promise<Agent>;
  };
}

interface AuthStatus {
  authenticated: boolean;
  server?: string;
  user?: string;
  expiresAt?: string;
}

interface ConfigShow {
  configFile: string;
  serverUrl: string;
  appUrl: string;
  workspace?: string;
  profile: string;
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

interface Issue {
  id: string;
  key: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignee?: string;
  assigneeId?: string;
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
}

interface Comment {
  id: string;
  content: string;
  actor: string;
  actorType: "user" | "agent";
  createdAt: string;
}

interface CommentListOptions {
  thread?: string;
  recent?: number;
}

interface Subscriber {
  id: string;
  name: string;
  email?: string;
}

interface Run {
  id: string;
  status: string;
  startedAt: string;
  completedAt?: string;
}

interface Project {
  id: string;
  title: string;
  icon?: string;
  description?: string;
  status: string;
  lead?: string;
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
  triggers: Trigger[];
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
}

interface AutopilotUpdateOptions {
  title?: string;
  description?: string;
  agent?: string;
  status?: string;
}

interface AutopilotRun {
  id: string;
  status: string;
  triggeredAt: string;
}

interface Trigger {
  id: string;
  type: string;
  cron?: string;
  timezone?: string;
  enabled?: boolean;
}

interface TriggerOptions {
  type: string;
  cron: string;
  timezone: string;
}

interface TriggerUpdateOptions {
  cron?: string;
  timezone?: string;
  enabled?: boolean;
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
  runtime?: string;
}

class SynapseClient implements MulticaClient {
  private config: SynapseConfig;
  private serverUrl: string;

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

  auth = {
    async login(): Promise<void> {
      console.log("Opening browser for authentication...");
      const authUrl = `${this.serverUrl}/auth/login`;
      
      try {
        const response = await fetch(`${this.serverUrl}/api/auth/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ /* token flow */ }),
        });
        
        if (!response.ok) {
          console.log(`Visit ${chalkblue(authUrl)} to authenticate`);
        }
      } catch {
        console.log(`Visit ${chalkblue(authUrl)} to authenticate`);
      }
    },

    async logout(): Promise<void> {
      this.config.token = undefined;
      this.saveConfig();
    },

    async status(): Promise<AuthStatus> {
      if (!this.config.token) {
        return { authenticated: false };
      }

      try {
        const data = await this.request<any>("/api/auth/status");
        return {
          authenticated: true,
          server: this.serverUrl,
          user: data.user?.email || "Unknown",
          expiresAt: data.expiresAt,
        };
      } catch {
        return { authenticated: false };
      }
    },
  };

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
      this.saveConfig();
    },
  };

  workspace = {
    async list(): Promise<Workspace[]> {
      return this.request<Workspace[]>(`/api/workspaces`);
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
      this.saveConfig();
    },

    async memberList(id?: string): Promise<Member[]> {
      const workspaceId = id || this.config.workspaceId;
      return this.request<Member[]>(`/api/workspaces/${workspaceId}/members`);
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
      
      return this.request<Issue[]>(`/api/workspaces/${workspaceId}/issues?${params}`);
    },

    async get(id: string): Promise<Issue> {
      const workspaceId = this.config.workspaceId;
      return this.request<Issue>(`/api/workspaces/${workspaceId}/issues/${id}`);
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

    async assign(id: string, assignee: string): Promise<void> {
      const workspaceId = this.config.workspaceId;
      await this.request(`/api/workspaces/${workspaceId}/issues/${id}/assign`, {
        method: "POST",
        body: JSON.stringify({ assignee }),
      });
    },

    async unassign(id: string): Promise<void> {
      const workspaceId = this.config.workspaceId;
      await this.request(`/api/workspaces/${workspaceId}/issues/${id}/unassign`, {
        method: "POST",
      });
    },

    async setStatus(id: string, status: string): Promise<void> {
      const workspaceId = this.config.workspaceId;
      await this.request(`/api/workspaces/${workspaceId}/issues/${id}/status`, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
    },

    async commentList(issueId: string, options?: CommentListOptions): Promise<Comment[]> {
      const workspaceId = this.config.workspaceId;
      const params = new URLSearchParams();
      if (options?.thread) params.append("thread", options.thread);
      if (options?.recent) params.append("recent", options.recent.toString());
      
      return this.request<Comment[]>(`/api/workspaces/${workspaceId}/issues/${issueId}/comments?${params}`);
    },

    async commentAdd(issueId: string, content: string, parentId?: string): Promise<void> {
      const workspaceId = this.config.workspaceId;
      await this.request(`/api/workspaces/${workspaceId}/issues/${issueId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content, parentId }),
      });
    },

    async metadataList(issueId: string): Promise<Record<string, any>> {
      const workspaceId = this.config.workspaceId;
      return this.request<Record<string, any>>(`/api/workspaces/${workspaceId}/issues/${issueId}/metadata`);
    },

    async metadataSet(issueId: string, key: string, value: any, type?: string): Promise<void> {
      const workspaceId = this.config.workspaceId;
      await this.request(`/api/workspaces/${workspaceId}/issues/${issueId}/metadata/${key}`, {
        method: "PUT",
        body: JSON.stringify({ value, type }),
      });
    },

    async subscriberList(issueId: string): Promise<Subscriber[]> {
      const workspaceId = this.config.workspaceId;
      return this.request<Subscriber[]>(`/api/workspaces/${workspaceId}/issues/${issueId}/subscribers`);
    },

    async subscriberAdd(issueId: string, user?: string): Promise<void> {
      const workspaceId = this.config.workspaceId;
      await this.request(`/api/workspaces/${workspaceId}/issues/${issueId}/subscribers`, {
        method: "POST",
        body: JSON.stringify({ user }),
      });
    },

    async runs(issueId: string): Promise<Run[]> {
      const workspaceId = this.config.workspaceId;
      return this.request<Run[]>(`/api/workspaces/${workspaceId}/issues/${issueId}/runs`);
    },
  };

  project = {
    async list(options?: ProjectListOptions): Promise<Project[]> {
      const workspaceId = this.config.workspaceId;
      const params = new URLSearchParams();
      if (options?.status) params.append("status", options.status);
      
      return this.request<Project[]>(`/api/workspaces/${workspaceId}/projects?${params}`);
    },

    async get(id: string): Promise<Project> {
      const workspaceId = this.config.workspaceId;
      return this.request<Project>(`/api/workspaces/${workspaceId}/projects/${id}`);
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

    async setStatus(id: string, status: string): Promise<void> {
      const workspaceId = this.config.workspaceId;
      await this.request(`/api/workspaces/${workspaceId}/projects/${id}/status`, {
        method: "POST",
        body: JSON.stringify({ status }),
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
      
      return this.request<Autopilot[]>(`/api/workspaces/${workspaceId}/autopilots?${params}`);
    },

    async get(id: string): Promise<Autopilot> {
      const workspaceId = this.config.workspaceId;
      return this.request<Autopilot>(`/api/workspaces/${workspaceId}/autopilots/${id}`);
    },

    async create(options: AutopilotCreateOptions): Promise<Autopilot> {
      const workspaceId = this.config.workspaceId;
      return this.request<Autopilot>(`/api/workspaces/${workspaceId}/autopilots`, {
        method: "POST",
        body: JSON.stringify(options),
      });
    },

    async update(id: string, options: AutopilotUpdateOptions): Promise<void> {
      const workspaceId = this.config.workspaceId;
      await this.request(`/api/workspaces/${workspaceId}/autopilots/${id}`, {
        method: "PATCH",
        body: JSON.stringify(options),
      });
    },

    async delete(id: string): Promise<void> {
      const workspaceId = this.config.workspaceId;
      await this.request(`/api/workspaces/${workspaceId}/autopilots/${id}`, {
        method: "DELETE",
      });
    },

    async trigger(id: string): Promise<AutopilotRun> {
      const workspaceId = this.config.workspaceId;
      return this.request<AutopilotRun>(`/api/workspaces/${workspaceId}/autopilots/${id}/trigger`, {
        method: "POST",
      });
    },

    async runs(id: string, limit: number = 50): Promise<AutopilotRun[]> {
      const workspaceId = this.config.workspaceId;
      return this.request<AutopilotRun[]>(`/api/workspaces/${workspaceId}/autopilots/${id}/runs?limit=${limit}`);
    },

    async addTrigger(autopilotId: string, trigger: TriggerOptions): Promise<Trigger> {
      const workspaceId = this.config.workspaceId;
      return this.request<Trigger>(`/api/workspaces/${workspaceId}/autopilots/${autopilotId}/triggers`, {
        method: "POST",
        body: JSON.stringify(trigger),
      });
    },

    async updateTrigger(autopilotId: string, triggerId: string, options: TriggerUpdateOptions): Promise<void> {
      const workspaceId = this.config.workspaceId;
      await this.request(`/api/workspaces/${workspaceId}/autopilots/${autopilotId}/triggers/${triggerId}`, {
        method: "PATCH",
        body: JSON.stringify(options),
      });
    },

    async deleteTrigger(autopilotId: string, triggerId: string): Promise<void> {
      const workspaceId = this.config.workspaceId;
      await this.request(`/api/workspaces/${workspaceId}/autopilots/${autopilotId}/triggers/${triggerId}`, {
        method: "DELETE",
      });
    },
  };

  daemon = {
    async start(options?: DaemonStartOptions): Promise<void> {
      console.log("Starting Synapse daemon...");
      // In a real implementation, this would spawn the daemon process
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
  };

  private saveConfig() {
    const configPath = this.config.configPath;
    const configData = {
      serverUrl: this.config.serverUrl,
      appUrl: this.config.appUrl,
      workspaceId: this.config.workspaceId,
      profile: this.config.profile,
      token: this.config.token,
    };
    
    try {
      const fs = require("node:fs");
      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
    } catch (error) {
      console.error("Failed to save config:", error);
    }
  }
}

function chalkblue(text: string): string {
  return `\x1b[36m${text}\x1b[0m`;
}
