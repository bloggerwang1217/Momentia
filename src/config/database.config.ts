/**
 * Database Configuration
 *
 * 管理資料庫連線設定
 */

export const databaseConfig = {
  // Database URL
  url: process.env.DATABASE_URL!,

  // 連線池設定
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
  },

  // 查詢設定
  query: {
    // 查詢超時時間（毫秒）
    timeout: 10000,
  },

  // 日誌設定
  logging: {
    // 是否記錄所有查詢
    logQueries: process.env.NODE_ENV === 'development',

    // 慢查詢閾值（毫秒）
    slowQueryThreshold: 1000,
  },
};

// 驗證必要的設定
export function validateDatabaseConfig(): void {
  if (!process.env.DATABASE_URL) {
    throw new Error('Missing required environment variable: DATABASE_URL');
  }

  // 檢查 DATABASE_URL 格式
  try {
    new URL(process.env.DATABASE_URL);
  } catch (error) {
    throw new Error('Invalid DATABASE_URL format');
  }
}
