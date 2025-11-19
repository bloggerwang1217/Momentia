/**
 * Logger Utility using Winston
 *
 * Provides structured logging with different levels and formats
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

// 確保 logs 目錄存在
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// 定義日誌格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 控制台輸出格式（彩色、易讀）
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;

    // 如果有額外的 metadata，也印出來
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }

    return msg;
  })
);

// 創建 logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'mementia-bot' },
  transports: [
    // 錯誤日誌檔案
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 綜合日誌檔案
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// 開發環境增加控制台輸出
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// 生產環境也要能看到控制台輸出，但格式簡潔
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

/**
 * 便捷的日誌方法
 */
export const log = {
  debug: (message: string, meta?: any) => logger.debug(message, meta),
  info: (message: string, meta?: any) => logger.info(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  error: (message: string, meta?: any) => logger.error(message, meta),
};

/**
 * 特定場景的日誌方法
 */
export const logCommand = (userId: string, username: string, commandName: string) => {
  logger.info('Command executed', {
    userId,
    username,
    commandName,
    timestamp: new Date().toISOString(),
  });
};

export const logError = (error: Error, context?: string) => {
  logger.error('Error occurred', {
    context,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
};

export const logAIRequest = (model: string, purpose: string, tokensUsed?: number) => {
  logger.info('AI request', {
    model,
    purpose,
    tokensUsed,
    timestamp: new Date().toISOString(),
  });
};

export const logDatabaseQuery = (operation: string, table: string, duration?: number) => {
  logger.debug('Database query', {
    operation,
    table,
    duration: duration ? `${duration}ms` : undefined,
    timestamp: new Date().toISOString(),
  });
};

export default logger;
