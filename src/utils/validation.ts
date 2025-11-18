/**
 * Validation Utilities
 *
 * 輸入驗證工具函數
 */

import { z } from 'zod';
import { MAX_LENGTHS } from './constants';

// ============================================
// 基礎驗證 Schema
// ============================================

/**
 * 情緒分數驗證（1-10）
 */
export const moodSchema = z.number().int().min(1).max(10);

/**
 * 日記內容驗證
 */
export const diaryContentSchema = z
  .string()
  .min(1, '內容不能為空')
  .max(MAX_LENGTHS.DIARY_CONTENT, `內容不能超過 ${MAX_LENGTHS.DIARY_CONTENT} 字`);

/**
 * 信件內容驗證
 */
export const letterContentSchema = z
  .string()
  .min(1, '內容不能為空')
  .max(MAX_LENGTHS.LETTER_CONTENT, `內容不能超過 ${MAX_LENGTHS.LETTER_CONTENT} 字`);

/**
 * Email 驗證
 */
export const emailSchema = z.string().email('請輸入有效的 Email 地址').optional();

/**
 * 時區驗證
 */
export const timezoneSchema = z.string().min(1, '時區不能為空');

/**
 * 提醒時間驗證（HH:mm 格式）
 */
export const reminderTimeSchema = z
  .string()
  .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, '時間格式應為 HH:mm（例如：09:30）');

/**
 * Discord ID 驗證
 */
export const discordIdSchema = z.string().regex(/^\d{17,19}$/, '無效的 Discord ID');

/**
 * 使用者名稱驗證
 */
export const usernameSchema = z
  .string()
  .min(1, '使用者名稱不能為空')
  .max(MAX_LENGTHS.USERNAME, `使用者名稱不能超過 ${MAX_LENGTHS.USERNAME} 字`);

/**
 * 標籤名稱驗證
 */
export const tagNameSchema = z
  .string()
  .min(1, '標籤名稱不能為空')
  .max(MAX_LENGTHS.TAG_NAME, `標籤名稱不能超過 ${MAX_LENGTHS.TAG_NAME} 字`);

/**
 * 挑戰證明驗證
 */
export const challengeProofSchema = z
  .string()
  .min(1, '請描述你如何完成挑戰')
  .max(MAX_LENGTHS.CHALLENGE_PROOF, `描述不能超過 ${MAX_LENGTHS.CHALLENGE_PROOF} 字`);

// ============================================
// 複合驗證 Schema
// ============================================

/**
 * 情緒記錄驗證
 */
export const emotionRecordSchema = z.object({
  userId: discordIdSchema,
  mood: moodSchema,
  content: diaryContentSchema,
  tags: z.array(tagNameSchema).optional(),
});

/**
 * 未來信件驗證
 */
export const futureLetterSchema = z.object({
  userId: discordIdSchema,
  content: letterContentSchema,
  deliverDate: z.date().min(new Date(), '送達日期必須在未來'),
});

/**
 * 使用者設定驗證
 */
export const userSettingsSchema = z.object({
  timezone: timezoneSchema.optional(),
  reminderTime: reminderTimeSchema.optional(),
  email: emailSchema,
  dailyReminder: z.boolean().optional(),
  weeklyReview: z.boolean().optional(),
  monthlyReview: z.boolean().optional(),
  challengeEnabled: z.boolean().optional(),
});

// ============================================
// 驗證函數
// ============================================

/**
 * 驗證情緒分數
 */
export function validateMood(mood: unknown): { valid: boolean; error?: string } {
  const result = moodSchema.safeParse(mood);

  if (result.success) {
    return { valid: true };
  } else {
    return { valid: false, error: result.error.errors[0].message };
  }
}

/**
 * 驗證 Email
 */
export function validateEmail(email: unknown): { valid: boolean; error?: string } {
  const result = emailSchema.safeParse(email);

  if (result.success) {
    return { valid: true };
  } else {
    return { valid: false, error: result.error.errors[0].message };
  }
}

/**
 * 驗證提醒時間
 */
export function validateReminderTime(time: unknown): { valid: boolean; error?: string } {
  const result = reminderTimeSchema.safeParse(time);

  if (result.success) {
    return { valid: true };
  } else {
    return { valid: false, error: result.error.errors[0].message };
  }
}

/**
 * 驗證日期是否在未來
 */
export function validateFutureDate(date: Date): { valid: boolean; error?: string } {
  if (date <= new Date()) {
    return { valid: false, error: '日期必須在未來' };
  }

  return { valid: true };
}

/**
 * 驗證日期範圍
 */
export function validateDateRange(
  startDate: Date,
  endDate: Date
): { valid: boolean; error?: string } {
  if (startDate >= endDate) {
    return { valid: false, error: '開始日期必須早於結束日期' };
  }

  return { valid: true };
}

/**
 * 清理和驗證文字輸入
 */
export function sanitizeText(text: string, maxLength?: number): string {
  // 移除前後空白
  let sanitized = text.trim();

  // 限制長度
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * 驗證時區是否有效
 */
export function validateTimezone(timezone: string): { valid: boolean; error?: string } {
  try {
    // 嘗試使用時區創建日期
    new Date().toLocaleString('en-US', { timeZone: timezone });
    return { valid: true };
  } catch (error) {
    return { valid: false, error: '無效的時區' };
  }
}

/**
 * 驗證 Discord Snowflake ID
 */
export function validateDiscordId(id: string): { valid: boolean; error?: string } {
  const result = discordIdSchema.safeParse(id);

  if (result.success) {
    return { valid: true };
  } else {
    return { valid: false, error: '無效的 Discord ID' };
  }
}

/**
 * 驗證並解析 JSON
 */
export function validateJSON(jsonStr: string): { valid: boolean; data?: any; error?: string } {
  try {
    const data = JSON.parse(jsonStr);
    return { valid: true, data };
  } catch (error) {
    return { valid: false, error: '無效的 JSON 格式' };
  }
}
