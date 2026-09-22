import pino, { type Logger as PinoLogger, type LoggerOptions } from 'pino';

export interface LoggerConfig {
  /** The name of the service emitting the logs (e.g. 'api-gateway', 'media-worker') */
  serviceName: string;
  /** Minimum log level to print: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' */
  level?: string;
  /** Set to true in development for human-readable colorized output instead of raw JSON */
  isPretty?: boolean;
}

export type Logger = PinoLogger;

/**
 * Creates an enterprise-grade structured JSON logger configured for production observability.
 * Emits JSON logs compatible with Datadog, Prometheus/Loki, and Elasticsearch.
 */
export function createLogger(config: LoggerConfig): Logger {
  const isDev = config.isPretty ?? process.env.NODE_ENV !== 'production';
  const defaultLevel = config.level ?? (isDev ? 'debug' : 'info');

  const options: LoggerOptions = {
    level: defaultLevel,
    base: {
      service: config.serviceName,
      env: process.env.NODE_ENV ?? 'development',
    },
    // Format timestamp as standard ISO 8601 string for easy log aggregation
    timestamp: pino.stdTimeFunctions.isoTime,
  };

  // In development, pipe through pino-pretty for clean terminal reading
  if (isDev) {
    return pino({
      ...options,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    });
  }

  // In production, emit raw high-speed JSON directly to stdout
  return pino(options);
}

/**
 * Creates a child logger with a specific correlation/request ID attached.
 * Every subsequent log line will automatically include this requestId!
 */
export function createRequestLogger(parentLogger: Logger, requestId: string): Logger {
  return parentLogger.child({ requestId });
}
