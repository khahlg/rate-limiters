import bunyan, { LogLevel } from 'bunyan';

const logger = bunyan.createLogger({
  name: process.env.SERVICE_NAME || 'service-name',
  level: (process.env.LOG_LEVEL || 'info') as LogLevel,
});

export { logger };
