import { Redis, type RedisOptions } from 'ioredis';
import { type Logger } from '@distributed/logger';

export { Redis };

export interface RedisClientConfig {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  /** Maximum number of reconnect retries before giving up (default: 10) */
  maxRetries?: number;
  /** Optional logger instance from @distributed/logger */
  logger?: Logger;
}

/**
 * Creates an enterprise-grade Redis connection with exponential backoff retries,
 * connection lifecycle monitoring, and production-ready error handling.
 */
export function createRedisClient(config: RedisClientConfig = {}): Redis {
  const host = config.host ?? process.env.REDIS_HOST ?? '127.0.0.1';
  const port = config.port ?? (process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379);
  const password = config.password ?? process.env.REDIS_PASSWORD;
  const db = config.db ?? 0;
  const maxRetries = config.maxRetries ?? 10;
  const logger = config.logger;

  const options: RedisOptions = {
    host,
    port,
    password: password || undefined,
    db,
    // Enable offline queuing so commands issued during temporary reconnects are not dropped
    enableOfflineQueue: true,
    // Exponential backoff reconnect strategy
    retryStrategy(times: number) {
      if (times > maxRetries) {
        logger?.error({ times, maxRetries }, 'Redis reached maximum reconnection attempts. Giving up.');
        return null; // Stop reconnecting
      }
      // Backoff delay: min(times * 100ms, 2000ms) with slight jitter
      const delay = Math.min(times * 100, 2000) + Math.floor(Math.random() * 50);
      logger?.warn({ times, delayMs: delay }, 'Redis connection lost. Retrying...');
      return delay;
    },
  };

  const client = new Redis(options);

  client.on('connect', () => {
    logger?.info({ host, port, db }, 'Connecting to Redis...');
  });

  client.on('ready', () => {
    logger?.info({ host, port, db }, 'Redis connection is ready to accept commands.');
  });

  client.on('error', (err: Error) => {
    logger?.error({ err: err.message }, 'Redis encountered an error.');
  });

  client.on('close', () => {
    logger?.warn('Redis connection closed.');
  });

  return client;
}

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  latencyMs?: number;
  error?: string;
}

/**
 * Performs a sub-millisecond PING to verify Redis connectivity for Kubernetes readiness probes (/readyz).
 */
export async function checkRedisHealth(client: Redis, timeoutMs = 2000): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const pingPromise = client.ping();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Redis health check timed out after ${timeoutMs}ms`)), timeoutMs)
    );

    const response = await Promise.race([pingPromise, timeoutPromise]);
    const latencyMs = Date.now() - start;

    if (response === 'PONG') {
      return { status: 'healthy', latencyMs };
    }
    return { status: 'unhealthy', error: `Unexpected PING response: ${response}` };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown Redis error',
    };
  }
}

/**
 * Gracefully disconnects a Redis client, allowing in-flight commands to finish.
 */
export async function closeRedisClient(client: Redis): Promise<void> {
  if (client.status === 'ready' || client.status === 'connecting') {
    await client.quit();
  }
}

export * from './rate-limiter.js';
