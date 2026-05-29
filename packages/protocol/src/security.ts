/**
 * Synapse Security Utilities
 * Comprehensive security-related utilities for the Synapse platform
 */

import * as crypto from 'crypto';
import { z } from 'zod';

// ==================== Configuration ====================

export interface SecurityConfig {
  passwordMinLength: number;
  passwordMinLowercase: number;
  passwordMinUppercase: number;
  passwordMinNumbers: number;
  passwordMinSpecial: number;
  tokenExpiryMs: number;
  refreshTokenExpiryMs: number;
  sessionTimeoutMs: number;
  maxLoginAttempts: number;
  lockoutDurationMs: number;
  csrfEnabled: boolean;
  corsEnabled: boolean;
  rateLimitEnabled: boolean;
  rateLimitRequests: number;
  rateLimitWindowMs: number;
}

export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  passwordMinLength: 12,
  passwordMinLowercase: 1,
  passwordMinUppercase: 1,
  passwordMinNumbers: 1,
  passwordMinSpecial: 1,
  tokenExpiryMs: 24 * 60 * 60 * 1000, // 24 hours
  refreshTokenExpiryMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  sessionTimeoutMs: 30 * 60 * 1000, // 30 minutes
  maxLoginAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000, // 15 minutes
  csrfEnabled: true,
  corsEnabled: true,
  rateLimitEnabled: true,
  rateLimitRequests: 100,
  rateLimitWindowMs: 60 * 1000, // 1 minute
};

// ==================== Password Utilities ====================

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePassword(
  password: string,
  config: Partial<SecurityConfig> = {}
): PasswordValidationResult {
  const cfg = { ...DEFAULT_SECURITY_CONFIG, ...config };
  const errors: string[] = [];

  if (password.length < cfg.passwordMinLength) {
    errors.push(`Password must be at least ${cfg.passwordMinLength} characters long`);
  }

  if ((password.match(/[a-z]/g) || []).length < cfg.passwordMinLowercase) {
    errors.push(`Password must contain at least ${cfg.passwordMinLowercase} lowercase letter`);
  }

  if ((password.match(/[A-Z]/g) || []).length < cfg.passwordMinUppercase) {
    errors.push(`Password must contain at least ${cfg.passwordMinUppercase} uppercase letter`);
  }

  if ((password.match(/[0-9]/g) || []).length < cfg.passwordMinNumbers) {
    errors.push(`Password must contain at least ${cfg.passwordMinNumbers} number`);
  }

  if ((password.match(/[^a-zA-Z0-9]/g) || []).length < cfg.passwordMinSpecial) {
    errors.push(`Password must contain at least ${cfg.passwordMinSpecial} special character`);
  }

  // Check for common patterns
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /abc123/,
    /monkey/i,
    /dragon/i,
    /letmein/i,
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('Password contains a common pattern that is easily guessable');
      break;
    }
  }

  return { valid: errors.length === 0, errors };
}

export interface HashResult {
  hash: string;
  salt: string;
}

export function hashPassword(password: string): HashResult {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computedHash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');
  return crypto.timingSafeEqual(
    Buffer.from(computedHash),
    Buffer.from(hash)
  );
}

// ==================== Token Utilities ====================

export interface TokenPayload {
  userId: string;
  sessionId: string;
  issuedAt: number;
  expiresAt: number;
  type: 'access' | 'refresh';
  claims?: Record<string, any>;
}

export const TokenPayloadSchema = z.object({
  userId: z.string().min(1),
  sessionId: z.string().min(1),
  issuedAt: z.number().int().positive(),
  expiresAt: z.number().int().positive(),
  type: z.enum(['access', 'refresh']),
  claims: z.record(z.any()).optional(),
});

export function generateToken(
  payload: Omit<TokenPayload, 'issuedAt' | 'expiresAt'>,
  secret: string,
  expiresInMs: number
): string {
  const now = Date.now();
  const tokenPayload: TokenPayload = {
    ...payload,
    issuedAt: now,
    expiresAt: now + expiresInMs,
  };

  const encodedPayload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('hex');

  return `${encodedPayload}.${signature}`;
}

export function verifyToken(token: string, secret: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [encodedPayload, signature] = parts;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(encodedPayload)
      .digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload: TokenPayload = JSON.parse(
      Buffer.from(encodedPayload, 'base64').toString()
    );

    const validated = TokenPayloadSchema.safeParse(payload);
    if (!validated.success) {
      return null;
    }

    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return validated.data;
  } catch {
    return null;
  }
}

export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// ==================== Sanitization ====================

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>&"']/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return entities[char] || char;
    })
    .trim();
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj } as Record<string, any>;
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]);
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  }
  return sanitized as T;
}

// ==================== XSS Protection ====================

