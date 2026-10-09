type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const MIN_LEVEL: LogLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

function write(level: LogLevel, message: string, meta?: unknown): void {
  if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[MIN_LEVEL]) {
    return;
  }

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta !== undefined ? { meta } : {}),
  };

  const line = JSON.stringify(entry);

  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  debug: (message: string, meta?: unknown): void => write('debug', message, meta),
  info: (message: string, meta?: unknown): void => write('info', message, meta),
  warn: (message: string, meta?: unknown): void => write('warn', message, meta),
  error: (message: string, meta?: unknown): void => write('error', message, meta),
};
