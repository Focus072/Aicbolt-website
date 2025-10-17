import { NextRequest } from 'next/server';

// Simple in-memory rate limiter for development
// For production, use Redis or a proper rate limiting service

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach((key) => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxRequests: number; // Max requests per window
  windowMs: number; // Time window in milliseconds
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if request should be rate limited
 * @param identifier - Usually IP address or user ID
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;

  // Initialize or get existing entry
  if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
    rateLimitStore[key] = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }

  const entry = rateLimitStore[key];
  entry.count++;

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const success = entry.count <= config.maxRequests;

  return {
    success,
    limit: config.maxRequests,
    remaining,
    reset: Math.ceil(entry.resetTime / 1000), // Unix timestamp in seconds
  };
}

/**
 * Get client identifier from request (IP address)
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  // Fallback to a default identifier
  return 'unknown';
}

/**
 * Rate limit presets for different endpoints
 */
export const RateLimits = {
  // Strict limit for lead creation (n8n)
  LEADS_POST: {
    maxRequests: 100, // 100 requests
    windowMs: 60 * 1000, // per minute
  },
  
  // Moderate limit for dashboard API calls
  LEADS_GET: {
    maxRequests: 300, // 300 requests
    windowMs: 60 * 1000, // per minute
  },
  
  // Strict limit for account creation (prevent abuse)
  ACCOUNT_CREATE: {
    maxRequests: 10, // 10 requests
    windowMs: 60 * 60 * 1000, // per hour
  },
  
  // Moderate limit for account listing
  ACCOUNT_GET: {
    maxRequests: 60, // 60 requests
    windowMs: 60 * 1000, // per minute
  },
};