export function stripXSS(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

// ==================== Rate Limiting ====================

export interface RateLimitEntry {
  count: number;
  windowStart: number;
}

export class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private requests: number;
  private windowMs: number;

  constructor(requests: number = 100, windowMs: number = 60 * 1000) {
    this.requests = requests;
    this.windowMs = windowMs;
  }

  check(key: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    let entry = this.store.get(key);

    if (!entry || now - entry.windowStart > this.windowMs) {
      entry = { count: 0, windowStart: now };
    }

    entry.count++;
    this.store.set(key, entry);

    const remaining = Math.max(0, this.requests - entry.count);
    const resetAt = entry.windowStart + this.windowMs;

    return {
      allowed: entry.count <= this.requests,
      remaining,
      resetAt,
    };
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now - entry.windowStart > this.windowMs) {
        this.store.delete(key);
      }
    }
  }
}

// ==================== Login Attempt Tracking ====================

export interface LoginAttemptEntry {
  attempts: number;
  lockedUntil: number | null;
}

export class LoginAttemptTracker {
  private store: Map<string, LoginAttemptEntry> = new Map();
  private maxAttempts: number;
  private lockoutDurationMs: number;

  constructor(maxAttempts: number = 5, lockoutDurationMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.lockoutDurationMs = lockoutDurationMs;
  }

  recordAttempt(identifier: string, success: boolean): {
    allowed: boolean;
    attempts: number;
    lockedUntil: number | null;
  } {
    const now = Date.now();
    let entry = this.store.get(identifier) || { attempts: 0, lockedUntil: null };

    if (entry.lockedUntil && now < entry.lockedUntil) {
      return {
        allowed: false,
        attempts: entry.attempts,
        lockedUntil: entry.lockedUntil,
      };
    }

    if (success) {
      this.store.delete(identifier);
      return { allowed: true, attempts: 0, lockedUntil: null };
    }

    entry.attempts++;
    
    if (entry.attempts >= this.maxAttempts) {
      entry.lockedUntil = now + this.lockoutDurationMs;
    }

    this.store.set(identifier, entry);

    return {
      allowed: entry.lockedUntil ? false : true,
      attempts: entry.attempts,
      lockedUntil: entry.lockedUntil,
    };
  }

  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  isLocked(identifier: string): boolean {
    const entry = this.store.get(identifier);
    if (!entry || !entry.lockedUntil) {
      return false;
    }
    return Date.now() < entry.lockedUntil;
  }
}

// ==================== CSP Header Generator ====================

export interface CSPConfig {
  defaultSrc?: string[];
  scriptSrc?: string[];
  styleSrc?: string[];
  imgSrc?: string[];
  fontSrc?: string[];
  connectSrc?: string[];
  frameSrc?: string[];
  objectSrc?: string[];
  mediaSrc?: string[];
  reportUri?: string;
  reportOnly?: boolean;
}

export function generateCSPHeader(config: CSPConfig): string {
  const directives: string[] = [];

  if (config.defaultSrc) {
    directives.push(`default-src ${config.defaultSrc.join(' ')}`);
  }

  if (config.scriptSrc) {
    directives.push(`script-src ${config.scriptSrc.join(' ')}`);
  }

  if (config.styleSrc) {
    directives.push(`style-src ${config.styleSrc.join(' ')}`);
  }

  if (config.imgSrc) {
    directives.push(`img-src ${config.imgSrc.join(' ')}`);
  }

  if (config.fontSrc) {
    directives.push(`font-src ${config.fontSrc.join(' ')}`);
  }

  if (config.connectSrc) {
    directives.push(`connect-src ${config.connectSrc.join(' ')}`);
  }

  if (config.frameSrc) {
    directives.push(`frame-src ${config.frameSrc.join(' ')}`);
  }

  if (config.objectSrc) {
    directives.push(`object-src ${config.objectSrc.join(' ')}`);
  }

  if (config.mediaSrc) {
    directives.push(`media-src ${config.mediaSrc.join(' ')}`);
  }

  if (config.reportUri) {
    directives.push(`report-uri ${config.reportUri}`);
  }

  return directives.join('; ');
}

export const DEFAULT_CSP_CONFIG: CSPConfig = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:', 'https:'],
  fontSrc: ["'self'", 'data:'],
  connectSrc: ["'self'", 'wss:', 'ws:'],
  frameSrc: ["'none'"],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'"],
};

// ==================== Secure Header Generator ====================

export interface SecureHeaders {
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Strict-Transport-Security'?: string;
  'Content-Security-Policy'?: string;
  'X-Content-Security-Policy'?: string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
}

export function generateSecureHeaders(
  cspConfig: CSPConfig = DEFAULT_CSP_CONFIG,
  enableHSTS: boolean = true
): SecureHeaders {
  const headers: SecureHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };

  if (enableHSTS) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
  }

  const cspHeader = generateCSPHeader(cspConfig);
  if (cspHeader) {
    headers['Content-Security-Policy'] = cspHeader;
  }

  return headers;
}

// ==================== Random Generation ====================

export function generateSecureRandom(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export function generateApiKey(): string {
  return `sk_${crypto.randomBytes(32).toString('hex')}`;
}

export function generateSecretKey(): string {
  return crypto.randomBytes(64).toString('base64');
}

// ==================== Export ====================

export default {
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
  generateCSPHeader,
  generateSecureHeaders,
  generateSecureRandom,
  generateApiKey,
  generateSecretKey,
  DEFAULT_SECURITY_CONFIG,
  DEFAULT_CSP_CONFIG,
};
