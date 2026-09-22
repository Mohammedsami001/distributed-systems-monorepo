import { type Redis } from 'ioredis';

/**
 * The Lua script executed atomically inside Redis.
 *
 * KEYS[1]: The rate limit key (e.g. 'rl:ip:192.168.1.1' or 'rl:user:usr_123')
 * ARGV[1]: Current timestamp in milliseconds (Date.now())
 * ARGV[2]: Window duration in milliseconds (e.g. 60000 for 1 minute)
 * ARGV[3]: Maximum allowed requests in this window (e.g. 100)
 *
 * Returns an array: [isAllowed (0 or 1), remainingRequests, resetInSeconds]
 */
export const SLIDING_WINDOW_LUA_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local windowMs = tonumber(ARGV[2])
local maxRequests = tonumber(ARGV[3])
local clearBefore = now - windowMs

-- 1. Remove all request timestamps that fell outside the sliding window
redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)

-- 2. Count remaining requests within the current window
local currentRequests = redis.call('ZCARD', key)

-- 3. Check if user is within the allowable quota
if currentRequests < maxRequests then
  -- Add current timestamp. Member is formatted as 'now:count' to ensure uniqueness in the ZSET
  redis.call('ZADD', key, now, now .. ':' .. currentRequests)
  
  -- Set key expiry in milliseconds so inactive users don't linger in Redis memory (Cost optimization!)
  redis.call('PEXPIRE', key, windowMs)
  
  local remaining = maxRequests - (currentRequests + 1)
  local resetSeconds = math.ceil(windowMs / 1000)
  return { 1, remaining, resetSeconds }
else
  -- Limit reached: Block request
  local resetSeconds = math.ceil(windowMs / 1000)
  return { 0, 0, resetSeconds }
end
`;

export interface RateLimitResult {
  /** True if the request is within quota; False if rate limited (429) */
  isAllowed: boolean;
  /** How many requests the client has left in the current window */
  remaining: number;
  /** Seconds until the rate limit window completely resets */
  resetSeconds: number;
}

/**
 * Evaluates a sliding window rate limit atomically using Redis Lua scripting.
 * Total execution time inside Redis memory: < 0.2ms.
 */
export async function evaluateRateLimit(
  redis: Redis,
  key: string,
  windowMs: number,
  maxRequests: number
): Promise<RateLimitResult> {
  const now = Date.now();

  // Execute the Lua script atomically on Redis
  const result = (await redis.eval(
    SLIDING_WINDOW_LUA_SCRIPT,
    1, // Number of KEYS passed
    key, // KEYS[1]
    now.toString(), // ARGV[1]
    windowMs.toString(), // ARGV[2]
    maxRequests.toString() // ARGV[3]
  )) as [number, number, number];

  const isAllowed = result[0] === 1;
  const remaining = result[1];
  const resetSeconds = result[2];

  return {
    isAllowed,
    remaining,
    resetSeconds,
  };
}
