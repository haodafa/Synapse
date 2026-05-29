import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validatePassword,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  generateSessionId,
  generateCsrfToken,
  sanitizeInput,
  sanitizeObject,
  stripXSS,
  RateLimiter,
  LoginAttemptTracker,
  generateSecureHeaders,
  DEFAULT_SECURITY_CONFIG,
  DEFAULT_CSP_CONFIG,
  generateSecureRandom,
  generateApiKey,
} from './security.js';

describe('Security Utilities', () => {
  describe('Password Validation', () => {
    it('should reject short passwords', () => {
      const result = validatePassword('Pass1!');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('at least'))).toBe(true);
    });

    it('should reject passwords without lowercase', () => {
      const result = validatePassword('PASSWORD123!');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('lowercase'))).toBe(true);
    });

    it('should reject passwords without uppercase', () => {
      const result = validatePassword('password123!');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('uppercase'))).toBe(true);
    });

    it('should reject passwords without numbers', () => {
      const result = validatePassword('Password!!');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('number'))).toBe(true);
    });

    it('should reject passwords without special chars', () => {
      const result = validatePassword('Password123');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('special'))).toBe(true);
    });

    it('should accept valid passwords', () => {
      const result = validatePassword('SecurePass123!');
      expect(result.valid).toBe(true);
    });
  });

  describe('Password Hashing', () => {
    it('should hash and verify passwords correctly', async () => {
      const password = 'SecurePass123!';
      const { hash, salt } = hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(salt).toBeDefined();
      expect(hash).not.toBe(password);
      
      const isValid = verifyPassword(password, hash, salt);
      expect(isValid).toBe(true);
      
      const isInvalid = verifyPassword('WrongPass123!', hash, salt);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Token Generation', () => {
    it('should generate and verify tokens correctly', async () => {
      const secret = 'test-secret-key';
      const payload = {
        userId: 'user-123',
        sessionId: 'session-456',
        type: 'access' as const,
        claims: { role: 'admin' }
      };
      
      const token = generateToken(payload, secret, 3600000);
      expect(token).toBeDefined();
      
      const verified = verifyToken(token, secret);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe('user-123');
      expect(verified?.sessionId).toBe('session-456');
      expect(verified?.type).toBe('access');
      expect(verified?.claims).toEqual({ role: 'admin' });
    });

    it('should reject invalid tokens', async () => {
      const secret = 'test-secret-key';
      const verified = verifyToken('invalid-token', secret);
      expect(verified).toBeNull();
    });

    it('should reject tokens with wrong secret', async () => {
      const secret = 'test-secret-key';
      const payload = {
        userId: 'user-123',
        sessionId: 'session-456',
        type: 'access' as const
      };
      
      const token = generateToken(payload, secret, 3600000);
      const verified = verifyToken(token, 'wrong-secret');
      expect(verified).toBeNull();
    });
  });

  describe('Sanitization', () => {
    it('should sanitize HTML tags from input', () => {
      const input = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('<script>');
    });

    it('should sanitize special characters', () => {
      const input = '< > & " \' ';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
      expect(sanitized).not.toContain('&');
    });

    it('should sanitize nested objects', () => {
      const obj = {
        field: '<script>bad</script>',
        nested: {
          another: '<div>evil</div>'
        }
      };
      
      const sanitized = sanitizeObject(obj);
      expect(sanitized.field).not.toContain('<script>');
      expect(sanitized.nested.another).not.toContain('<div>');
    });
  });

  describe('XSS Protection', () => {
    it('should strip script tags', () => {
      const input = 'Hello <script>alert(1)</script> World';
      const stripped = stripXSS(input);
      expect(stripped).not.toContain('<script>');
    });

    it('should strip javascript: URLs', () => {
      const input = '<a href="javascript:alert(1)">Click</a>';
      const stripped = stripXSS(input);
      expect(stripped).not.toContain('javascript:');
    });
  });

  describe('Rate Limiter', () => {
    it('should allow requests under limit', () => {
      const limiter = new RateLimiter(5, 60000);
      
      for (let i = 0; i < 5; i++) {
        const result = limiter.check('test-ip');
        expect(result.allowed).toBe(true);
      }
    });

    it('should block requests over limit', () => {
      const limiter = new RateLimiter(3, 60000);
      
      for (let i = 0; i < 3; i++) {
        limiter.check('test-ip');
      }
      
      const result = limiter.check('test-ip');
      expect(result.allowed).toBe(false);
    });

    it('should reset counter for different keys', () => {
      const limiter = new RateLimiter(3, 60000);
      
      for (let i = 0; i < 3; i++) {
        limiter.check('ip-1');
      }
      
      const result = limiter.check('ip-2');
      expect(result.allowed).toBe(true);
    });
  });

  describe('Login Attempt Tracker', () => {
    it('should allow login attempts under limit', () => {
      const tracker = new LoginAttemptTracker(5, 900000);
      
      for (let i = 0; i < 4; i++) {
        const result = tracker.recordAttempt('user@example.com', false);
        expect(result.allowed).toBe(true);
      }
    });

    it('should lock account after too many failed attempts', () => {
      const tracker = new LoginAttemptTracker(3, 900000);
      
      for (let i = 0; i < 3; i++) {
        tracker.recordAttempt('user@example.com', false);
      }
      
      const result = tracker.recordAttempt('user@example.com', false);
      expect(result.allowed).toBe(false);
    });

    it('should reset failed attempts on successful login', () => {
      const tracker = new LoginAttemptTracker(3, 900000);
      
      tracker.recordAttempt('user@example.com', false);
      tracker.recordAttempt('user@example.com', false);
      
      const successResult = tracker.recordAttempt('user@example.com', true);
      expect(successResult.allowed).toBe(true);
      expect(successResult.attempts).toBe(0);
    });
  });

  describe('Secure Headers', () => {
    it('should generate secure headers with defaults', () => {
      const headers = generateSecureHeaders();
      
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['X-XSS-Protection']).toBe('1; mode=block');
      expect(headers['Content-Security-Policy']).toBeDefined();
    });

    it('should generate CSP header with custom config', () => {
      const customCSP = {
        ...DEFAULT_CSP_CONFIG,
        scriptSrc: ['\'self\'', 'https://trusted-cdn.com'],
        styleSrc: ['\'self\'', 'https://trusted-cdn.com'],
      };
      
      const headers = generateSecureHeaders(customCSP);
      const cspHeader = headers['Content-Security-Policy'];
      
      expect(cspHeader).toContain('script-src');
      expect(cspHeader).toContain('trusted-cdn.com');
    });
  });

  describe('Random Generation', () => {
    it('should generate unique session IDs', () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();
      
      expect(id1).not.toBe(id2);
      expect(id1.length).toBeGreaterThan(0);
    });

    it('should generate unique CSRF tokens', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      
      expect(token1).not.toBe(token2);
    });

    it('should generate API keys with prefix', () => {
      const apiKey = generateApiKey();
      expect(apiKey).startsWith('sk_');
    });

    it('should generate secure random strings', () => {
      const random1 = generateSecureRandom(32);
      const random2 = generateSecureRandom(32);
      
      expect(random1).not.toBe(random2);
      expect(random1.length).toBe(64); // hex encoding of 32 bytes
    });
  });

  describe('Default Config', () => {
    it('should have reasonable security defaults', () => {
      expect(DEFAULT_SECURITY_CONFIG.passwordMinLength).toBeGreaterThanOrEqual(8);
      expect(DEFAULT_SECURITY_CONFIG.tokenExpiryMs).toBeGreaterThan(0);
      expect(DEFAULT_SECURITY_CONFIG.maxLoginAttempts).toBeGreaterThan(0);
    });
  });
});
