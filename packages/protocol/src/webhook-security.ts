import { createHmac, timingSafeEqual } from "crypto";

export const WEBHOOK_SIGNATURE_HEADER = "X-Synapse-Signature-256";
export const WEBHOOK_TIMESTAMP_HEADER = "X-Synapse-Timestamp";
export const TOLERANCE_SECONDS = 300; // 5 分钟

export interface WebhookSignatureOptions {
  secret: string;
  payload: string;
  timestamp?: number;
}

export interface VerifyWebhookSignatureOptions extends WebhookSignatureOptions {
  signatureHeader: string;
  toleranceSeconds?: number;
}

/**
 * 计算 Webhook payload 的签名
 */
export function computeWebhookSignature(options: WebhookSignatureOptions): string {
  const { secret, payload, timestamp = Date.now() / 1000 } = options;
  const timestampStr = Math.floor(timestamp).toString();
  const signedPayload = `${timestampStr}.${payload}`;
  
  const hmac = createHmac("sha256", secret);
  hmac.update(signedPayload);
  const signature = hmac.digest("hex");
  
  return `t=${timestampStr},v1=${signature}`;
}

/**
 * 验证 Webhook 签名
 */
export function verifyWebhookSignature(options: VerifyWebhookSignatureOptions): boolean {
  const { 
    secret, 
    payload, 
    signatureHeader, 
    toleranceSeconds = TOLERANCE_SECONDS 
  } = options;

  // 解析签名头
  const signatures = parseSignatureHeader(signatureHeader);
  if (!signatures.timestamp || !signatures.v1) {
    return false;
  }

  // 检查时间戳是否在容忍范围内
  const now = Date.now() / 1000;
  const timeDiff = Math.abs(now - signatures.timestamp);
  if (timeDiff > toleranceSeconds) {
    return false;
  }

  // 计算期望的签名
  const expectedSignature = computeWebhookSignature({
    secret,
    payload,
    timestamp: signatures.timestamp,
  });

  const expectedParts = parseSignatureHeader(expectedSignature);
  if (!expectedParts.v1) {
    return false;
  }

  // 使用时间安全比较防止时序攻击
  return safeStringCompare(signatures.v1, expectedParts.v1);
}

function parseSignatureHeader(header: string): { timestamp: number | null; v1: string | null } {
  const result = { timestamp: null as number | null, v1: null as string | null };
  
  const parts = header.split(",");
  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key === "t") {
      result.timestamp = parseInt(value, 10);
    } else if (key === "v1") {
      result.v1 = value;
    }
  }
  
  return result;
}

function safeStringCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  
  if (bufA.length !== bufB.length) {
    return false;
  }
  
  return timingSafeEqual(bufA, bufB);
}

/**
 * 生成随机的 Webhook secret
 */
export function generateWebhookSecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let secret = "whsec_";
  
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return secret;
}
