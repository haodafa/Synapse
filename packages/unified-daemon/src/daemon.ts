import express from "express";
import { createServer } from "node:http";
import { v4 as uuid } from "uuid";
import pino from "pino";
import { SynapseWebSocketServer } from "./websocket.js";
import {
  Command,
  AgentInfo,
  Issue,
  Run,
  Autopilot,
  Skill,
  Workspace,
  Project,
  Worktree,
} from "./types.js";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

export class UnifiedDaemon {
  private wsServer: SynapseWebSocketServer;
  private httpServer: ReturnType<typeof createServer>;
  private app: express.Application;
  
  private agents: Map<string, AgentInfo> = new Map();
  private issues: Map<string, Issue> = new Map();
  private runs: Map<string, Run> = new Map();
  private autopilots: Map<string, Autopilot> = new Map();
  private skills: Map<string, Skill> = new Map();
  private workspaces: Map<string, Workspace> = new Map();
  private projects: Map<string, Project> = new Map();
  private worktrees: Map<string, Worktree> = new Map();

  private defaultWorkspaceId = "ws-default";

  constructor() {
    this.wsServer = new SynapseWebSocketServer({
      port: parseInt(process.env.WS_PORT || "8080"),
      host: process.env.WS_HOST || "localhost",
    });

    this.app = express();
    this.httpServer = createServer(this.app);

    this.setupExpressRoutes();
    this.setupWebSocketHandlers();
    this.setupSignalHandlers();
    
    this.initializeDefaultData();
  }

