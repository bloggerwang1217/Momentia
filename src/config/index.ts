/**
 * Configuration Index
 *
 * 統一匯出所有配置
 */

export * from './discord.config';
export * from './database.config';
export * from './ai.config';

// 驗證所有配置
import { validateDiscordConfig } from './discord.config';
import { validateDatabaseConfig } from './database.config';
import { validateAIConfig } from './ai.config';

export function validateAllConfigs(): void {
  validateDiscordConfig();
  validateDatabaseConfig();
  validateAIConfig();
}
