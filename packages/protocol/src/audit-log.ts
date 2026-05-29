/**
 * Synapse Audit Log System
 * Comprehensive audit logging for security and compliance
 */

import { z } from 'zod';

// ==================== Types ====================

export enum AuditAction {
  // Auth & Session
  LOGIN_SUCCESS = 'login.success',
  LOGIN_FAILURE = 'login.failure',
  LOGOUT = 'logout',
  SESSION_EXPIRED = 'session.expired',
  TOKEN_REFRESHED = 'token.refreshed',
  PASSWORD_CHANGED = 'password.changed',
  MFA_ENABLED = 'mfa.enabled',
  MFA_DISABLED = 'mfa.disabled',

  // User Management
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_SUSPENDED = 'user.suspended',
  USER_REACTIVATED = 'user.reactivated',

  // Agent Management
  AGENT_CREATED = 'agent.created',
  AGENT_UPDATED = 'agent.updated',
  AGENT_DELETED = 'agent.deleted',
  AGENT_STARTED = 'agent.started',
  AGENT_STOPPED = 'agent.stopped',
  AGENT_CONFIG_CHANGED = 'agent.config_changed',

  // Issue Management
  ISSUE_CREATED = 'issue.created',
  ISSUE_UPDATED = 'issue.updated',
  ISSUE_DELETED = 'issue.deleted',
  ISSUE_ASSIGNED = 'issue.assigned',
  ISSUE_STATUS_CHANGED = 'issue.status_changed',

  // Project Management
  PROJECT_CREATED = 'project.created',
  PROJECT_UPDATED = 'project.updated',
  PROJECT_DELETED = 'project.deleted',
  PROJECT_MEMBER_ADDED = 'project.member_added',
  PROJECT_MEMBER_REMOVED = 'project.member_removed',

  // Skill Management
  SKILL_CREATED = 'skill.created',
  SKILL_UPDATED = 'skill.updated',
  SKILL_DELETED = 'skill.deleted',
  SKILL_PUBLISHED = 'skill.published',
  SKILL_INSTALLED = 'skill.installed',

  // Squad Management
  SQUAD_CREATED = 'squad.created',
  SQUAD_UPDATED = 'squad.updated',
  SQUAD_DELETED = 'squad.deleted',
  SQUAD_MEMBER_ADDED = 'squad.member_added',
  SQUAD_MEMBER_REMOVED = 'squad.member_removed',

  // Permissions
  PERMISSION_GRANTED = 'permission.granted',
  PERMISSION_REVOKED = 'permission.revoked',
  ROLE_CHANGED = 'role.changed',

  // API & Integration
  API_KEY_CREATED = 'api_key.created',
  API_KEY_REVOKED = 'api_key.revoked',
  WEBHOOK_CREATED = 'webhook.created',
  WEBHOOK_DELETED = 'webhook.deleted',
  WEBHOOK_TRIGGERED = 'webhook.triggered',

  // Data Access
  DATA_EXPORTED = 'data.exported',
  DATA_IMPORTED = 'data.imported',
  DATA_ACCESSED = 'data.accessed',

  // Security
  SECURITY_ALERT = 'security.alert',
  RATE_LIMIT_EXCEEDED = 'rate_limit.exceeded',
  AUTHENTICATION_FAILED = 'auth.failed',
  CSRF_DETECTED = 'csrf.detected',
  XSS_DETECTED = 'xss.detected',

  // System
  CONFIG_CHANGED = 'config.changed',
  SYSTEM_ERROR = 'system.error',
  SYSTEM_WARNING = 'system.warning',
  MAINTENANCE_STARTED = 'maintenance.started',
  MAINTENANCE_ENDED = 'maintenance.ended',
}