  private setupExpressRoutes(): void {
    this.app.use(express.json());

    // Health check
    this.app.get("/health", (req, res) => {
      res.json({
        status: "healthy",
        version: "0.1.0",
        uptime: process.uptime(),
        agents: this.agents.size,
        issues: this.issues.size,
      });
    });

    // ============ PASEO-STYLE AGENT ROUTES ============
    
    this.app.get("/api/agents", (req, res) => {
      const agents = Array.from(this.agents.values());
      res.json(agents);
    });

    this.app.get("/api/agents/:id", (req, res) => {
      const agent = this.agents.get(req.params.id);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      res.json(agent);
    });

    this.app.post("/api/agents/:id/stop", (req, res) => {
      const agent = this.agents.get(req.params.id);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      agent.status = "cancelled";
      this.agents.set(req.params.id, agent);
      this.broadcastEvent("agent:stopped", { agent });
      res.json({ success: true });
    });

    this.app.post("/api/agents/:id/send", (req, res) => {
      const agent = this.agents.get(req.params.id);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      this.broadcastEvent("agent:message", {
        agentId: req.params.id,
        message: req.body.message,
      });
      res.json({ success: true });
    });

    // ============ WORKTREE ROUTES ============

    this.app.get("/api/worktrees", (req, res) => {
      const worktrees = Array.from(this.worktrees.values());
      res.json(worktrees);
    });

    this.app.post("/api/worktrees", async (req, res) => {
      try {
        const worktree: Worktree = {
          id: uuid(),
          name: req.body.name || `wt-${Date.now()}`,
          branch: req.body.branch,
          path: req.body.path,
          baseBranch: req.body.baseBranch,
          agentId: req.body.agentId,
          issueId: req.body.issueId,
          status: "active",
          createdAt: new Date().toISOString(),
        };
        
        this.worktrees.set(worktree.id, worktree);
        this.broadcastEvent("worktree:created", { worktree });
        res.json(worktree);
      } catch (error) {
        res.status(400).json({ error: "Failed to create worktree" });
      }
    });

    // ============ MULTICA-STYLE WORKSPACE ROUTES ============

    this.app.get("/api/workspaces", (req, res) => {
      const workspaces = Array.from(this.workspaces.values());
      res.json(workspaces);
    });

    this.app.get("/api/workspaces/:id", (req, res) => {
      const workspace = this.workspaces.get(req.params.id);
      if (!workspace) {
        return res.status(404).json({ error: "Workspace not found" });
      }
      res.json(workspace);
    });

    this.app.get("/api/workspaces/:id/members", (req, res) => {
      res.json([]);
    });

    // ============ MULTICA-STYLE ISSUE ROUTES ============

    this.app.get("/api/workspaces/:workspaceId/issues", (req, res) => {
      const issues = Array.from(this.issues.values());
      const filtered = issues.filter((issue) => {
        if (req.query.status) {
          return issue.status === req.query.status;
        }
        return true;
      });
      res.json(filtered);
    });

    this.app.get("/api/workspaces/:workspaceId/issues/:id", (req, res) => {
      const issue = this.issues.get(req.params.id);
      if (!issue) {
        return res.status(404).json({ error: "Issue not found" });
      }
      res.json(issue);
    });

    this.app.post("/api/workspaces/:workspaceId/issues", (req, res) => {
      const issue: Issue = {
        id: uuid(),
        key: `ISS-${Date.now().toString(36).toUpperCase()}`,
        title: req.body.title,
        description: req.body.description,
        status: req.body.status || "backlog",
        priority: req.body.priority || "medium",
        assigneeId: req.body.assigneeId,
        assignee: req.body.assignee,
        projectId: req.body.projectId,
        parentId: req.body.parent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: req.body.createdBy,
        metadata: {},
        tags: [],
        blockedBy: [],
        blocking: [],
      };

      this.issues.set(issue.id, issue);
      this.broadcastEvent("issue:created", { issue });
      res.json(issue);
    });

    this.app.patch("/api/workspaces/:workspaceId/issues/:id", (req, res) => {
      const issue = this.issues.get(req.params.id);
      if (!issue) {
        return res.status(404).json({ error: "Issue not found" });
      }

      Object.assign(issue, req.body, { updatedAt: new Date().toISOString() });
      this.issues.set(issue.id, issue);
      this.broadcastEvent("issue:updated", { issue });
      res.json(issue);
    });

    this.app.post("/api/workspaces/:workspaceId/issues/:id/status", (req, res) => {
      const issue = this.issues.get(req.params.id);
      if (!issue) {
        return res.status(404).json({ error: "Issue not found" });
      }

      issue.status = req.body.status;
      issue.updatedAt = new Date().toISOString();
      this.issues.set(issue.id, issue);
      this.broadcastEvent("issue:status_changed", { issue });
      res.json(issue);
    });

    this.app.post("/api/workspaces/:workspaceId/issues/:id/assign", (req, res) => {
      const issue = this.issues.get(req.params.id);
      if (!issue) {
        return res.status(404).json({ error: "Issue not found" });
      }

      issue.assigneeId = req.body.assignee;
      issue.assignee = req.body.assignee;
      issue.updatedAt = new Date().toISOString();
      this.issues.set(issue.id, issue);
      this.broadcastEvent("issue:assigned", { issue });
      res.json(issue);
    });

    // ============ MULTICA-STYLE PROJECT ROUTES ============

    this.app.get("/api/workspaces/:workspaceId/projects", (req, res) => {
      const projects = Array.from(this.projects.values()).filter(
        (p) => p.workspaceId === req.params.workspaceId
      );
      res.json(projects);
    });

    this.app.post("/api/workspaces/:workspaceId/projects", (req, res) => {
      const project: Project = {
        id: uuid(),
        title: req.body.title,
        icon: req.body.icon,
        description: req.body.description,
        status: req.body.status || "planned",
        leadId: req.body.lead,
        lead: req.body.lead,
        workspaceId: req.params.workspaceId,
        issueCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.projects.set(project.id, project);
      this.broadcastEvent("project:created", { project });
      res.json(project);
    });

    // ============ MULTICA-STYLE AUTOPILOT ROUTES ============

    this.app.get("/api/workspaces/:workspaceId/autopilots", (req, res) => {
      const autopilots = Array.from(this.autopilots.values()).filter(
        (a) => a.workspaceId === req.params.workspaceId
      );
      res.json(autopilots);
    });

    this.app.post("/api/workspaces/:workspaceId/autopilots", (req, res) => {
      const autopilot: Autopilot = {
        id: uuid(),
        title: req.body.title,
        description: req.body.description,
        agent: req.body.agent,
        mode: req.body.mode || "create_issue",
        status: "active",
        triggers: req.body.triggers || [],
        workspaceId: req.params.workspaceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.autopilots.set(autopilot.id, autopilot);
      this.broadcastEvent("autopilot:created", { autopilot });
      res.json(autopilot);
    });

    this.app.post("/api/workspaces/:workspaceId/autopilots/:id/trigger", (req, res) => {
      const autopilot = this.autopilots.get(req.params.id);
      if (!autopilot) {
        return res.status(404).json({ error: "Autopilot not found" });
      }

      const run: Run = {
        id: uuid(),
        issueId: "",
        agentId: "",
        agentName: autopilot.agent,
        status: "running",
        startedAt: new Date().toISOString(),
      };

      this.runs.set(run.id, run);
      this.broadcastEvent("autopilot:triggered", { autopilot, run });
      res.json(run);
    });

    // ============ SKILLS ROUTES ============

    this.app.get("/api/skills", (req, res) => {
      const skills = Array.from(this.skills.values());
      res.json(skills);
    });

    this.app.post("/api/skills", (req, res) => {
      const skill: Skill = {
        id: uuid(),
        title: req.body.title,
        description: req.body.description,
        agentType: req.body.agentType,
        prompt: req.body.prompt,
        verificationSteps: req.body.verificationSteps,
        examples: req.body.examples,
        workspaceId: req.body.workspaceId || this.defaultWorkspaceId,
        createdBy: req.body.createdBy,
        usageCount: 0,
        successRate: 0,
        tags: req.body.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.skills.set(skill.id, skill);
      this.broadcastEvent("skill:created", { skill });
      res.json(skill);
    });

    // ============ RUNS ROUTES ============

    this.app.get("/api/workspaces/:workspaceId/issues/:issueId/runs", (req, res) => {
      const runs = Array.from(this.runs.values()).filter(
        (r) => r.issueId === req.params.issueId
      );
      res.json(runs);
    });
  }

  private setupWebSocketHandlers(): void {
    this.wsServer.on("paseo:agent:start", ({ clientId, payload }) => {
      this.handleAgentStart(clientId, payload);
    });

    this.wsServer.on("paseo:agent:stop", ({ clientId, payload }) => {
      this.handleAgentStop(clientId, payload);
    });

    this.wsServer.on("multica:issue:create", ({ clientId, payload }) => {
      this.handleIssueCreate(clientId, payload);
    });

    this.wsServer.on("multica:run:start", ({ clientId, payload }) => {
      this.handleRunStart(clientId, payload);
    });

    this.wsServer.on("synapse:cross:handoff", ({ clientId, payload }) => {
      this.handleCrossHandoff(clientId, payload);
    });

    this.wsServer.on("synapse:worktree:create", ({ clientId, payload }) => {
      this.handleWorktreeCreate(clientId, payload);
    });
  }

  private setupSignalHandlers(): void {
    process.on("SIGINT", () => {
      logger.info("Received SIGINT, shutting down gracefully...");
      this.shutdown();
    });

    process.on("SIGTERM", () => {
      logger.info("Received SIGTERM, shutting down gracefully...");
      this.shutdown();
    });
  }

  private initializeDefaultData(): void {
    const defaultWorkspace: Workspace = {
      id: this.defaultWorkspaceId,
      name: "Default Workspace",
      slug: "default",
      description: "Default Synapse workspace",
      isDefault: true,
      createdAt: new Date().toISOString(),
      memberCount: 1,
      agentCount: 0,
    };
    this.workspaces.set(this.defaultWorkspaceId, defaultWorkspace);

    logger.info("Initialized default workspace");
  }

  private handleAgentStart(clientId: string, payload: any): void {
    const agent: AgentInfo = {
      id: payload.id || uuid(),
      name: payload.name || `Agent-${Date.now().toString(36)}`,
      provider: payload.provider || "claude_code",
      status: "starting",
      createdAt: new Date().toISOString(),
      workspaceId: payload.workspaceId || this.defaultWorkspaceId,
      worktree: payload.worktree,
      issueId: payload.issueId,
    };

    this.agents.set(agent.id, agent);
    this.broadcastEvent("agent:started", { agent });
    
    setTimeout(() => {
      agent.status = "running";
      agent.startedAt = new Date().toISOString();
      this.agents.set(agent.id, agent);
      this.broadcastEvent("agent:status", { agent });
    }, 1000);
  }

  private handleAgentStop(clientId: string, payload: any): void {
    const agent = this.agents.get(payload.agentId);
    if (agent) {
      agent.status = "cancelled";
      agent.completedAt = new Date().toISOString();
      this.agents.set(agent.id, agent);
      this.broadcastEvent("agent:stopped", { agent });
    }
  }

  private handleIssueCreate(clientId: string, payload: any): void {
    const issue: Issue = {
      id: uuid(),
      key: `ISS-${Date.now().toString(36).toUpperCase()}`,
      title: payload.title,
      description: payload.description,
      status: "backlog",
      priority: payload.priority || "medium",
      assigneeId: payload.assigneeId,
      assignee: payload.assignee,
      projectId: payload.projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {},
      tags: [],
      blockedBy: [],
      blocking: [],
    };

    this.issues.set(issue.id, issue);
    this.broadcastEvent("issue:created", { issue });
  }

  private handleRunStart(clientId: string, payload: any): void {
    const run: Run = {
      id: uuid(),
      issueId: payload.issueId,
      agentId: payload.agentId,
      agentName: payload.agentName,
      status: "pending",
      startedAt: new Date().toISOString(),
    };

    this.runs.set(run.id, run);
    this.broadcastEvent("run:started", { run });
  }

  private handleCrossHandoff(clientId: string, payload: any): void {
    logger.info("Processing cross-handoff", { payload });
    this.broadcastEvent("handoff:executed", {
      fromAgent: payload.fromAgent,
      toAgent: payload.toAgent,
      context: payload.context,
    });
  }

  private handleWorktreeCreate(clientId: string, payload: any): void {
    const worktree: Worktree = {
      id: uuid(),
      name: payload.name,
      branch: payload.branch,
      path: payload.path,
      baseBranch: payload.baseBranch,
      agentId: payload.agentId,
      issueId: payload.issueId,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    this.worktrees.set(worktree.id, worktree);
    this.broadcastEvent("worktree:created", { worktree });
  }

  private broadcastEvent(type: string, payload: any): void {
    this.wsServer.broadcast({
      type,
      namespace: "synapse",
      payload,
    });
  }

  async start(): Promise<void> {
    try {
      await this.wsServer.start();
      
      this.httpServer.listen(8080, () => {
        logger.info("Synapse Unified Daemon started");
        logger.info(`  HTTP API: http://localhost:8080`);
        logger.info(`  WebSocket: ws://localhost:8080`);
      });
    } catch (error) {
      logger.error("Failed to start daemon:", error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    logger.info("Shutting down Synapse Unified Daemon...");
    
    await this.wsServer.stop();
    
    this.httpServer.close(() => {
      logger.info("HTTP server closed");
    });

    process.exit(0);
  }

  getStats() {
    return {
      agents: this.agents.size,
      issues: this.issues.size,
      runs: this.runs.size,
      autopilots: this.autopilots.size,
      skills: this.skills.size,
      workspaces: this.workspaces.size,
      projects: this.projects.size,
      worktrees: this.worktrees.size,
      wsClients: this.wsServer.getClientCount(),
    };
  }
}

const daemon = new UnifiedDaemon();
daemon.start().catch((error) => {
  logger.error("Fatal error:", error);
  process.exit(1);
});
