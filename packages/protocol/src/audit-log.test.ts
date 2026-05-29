import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AuditAction,
  AuditSeverity,
  AuditLogEntry,
  AuditLogger,
  InMemoryAuditLogStorage,
  getSeverityForAction,
  createAuditLogger,
  getDefaultAuditLogger,
  setDefaultAuditLogger,
  AuditLogQueryOptions,
} from './audit-log.js';

describe('Audit Log System', () => {
  describe('Action to Severity Mapping', () => {
    it('should map login failure to high severity', () => {
      expect(getSeverityForAction(AuditAction.LOGIN_FAILURE)).toBe(AuditSeverity.HIGH);
    });

    it('should map security alerts to critical severity', () => {
      expect(getSeverityForAction(AuditAction.SECURITY_ALERT)).toBe(AuditSeverity.CRITICAL);
    });

    it('should map normal actions to low severity', () => {
      expect(getSeverityForAction(AuditAction.LOGIN_SUCCESS)).toBe(AuditSeverity.LOW);
    });

    it('should default to low severity for unknown actions', () => {
      expect(getSeverityForAction('unknown-action' as AuditAction)).toBe(AuditSeverity.LOW);
    });
  });

  describe('InMemoryAuditLogStorage', () => {
    let storage: InMemoryAuditLogStorage;
    
    beforeEach(() => {
      storage = new InMemoryAuditLogStorage();
    });

    it('should write and retrieve logs', async () => {
      const entry: AuditLogEntry = {
        id: 'test-log-1',
        timestamp: Date.now(),
        action: AuditAction.LOGIN_SUCCESS,
        severity: AuditSeverity.LOW,
        actor: {
          id: 'user-123',
          type: 'user',
          email: 'user@example.com'
        },
        context: {},
        status: 'success',
        message: 'User logged in successfully'
      };

      await storage.write(entry);
      const retrieved = await storage.getById('test-log-1');
      
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe('test-log-1');
      expect(retrieved?.action).toBe(AuditAction.LOGIN_SUCCESS);
    });

    it('should write and retrieve multiple logs', async () => {
      const entries: AuditLogEntry[] = [
        {
          id: 'log-1',
          timestamp: 1000,
          action: AuditAction.LOGIN_SUCCESS,
          severity: AuditSeverity.LOW,
          context: {},
          status: 'success',
          message: 'Test 1'
        },
        {
          id: 'log-2',
          timestamp: 2000,
          action: AuditAction.AGENT_CREATED,
          severity: AuditSeverity.LOW,
          context: {},
          status: 'success',
          message: 'Test 2'
        }
      ];

      await storage.writeBatch(entries);
      
      const results = await storage.query({});
      expect(results.length).toBe(2);
    });

    it('should filter logs by action', async () => {
      await storage.write({
        id: 'log-1',
        timestamp: 1000,
        action: AuditAction.LOGIN_SUCCESS,
        severity: AuditSeverity.LOW,
        context: {},
        status: 'success',
        message: 'Login'
      });

      await storage.write({
        id: 'log-2',
        timestamp: 2000,
        action: AuditAction.AGENT_CREATED,
        severity: AuditSeverity.LOW,
        context: {},
        status: 'success',
        message: 'Agent'
      });

      const results = await storage.query({
        actions: [AuditAction.LOGIN_SUCCESS]
      });

      expect(results.length).toBe(1);
      expect(results[0].action).toBe(AuditAction.LOGIN_SUCCESS);
    });

    it('should filter logs by severity', async () => {
      await storage.write({
        id: 'log-1',
        timestamp: 1000,
        action: AuditAction.LOGIN_SUCCESS,
        severity: AuditSeverity.LOW,
        context: {},
        status: 'success',
        message: 'Low'
      });

      await storage.write({
        id: 'log-2',
        timestamp: 2000,
        action: AuditAction.LOGIN_FAILURE,
        severity: AuditSeverity.HIGH,
        context: {},
        status: 'failure',
        message: 'High'
      });

      const results = await storage.query({
        severities: [AuditSeverity.HIGH]
      });

      expect(results.length).toBe(1);
      expect(results[0].severity).toBe(AuditSeverity.HIGH);
    });

    it('should filter logs by actor', async () => {
      await storage.write({
        id: 'log-1',
        timestamp: 1000,
        action: AuditAction.LOGIN_SUCCESS,
        severity: AuditSeverity.LOW,
        actor: { id: 'user-1', type: 'user' },
        context: {},
        status: 'success',
        message: 'User 1'
      });

      await storage.write({
        id: 'log-2',
        timestamp: 2000,
        action: AuditAction.LOGIN_SUCCESS,
        severity: AuditSeverity.LOW,
        actor: { id: 'user-2', type: 'user' },
        context: {},
        status: 'success',
        message: 'User 2'
      });

      const results = await storage.query({
        actorId: 'user-1'
      });

      expect(results.length).toBe(1);
      expect(results[0].actor?.id).toBe('user-1');
    });

    it('should sort logs by timestamp descending by default', async () => {
      await storage.write({
        id: 'log-1',
        timestamp: 1000,
        action: AuditAction.LOGIN_SUCCESS,
        severity: AuditSeverity.LOW,
        context: {},
        status: 'success',
        message: 'Earlier'
      });

      await storage.write({
        id: 'log-2',
        timestamp: 2000,
        action: AuditAction.LOGIN_SUCCESS,
        severity: AuditSeverity.LOW,
        context: {},
        status: 'success',
        message: 'Later'
      });

      const results = await storage.query({});
      expect(results[0].timestamp).toBe(2000);
      expect(results[1].timestamp).toBe(1000);
    });

    it('should sort logs by severity', async () => {
      await storage.write({
        id: 'log-1',
        timestamp: 1000,
        action: AuditAction.LOGIN_SUCCESS,
        severity: AuditSeverity.LOW,
        context: {},
        status: 'success',
        message: 'Low'
      });

      await storage.write({
        id: 'log-2',
        timestamp: 2000,
        action: AuditAction.LOGIN_FAILURE,
        severity: AuditSeverity.HIGH,
        context: {},
        status: 'failure',
        message: 'High'
      });

      const results = await storage.query({
        sortBy: 'severity',
        sortOrder: 'desc'
      });

      expect(results[0].severity).toBe(AuditSeverity.HIGH);
      expect(results[1].severity).toBe(AuditSeverity.LOW);
    });

    it('should limit and offset results', async () => {
      for (let i = 0; i < 10; i++) {
        await storage.write({
          id: `log-${i}`,
          timestamp: 1000 + i * 100,
          action: AuditAction.LOGIN_SUCCESS,
          severity: AuditSeverity.LOW,
          context: {},
          status: 'success',
          message: `Test ${i}`
        });
      }

      const firstPage = await storage.query({ limit: 3, offset: 0 });
      expect(firstPage.length).toBe(3);

      const secondPage = await storage.query({ limit: 3, offset: 3 });
      expect(secondPage.length).toBe(3);
    });

    it('should count logs', async () => {
      await storage.write({
        id: 'log-1',
        timestamp: 1000,
        action: AuditAction.LOGIN_SUCCESS,
        severity: AuditSeverity.LOW,
        context: {},
        status: 'success',
        message: 'Test 1'
      });

      await storage.write({
        id: 'log-2',
        timestamp: 2000,
        action: AuditAction.LOGIN_FAILURE,
        severity: AuditSeverity.HIGH,
        context: {},
        status: 'failure',
        message: 'Test 2'
      });

      const count = await storage.count({});
      expect(count).toBe(2);

      const highCount = await storage.count({ severities: [AuditSeverity.HIGH] });
      expect(highCount).toBe(1);
    });

    it('should clean up old logs', async () => {
      const oldTime = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const newTime = Date.now();

      await storage.write({
        id: 'old-log',
        timestamp: oldTime,
        action: AuditAction.LOGIN_SUCCESS,
        severity: AuditSeverity.LOW,
        context: {},
        status: 'success',
        message: 'Old'
      });

      await storage.write({
        id: 'new-log',
        timestamp: newTime,
        action: AuditAction.LOGIN_SUCCESS,
        severity: AuditSeverity.LOW,
        context: {},
        status: 'success',
        message: 'New'
      });

      const deleted = await storage.cleanup(7);
      expect(deleted).toBe(1);

      const remaining = await storage.getById('new-log');
      expect(remaining).not.toBeNull();
    });
  });

  describe('AuditLogger', () => {
    let logger: AuditLogger;
    let storage: InMemoryAuditLogStorage;

    beforeEach(() => {
      storage = new InMemoryAuditLogStorage();
      logger = new AuditLogger(storage, { bufferSize: 10, flushInterval: 0 });
    });

    afterEach(async () => {
      await logger.shutdown();
    });

    it('should log actions with correct severity', async () => {
      const entry = logger.log(AuditAction.LOGIN_FAILURE, {
        actor: { id: 'user-123', type: 'user' },
        message: 'Failed login attempt'
      });

      await logger.flush();

      expect(entry.action).toBe(AuditAction.LOGIN_FAILURE);
      expect(entry.severity).toBe(AuditSeverity.HIGH);
      expect(entry.status).toBe('success');
    });

    it('should override default severity', async () => {
      const entry = logger.log(AuditAction.LOGIN_SUCCESS, {
        severity: AuditSeverity.MEDIUM,
        message: 'Important login'
      });

      await logger.flush();

      expect(entry.severity).toBe(AuditSeverity.MEDIUM);
    });

    it('should include actor information', async () => {
      const entry = logger.log(AuditAction.AGENT_CREATED, {
        actor: {
          id: 'user-456',
          type: 'user',
          email: 'test@example.com',
          name: 'Test User'
        },
        target: {
          id: 'agent-123',
          type: 'agent',
          name: 'My Agent'
        },
        message: 'Created new agent'
      });

      await logger.flush();

      expect(entry.actor).not.toBeNull();
      expect(entry.actor?.id).toBe('user-456');
      expect(entry.target?.id).toBe('agent-123');
    });

    it('should include context data', async () => {
      const entry = logger.log(AuditAction.LOGIN_SUCCESS, {
        context: {
          ip: '192.168.1.1',
          userAgent: 'Chrome/120',
          location: 'US'
        },
        message: 'User logged in'
      });

      await logger.flush();

      expect(entry.context).not.toBeNull();
      expect(entry.context.ip).toBe('192.168.1.1');
    });

    it('should buffer logs and flush on demand', async () => {
      for (let i = 0; i < 5; i++) {
        logger.log(AuditAction.LOGIN_SUCCESS, {
          message: `Test ${i}`
        });
      }

      let count = await storage.count({});
      expect(count).toBe(0); // Not yet flushed

      await logger.flush();

      count = await storage.count({});
      expect(count).toBe(5);
    });

    it('should auto-flush when buffer size is reached', async () => {
      const smallBufferLogger = new AuditLogger(storage, { bufferSize: 3, flushInterval: 0 });
      
      for (let i = 0; i < 3; i++) {
        smallBufferLogger.log(AuditAction.LOGIN_SUCCESS, { message: `Test ${i}` });
      }

      // Give it a tiny bit of time to flush
      await new Promise(resolve => setTimeout(resolve, 10));
      
      let count = await storage.count({});
      expect(count).toBe(3);

      await smallBufferLogger.shutdown();
    });

    it('should query logs through logger', async () => {
      logger.log(AuditAction.LOGIN_SUCCESS, { message: 'Login 1' });
      logger.log(AuditAction.AGENT_CREATED, { message: 'Created agent' });
      await logger.flush();

      const results = await logger.query({ actions: [AuditAction.AGENT_CREATED] });
      expect(results.length).toBe(1);
      expect(results[0].action).toBe(AuditAction.AGENT_CREATED);
    });
  });

  describe('Logger Factory', () => {
    it('should create audit loggers', () => {
      const logger = createAuditLogger();
      expect(logger).toBeInstanceOf(AuditLogger);
    });

    it('should manage default logger', () => {
      const customLogger = createAuditLogger();
      setDefaultAuditLogger(customLogger);
      
      const retrieved = getDefaultAuditLogger();
      expect(retrieved).toBe(customLogger);
    });
  });

  describe('AuditAction Enum', () => {
    it('should have all necessary action types', () => {
      // Auth actions
      expect(AuditAction.LOGIN_SUCCESS).toBeDefined();
      expect(AuditAction.LOGIN_FAILURE).toBeDefined();
      expect(AuditAction.LOGOUT).toBeDefined();
      expect(AuditAction.PASSWORD_CHANGED).toBeDefined();

      // Agent actions
      expect(AuditAction.AGENT_CREATED).toBeDefined();
      expect(AuditAction.AGENT_UPDATED).toBeDefined();
      expect(AuditAction.AGENT_DELETED).toBeDefined();

      // Security actions
      expect(AuditAction.SECURITY_ALERT).toBeDefined();
      expect(AuditAction.RATE_LIMIT_EXCEEDED).toBeDefined();
    });
  });
});
