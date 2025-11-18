/**
 * Prisma Client Configuration
 *
 * 初始化和管理 Prisma Client 實例
 */

import { PrismaClient } from '@prisma/client';
import { log, logDatabaseQuery } from '../utils/logger';

// 擴展 PrismaClient 型別以支援全域快取
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * 創建 Prisma Client 實例
 *
 * 在開發環境中使用全域變數避免熱重載時創建多個實例
 */
function createPrismaClient(): PrismaClient {
  const prisma = new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? [
            { level: 'query', emit: 'event' },
            { level: 'error', emit: 'stdout' },
            { level: 'warn', emit: 'stdout' },
          ]
        : [
            { level: 'error', emit: 'stdout' },
            { level: 'warn', emit: 'stdout' },
          ],
  });

  // 監聽查詢事件（開發環境）
  if (process.env.NODE_ENV === 'development') {
    prisma.$on('query' as never, (e: any) => {
      logDatabaseQuery(
        'query',
        e.target || 'unknown',
        e.duration
      );
    });
  }

  return prisma;
}

/**
 * Prisma Client 單例
 */
export const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * 連接到資料庫
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    log.info('✅ Database connected successfully');

    // 測試查詢
    await prisma.$queryRaw`SELECT 1`;
    log.info('✅ Database connection test passed');
  } catch (error) {
    log.error('❌ Failed to connect to database', error);
    throw error;
  }
}

/**
 * 斷開資料庫連接
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    log.info('✅ Database disconnected');
  } catch (error) {
    log.error('❌ Failed to disconnect from database', error);
    throw error;
  }
}

/**
 * 健康檢查
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    log.error('❌ Database health check failed', error);
    return false;
  }
}

export default prisma;
