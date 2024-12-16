// /src/utils/logger.ts
interface LogMetadata {
  [key: string]: unknown;
}

class ClientLogger {
  private isDevelopment = import.meta.env.MODE === 'development';

  private formatMetadata(metadata?: LogMetadata): string {
    if (!metadata || Object.keys(metadata).length === 0) return '';
    return `\n${JSON.stringify(metadata, null, 2)}`;
  }

  private log(level: string, message: string, metadata?: LogMetadata) {
    const timestamp = new Date().toISOString();
    const metadataStr = this.formatMetadata(metadata);

    if (this.isDevelopment) {
      const consoleMethod = level === 'error' ? 'error' : 
                          level === 'warn' ? 'warn' : 
                          level === 'debug' ? 'debug' : 'log';
      
      console[consoleMethod](`[${timestamp}] ${level.toUpperCase()}: ${message}${metadataStr}`);
    } else {
      // Em produção, log apenas erros e warnings
      if (['error', 'warn'].includes(level)) {
        console[level](`[${timestamp}] ${message}${metadataStr}`);
      }
    }
  }

  debug(message: string, metadata?: LogMetadata) {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: LogMetadata) {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: LogMetadata) {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: LogMetadata) {
    this.log('error', message, metadata);
  }

  // Método específico para logs de performance
  performance(message: string, metadata?: LogMetadata) {
    this.log('info', `[PERFORMANCE] ${message}`, {
      ...metadata,
      timestamp: Date.now()
    });
  }
}

export const logger = new ClientLogger();