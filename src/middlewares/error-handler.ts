/**
 * Error Handler Middleware
 *
 * 統一錯誤處理機制
 */

import { ChatInputCommandInteraction } from 'discord.js';
import { AppError, ValidationError, DatabaseError, AIServiceError } from '../types';
import { log, logError } from '../utils/logger';
import { createErrorEmbed, createWarningEmbed } from '../utils/embed-builder';

/**
 * 處理互動錯誤
 */
export async function handleInteractionError(
  error: unknown,
  interaction: ChatInputCommandInteraction
): Promise<void> {
  logError(error as Error, 'Interaction Error');

  // 判斷錯誤類型並給予適當回應
  let errorMessage = '發生未知錯誤，請稍後再試。';
  let isOperational = false;

  if (error instanceof ValidationError) {
    errorMessage = `❌ 輸入驗證錯誤：${error.message}`;
    isOperational = true;
  } else if (error instanceof DatabaseError) {
    errorMessage = '❌ 資料庫錯誤，請稍後再試。';
    isOperational = true;
  } else if (error instanceof AIServiceError) {
    errorMessage = '❌ AI 服務暫時無法使用，請稍後再試。';
    isOperational = true;
  } else if (error instanceof AppError) {
    errorMessage = `❌ ${error.message}`;
    isOperational = error.isOperational;
  } else if (error instanceof Error) {
    errorMessage = `❌ 發生錯誤：${error.message}`;
  }

  // 回應使用者
  try {
    const embed = createErrorEmbed(errorMessage);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ embeds: [embed] });
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  } catch (replyError) {
    log.error('Failed to send error message to user', replyError);
  }

  // 如果是非預期錯誤，記錄詳細資訊
  if (!isOperational) {
    log.error('Unhandled error occurred', {
      error,
      user: interaction.user.tag,
      command: interaction.commandName,
      guild: interaction.guild?.name,
    });
  }
}

/**
 * 處理一般錯誤
 */
export function handleError(error: unknown, context?: string): void {
  if (error instanceof AppError) {
    if (error.isOperational) {
      log.warn(`Operational error: ${error.message}`, { context });
    } else {
      log.error(`Application error: ${error.message}`, { context, stack: error.stack });
    }
  } else if (error instanceof Error) {
    log.error(`Unexpected error: ${error.message}`, { context, stack: error.stack });
  } else {
    log.error('Unknown error occurred', { error, context });
  }
}

/**
 * 處理 Promise Rejection
 */
export function handleUnhandledRejection(reason: unknown, promise: Promise<any>): void {
  log.error('Unhandled Promise Rejection', {
    reason,
    promise,
  });

  // 在生產環境中，可能需要通知管理員或重啟服務
  if (process.env.NODE_ENV === 'production') {
    // TODO: 發送告警通知
  }
}

/**
 * 處理未捕獲的異常
 */
export function handleUncaughtException(error: Error): void {
  log.error('Uncaught Exception - 應用程式即將關閉', {
    error: error.message,
    stack: error.stack,
  });

  // 優雅關閉
  process.exit(1);
}

/**
 * 包裝非同步函數以自動處理錯誤
 */
export function asyncErrorHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R | void> {
  return async (...args: T): Promise<R | void> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, fn.name);
    }
  };
}

/**
 * 包裝互動處理函數以自動處理錯誤
 */
export function interactionErrorHandler(
  fn: (interaction: ChatInputCommandInteraction) => Promise<void>
): (interaction: ChatInputCommandInteraction) => Promise<void> {
  return async (interaction: ChatInputCommandInteraction): Promise<void> => {
    try {
      await fn(interaction);
    } catch (error) {
      await handleInteractionError(error, interaction);
    }
  };
}

/**
 * 驗證並拋出錯誤
 */
export function throwIfInvalid(
  condition: boolean,
  message: string,
  ErrorClass: typeof AppError = ValidationError
): void {
  if (!condition) {
    throw new ErrorClass(message);
  }
}

/**
 * 安全執行函數（捕獲並記錄錯誤，不拋出）
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  context?: string,
  defaultValue?: T
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, context);
    return defaultValue;
  }
}