export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export const AuditSeverityWeights = {
  [AuditSeverity.LOW]: 1,
  [AuditSeverity.MEDIUM]: 2,
  [AuditSeverity.HIGH]: 3,
  [AuditSeverity.CRITICAL]: 4,
};

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  action: AuditAction;
  severity: AuditSeverity;
  actor?: {
    id: string;
    type: 'user' | 'agent' | 'system';
    email?: string;
    name?: string;
  };
  target?: {
    id: string;
    type: string;
    name?: string;
  };
  context: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  sessionId?: string;
  status: 'success' | 'failure' | 'warning';
  message: string;
  metadata?: Record<string, any>;
}

export const AuditLogEntrySchema = z.object({
  id: z.string().min(1),
  timestamp: z.number().int().positive(),
  action: z.nativeEnum(AuditAction),
  severity: z.nativeEnum(AuditSeverity),
  actor: z.object({
    id: z.string().min(1),
    type: z.enum(['user', 'agent', 'system']),
    email: z.string().email().optional(),
    name: z.string().optional(),
  }).optional(),
  target: z.object({
    id: z.string().min(1),
    type: z.string().min(1),
    name: z.string().optional(),
  }).optional(),
  context: z.record(z.any()),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  requestId: z.string().optional(),
  sessionId: z.string().optional(),
  status: z.enum(['success', 'failure', 'warning']),
  message: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

// ==================== Action to Severity Mapping ====================

export const ACTION_SEVERITY_MAP: Partial<Record<AuditAction, AuditSeverity>> = {
  [AuditAction.LOGIN_SUCCESS]: AuditSeverity.LOW,
  [AuditAction.LOGIN_FAILURE]: AuditSeverity.HIGH,
  [AuditAction.LOGOUT]: AuditSeverity.LOW,
  [AuditAction.SESSION_EXPIRED]: AuditSeverity.LOW,
  [AuditAction.TOKEN_REFRESHED]: AuditSeverity.LOW,
  [AuditAction.PASSWORD_CHANGED]: AuditSeverity.HIGH,
  [AuditAction.MFA_ENABLED]: AuditSeverity.MEDIUM,
  [AuditAction.MFA_DISABLED]: AuditSeverity.HIGH,
  [AuditAction.USER_CREATED]: AuditSeverity.MEDIUM,
  [AuditAction.USER_UPDATED]: AuditSeverity.LOW,
  [AuditAction.USER_DELETED]: AuditSeverity.HIGH,
  [AuditAction.USER_SUSPENDED]: AuditSeverity.HIGH,
  [AuditAction.USER_REACTIVATED]: AuditSeverity.MEDIUM,
  [AuditAction.AGENT_CREATED]: AuditSeverity.LOW,
  [AuditAction.AGENT_UPDATED]: AuditSeverity.LOW,
  [AuditAction.AGENT_DELETED]: AuditSeverity.MEDIUM,
  [AuditAction.AGENT_STARTED]: AuditSeverity.LOW,
  [AuditAction.AGENT_STOPPED]: AuditSeverity.LOW,
  [AuditAction.PERMISSION_GRANTED]: AuditSeverity.HIGH,
  [AuditAction.PERMISSION_REVOKED]: AuditSeverity.HIGH,
  [AuditAction.ROLE_CHANGED]: AuditSeverity.HIGH,
  [AuditAction.API_KEY_CREATED]: AuditSeverity.HIGH,
  [AuditAction.API_KEY_REVOKED]: AuditSeverity.HIGH,
  [AuditAction.DATA_EXPORTED]: AuditSeverity.MEDIUM,
  [AuditAction.SECURITY_ALERT]: AuditSeverity.CRITICAL,
  [AuditAction.RATE_LIMIT_EXCEEDED]: AuditSeverity.MEDIUM,
  [AuditAction.AUTHENTICATION_FAILED]: AuditSeverity.HIGH,
  [AuditAction.CSRF_DETECTED]: AuditSeverity.CRITICAL,
  [AuditAction.XSS_DETECTED]: AuditSeverity.CRITICAL,
  [AuditAction.SYSTEM_ERROR]: AuditSeverity.HIGH,
  [AuditAction.CONFIG_CHANGED]: AuditSeverity.MEDIUM,
};

export function getSeverityForAction(action: AuditAction): AuditSeverity {
  return ACTION_SEVERITY_MAP[action] || AuditSeverity.LOW;
}

// ==================== Audit Log Storage Interface ====================

export interface AuditLogStorage {
  write(entry: AuditLogEntry): Promise<void>;
  writeBatch(entries: AuditLogEntry[]): Promise<void>;
  query(options: AuditLogQueryOptions): Promise<AuditLogEntry[]>;
  count(options: AuditLogQueryOptions): Promise<number>;
  getById(id: string): Promise<AuditLogEntry | null>;
  cleanup(olderThanDays: number): Promise<number>;
}

export interface AuditLogQueryOptions {
  startTimestamp?: number;
  endTimestamp?: number;
  actions?: AuditAction[];
  severities?: AuditSeverity[];
  actorId?: string;
  actorType?: 'user' | 'agent' | 'system';
  targetId?: string;
  targetType?: string;
  status?: ('success' | 'failure' | 'warning')[];
  ipAddress?: string;
  sessionId?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'severity';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// ==================== In-Memory Storage Implementation ====================

export class InMemoryAuditLogStorage implements AuditLogStorage {
  private logs: Map<string, AuditLogEntry> = new Map();

  async write(entry: AuditLogEntry): Promise<void> {
    this.logs.set(entry.id, entry);
  }

  async writeBatch(entries: AuditLogEntry[]): Promise<void> {
    for (const entry of entries) {
      this.logs.set(entry.id, entry);
    }
  }

  async query(options: AuditLogQueryOptions): Promise<AuditLogEntry[]> {
    let results = Array.from(this.logs.values());

    if (options.startTimestamp) {
      results = results.filter(e => e.timestamp >= options.startTimestamp!);
    }

    if (options.endTimestamp) {
      results = results.filter(e => e.timestamp <= options.endTimestamp!);
    }

    if (options.actions && options.actions.length > 0) {
      results = results.filter(e => options.actions!.includes(e.action));
    }

    if (options.severities && options.severities.length > 0) {
      results = results.filter(e => options.severities!.includes(e.severity));
    }

    if (options.actorId) {
      results = results.filter(e => e.actor?.id === options.actorId);
    }

    if (options.actorType) {
      results = results.filter(e => e.actor?.type === options.actorType);
    }

    if (options.targetId) {
      results = results.filter(e => e.target?.id === options.targetId);
    }

    if (options.targetType) {
      results = results.filter(e => e.target?.type === options.targetType);
    }

    if (options.status && options.status.length > 0) {
      results = results.filter(e => options.status!.includes(e.status));
    }

    if (options.ipAddress) {
      results = results.filter(e => e.ipAddress === options.ipAddress);
    }

    if (options.sessionId) {
      results = results.filter(e => e.sessionId === options.sessionId);
    }

    if (options.search) {
      const searchLower = options.search.toLowerCase();
      results = results.filter(e =>
        e.message.toLowerCase().includes(searchLower) ||
        JSON.stringify(e.context).toLowerCase().includes(searchLower)
      );
    }

    const sortBy = options.sortBy || 'timestamp';
    const sortOrder = options.sortOrder || 'desc';

    results.sort((a, b) => {
      if (sortBy === 'severity') {
        const aWeight = AuditSeverityWeights[a.severity];
        const bWeight = AuditSeverityWeights[b.severity];
        return sortOrder === 'desc' ? bWeight - aWeight : aWeight - bWeight;
      }
      return sortOrder === 'desc' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
    });

    const offset = options.offset || 0;
    const limit = options.limit || 100;

    return results.slice(offset, offset + limit);
  }

  async count(options: AuditLogQueryOptions): Promise<number> {
    const results = await this.query({ ...options, limit: undefined, offset: undefined });
    return results.length;
  }

  async getById(id: string): Promise<AuditLogEntry | null> {
    return this.logs.get(id) || null;
  }

  async cleanup(olderThanDays: number): Promise<number> {
    const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    let count = 0;

    for (const [id, entry] of this.logs) {
      if (entry.timestamp < cutoff) {
        this.logs.delete(id);
        count++;
      }
    }

    return count;
  }
}

// ==================== Audit Logger Class ====================

export class AuditLogger {
  private storage: AuditLogStorage;
  private buffer: AuditLogEntry[] = [];
  private bufferSize: number;
  private flushInterval: number;
  private flushTimer?: NodeJS.Timeout;

  constructor(
    storage: AuditLogStorage = new InMemoryAuditLogStorage(),
    options: { bufferSize?: number; flushInterval?: number } = {}
  ) {
    this.storage = storage;
    this.bufferSize = options.bufferSize || 100;
    this.flushInterval = options.flushInterval || 5000;
    this.startFlushTimer();
  }

  private startFlushTimer(): void {
    if (this.flushInterval > 0) {
      this.flushTimer = setInterval(() => this.flush(), this.flushInterval);
      if (this.flushTimer.unref) {
        this.flushTimer.unref();
      }
    }
  }

  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  log(
    action: AuditAction,
    options: {
      actor?: AuditLogEntry['actor'];
      target?: AuditLogEntry['target'];
      context?: Record<string, any>;
      ipAddress?: string;
      userAgent?: string;
      requestId?: string;
      sessionId?: string;
      status?: AuditLogEntry['status'];
      message?: string;
      metadata?: Record<string, any>;
      severity?: AuditSeverity;
    } = {}
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      action,
      severity: options.severity || getSeverityForAction(action),
      actor: options.actor,
      target: options.target,
      context: options.context || {},
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      requestId: options.requestId,
      sessionId: options.sessionId,
      status: options.status || 'success',
      message: options.message || `Action performed: ${action}`,
      metadata: options.metadata,
    };

    this.buffer.push(entry);

    if (this.buffer.length >= this.bufferSize) {
      this.flush();
    }

    return entry;
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) {
      return;
    }

    const entries = [...this.buffer];
    this.buffer = [];

    try {
      await this.storage.writeBatch(entries);
    } catch (error) {
      console.error('Failed to flush audit logs:', error);
      this.buffer.unshift(...entries);
    }
  }

  async shutdown(): Promise<void> {
    this.stopFlushTimer();
    await this.flush();
  }

  async query(options: AuditLogQueryOptions): Promise<AuditLogEntry[]> {
    return this.storage.query(options);
  }

  async count(options: AuditLogQueryOptions): Promise<number> {
    return this.storage.count(options);
  }

  async getById(id: string): Promise<AuditLogEntry | null> {
    return this.storage.getById(id);
  }

  async cleanup(olderThanDays: number): Promise<number> {
    return this.storage.cleanup(olderThanDays);
  }
}

// ==================== Helper Functions ====================

export function createAuditLogger(
  storage?: AuditLogStorage,
  options?: { bufferSize?: number; flushInterval?: number }
): AuditLogger {
  return new AuditLogger(storage, options);
}

let defaultLogger: AuditLogger | undefined;

export function getDefaultAuditLogger(): AuditLogger {
  if (!defaultLogger) {
    defaultLogger = new AuditLogger();
  }
  return defaultLogger;
}

export function setDefaultAuditLogger(logger: AuditLogger): void {
  defaultLogger = logger;
}

// ==================== Export ====================

export default {
  AuditAction,
  AuditSeverity,
  AuditSeverityWeights,
  AuditLogEntry,
  AuditLogEntrySchema,
  AuditLogStorage,
  AuditLogQueryOptions,
  InMemoryAuditLogStorage,
  AuditLogger,
  createAuditLogger,
  getDefaultAuditLogger,
  setDefaultAuditLogger,
  getSeverityForAction,
};
