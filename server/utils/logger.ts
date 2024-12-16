import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { environment } from '../config/environment';

// Tipos para o logger
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogMetadata {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: LogMetadata;
}

// Configuração dos níveis de log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// Cores para diferentes níveis no console
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue'
};

// Formato base para todos os logs
const baseFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Formato específico para console
const consoleFormat = winston.format.combine(
  winston.format.colorize({ colors }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    const metaString = Object.keys(metadata).length
      ? `\n${JSON.stringify(metadata, null, 2)}`
      : '';
    return `[${timestamp}] ${level}: ${message}${metaString}`;
  })
);

class Logger {
  private logger: winston.Logger;
  private readonly isDevelopment = environment.isDevelopment();

  constructor() {
    // Configurar transportes do Winston
    const transports: winston.transport[] = [
      new winston.transports.Console({
        level: this.isDevelopment ? 'debug' : 'info',
        format: consoleFormat
      })
    ];

    // Adicionar log em arquivo apenas em produção
    if (!this.isDevelopment) {
      // Log geral
      transports.push(
        new DailyRotateFile({
          level: 'info',
          filename: 'logs/app-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: baseFormat
        })
      );

      // Log específico para erros
      transports.push(
        new DailyRotateFile({
          level: 'error',
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          format: baseFormat
        })
      );
    }

    // Criar instância do logger
    this.logger = winston.createLogger({
      levels,
      format: baseFormat,
      transports,
      exitOnError: false
    });

    // Adicionar handler para erros no logger
    this.logger.on('error', (error) => {
      console.error('Logger error:', error);
    });
  }

  private formatMetadata(metadata?: LogMetadata): LogMetadata {
    if (!metadata) return {};

    return {
      ...metadata,
      environment: environment.nodeEnv,
      timestamp: new Date().toISOString(),
      pid: process.pid
    };
  }

  private logWithLevel(level: LogLevel, message: string, metadata?: LogMetadata) {
    try {
      this.logger.log({
        level,
        message,
        ...this.formatMetadata(metadata)
      });
    } catch (error) {
      console.error('Logging error:', error);
      console.log(`${level}: ${message}`, metadata);
    }
  }

  debug(message: string, metadata?: LogMetadata) {
    this.logWithLevel('debug', message, metadata);
  }

  info(message: string, metadata?: LogMetadata) {
    this.logWithLevel('info', message, metadata);
  }

  warn(message: string, metadata?: LogMetadata) {
    this.logWithLevel('warn', message, metadata);
  }

  error(message: string, metadata?: LogMetadata) {
    this.logWithLevel('error', message, metadata);
  }

  // Método específico para logs de segurança
  security(message: string, metadata?: LogMetadata) {
    this.logWithLevel('warn', `[SECURITY] ${message}`, metadata);
  }

  // Método específico para logs de performance
  performance(message: string, metadata?: LogMetadata) {
    this.logWithLevel('info', `[PERFORMANCE] ${message}`, {
      ...metadata,
      timestamp: Date.now()
    });
  }

  // Stream para uso com Morgan
  get httpStream() {
    return {
      write: (message: string) => {
        this.info(message.trim(), { source: 'http' });
      }
    };
  }
}

// Exportar instância única
export const logger = new Logger();