import { EventEmitter } from "node:events";
import { WebSocket } from "ws";
import { v4 as uuid } from "uuid";

export interface UnifiedMessage {
  id: string;
  type: string;
  namespace: "paseo" | "multica" | "synapse";
  payload: any;
  timestamp: number;
}

export interface SynapseWebSocketConfig {
  port: number;
  host: string;
  useTls: boolean;
  keyFile?: string;
  certFile?: string;
}

export class SynapseWebSocketServer extends EventEmitter {
  private wss: WebSocket | null = null;
  private clients: Map<string, WebSocket> = new Map();
  private config: SynapseWebSocketConfig;
  private server: any = null;

  constructor(config: Partial<SynapseWebSocketConfig> = {}) {
    super();
    this.config = {
      port: config.port || 8080,
      host: config.host || "localhost",
      useTls: config.useTls || false,
      keyFile: config.keyFile,
      certFile: config.certFile,
    };
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.wss = new WebSocket.Server({
          port: this.config.port,
          host: this.config.host,
        });

        this.wss.on("connection", (ws: WebSocket, req) => {
          const clientId = uuid();
          this.clients.set(clientId, ws);
          
          console.log(`[Synapse] Client connected: ${clientId}`);
          this.emit("client:connected", { clientId, req });

          ws.on("message", (data: Buffer) => {
            try {
              const message = JSON.parse(data.toString()) as UnifiedMessage;
              message.id = message.id || uuid();
              message.timestamp = message.timestamp || Date.now();
              
              this.emit("message", { clientId, message });
              this.handleMessage(clientId, message);
            } catch (error) {
              console.error("[Synapse] Failed to parse message:", error);
              this.emit("error", { clientId, error });
            }
          });

          ws.on("close", () => {
            this.clients.delete(clientId);
            console.log(`[Synapse] Client disconnected: ${clientId}`);
            this.emit("client:disconnected", { clientId });
          });

          ws.on("error", (error) => {
            console.error(`[Synapse] Client error (${clientId}):`, error);
            this.emit("error", { clientId, error });
          });
        });

        this.wss.on("error", (error) => {
          console.error("[Synapse] WebSocket server error:", error);
          reject(error);
        });

        this.wss.on("listening", () => {
          console.log(`[Synapse] WebSocket server listening on ${this.config.host}:${this.config.port}`);
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.wss) {
        this.clients.forEach((ws, clientId) => {
          ws.close();
          console.log(`[Synapse] Closed client: ${clientId}`);
        });
        this.clients.clear();
        
        this.wss.close(() => {
          console.log("[Synapse] WebSocket server stopped");
          this.wss = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  broadcast(message: Partial<UnifiedMessage>, filter?: (clientId: string) => boolean): void {
    const fullMessage: UnifiedMessage = {
      id: uuid(),
      type: message.type || "broadcast",
      namespace: message.namespace || "synapse",
      payload: message.payload || {},
      timestamp: Date.now(),
      ...message,
    };

    this.clients.forEach((ws, clientId) => {
      if (!filter || filter(clientId)) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(fullMessage));
        }
      }
    });
  }

  sendTo(clientId: string, message: Partial<UnifiedMessage>): void {
    const ws = this.clients.get(clientId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      const fullMessage: UnifiedMessage = {
        id: uuid(),
        type: message.type || "message",
        namespace: message.namespace || "synapse",
        payload: message.payload || {},
        timestamp: Date.now(),
        ...message,
      };
      ws.send(JSON.stringify(fullMessage));
    }
  }

  private handleMessage(clientId: string, message: UnifiedMessage): void {
    console.log(`[Synapse] Message from ${clientId}: ${message.namespace}.${message.type}`);
    
    switch (message.namespace) {
      case "paseo":
        this.handlePaseoMessage(clientId, message);
        break;
      case "multica":
        this.handleMulticaMessage(clientId, message);
        break;
      case "synapse":
        this.handleSynapseMessage(clientId, message);
        break;
      default:
        console.warn(`[Synapse] Unknown namespace: ${message.namespace}`);
    }
  }

  private handlePaseoMessage(clientId: string, message: UnifiedMessage): void {
    switch (message.type) {
      case "agent:start":
        this.emit("paseo:agent:start", { clientId, payload: message.payload });
        break;
      case "agent:stop":
        this.emit("paseo:agent:stop", { clientId, payload: message.payload });
        break;
      case "agent:send":
        this.emit("paseo:agent:send", { clientId, payload: message.payload });
        break;
      case "logs:subscribe":
        this.emit("paseo:logs:subscribe", { clientId, payload: message.payload });
        break;
      default:
        this.emit("paseo:message", { clientId, message });
    }
  }

  private handleMulticaMessage(clientId: string, message: UnifiedMessage): void {
    switch (message.type) {
      case "issue:create":
        this.emit("multica:issue:create", { clientId, payload: message.payload });
        break;
      case "issue:update":
        this.emit("multica:issue:update", { clientId, payload: message.payload });
        break;
      case "issue:assign":
        this.emit("multica:issue:assign", { clientId, payload: message.payload });
        break;
      case "run:start":
        this.emit("multica:run:start", { clientId, payload: message.payload });
        break;
      case "autopilot:trigger":
        this.emit("multica:autopilot:trigger", { clientId, payload: message.payload });
        break;
      default:
        this.emit("multica:message", { clientId, message });
    }
  }

  private handleSynapseMessage(clientId: string, message: UnifiedMessage): void {
    switch (message.type) {
      case "cross:handoff":
        this.emit("synapse:cross:handoff", { clientId, payload: message.payload });
        break;
      case "skills:invoke":
        this.emit("synapse:skills:invoke", { clientId, payload: message.payload });
        break;
      case "worktree:create":
        this.emit("synapse:worktree:create", { clientId, payload: message.payload });
        break;
      case "ping":
        this.sendTo(clientId, {
          type: "pong",
          namespace: "synapse",
          payload: { timestamp: Date.now() },
        });
        break;
      default:
        this.emit("synapse:message", { clientId, message });
    }
  }

  getClientCount(): number {
    return this.clients.size;
  }

  getClientIds(): string[] {
    return Array.from(this.clients.keys());
  }
}
