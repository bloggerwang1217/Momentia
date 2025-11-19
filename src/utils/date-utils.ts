/**
 * Date Utilities
 *
 * 日期和時間處理工具函數
 */

import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  addDays,
  addMonths,
  addYears,
  differenceInDays,
  differenceInHours,
  parseISO,
  isValid,
} from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime, format as formatTz } from 'date-fns-tz';

/**
 * 將使用者本地時間轉換為 UTC
 */
export function toUTC(date: Date, timezone: string): Date {
  return zonedTimeToUtc(date, timezone);
}

/**
 * 將 UTC 時間轉換為使用者本地時間
 */
export function toUserTime(date: Date, timezone: string): Date {
  return utcToZonedTime(date, timezone);
}

/**
 * 格式化日期（使用者時區）
 */
export function formatDate(date: Date, timezone: string, formatStr: string = 'yyyy-MM-dd'): string {
  const userTime = toUserTime(date, timezone);
  return formatTz(userTime, formatStr, { timeZone: timezone });
}

/**
 * 格式化日期時間（使用者時區）
 */
export function formatDateTime(
  date: Date,
  timezone: string,
  formatStr: string = 'yyyy-MM-dd HH:mm:ss'
): string {
  const userTime = toUserTime(date, timezone);
  return formatTz(userTime, formatStr, { timeZone: timezone });
}

/**
 * 解析日期字串
 */
export function parseDate(dateStr: string): Date | null {
  const date = parseISO(dateStr);
  return isValid(date) ? date : null;
}

/**
 * 獲取週期的開始和結束日期
 */
export function getPeriodDates(
  type: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
  referenceDate: Date = new Date()
): { startDate: Date; endDate: Date; period: string } {
  let startDate: Date;
  let endDate: Date;
  let period: string;

  switch (type) {
    case 'WEEKLY':
      startDate = startOfWeek(referenceDate, { weekStartsOn: 1 }); // 週一開始
      endDate = endOfWeek(referenceDate, { weekStartsOn: 1 });
      period = format(startDate, 'yyyy-[W]ww'); // 例: 2024-W12
      break;

    case 'MONTHLY':
      startDate = startOfMonth(referenceDate);
      endDate = endOfMonth(referenceDate);
      period = format(startDate, 'yyyy-MM'); // 例: 2024-06
      break;

    case 'QUARTERLY':
      startDate = startOfQuarter(referenceDate);
      endDate = endOfQuarter(referenceDate);
      const quarter = Math.floor(startDate.getMonth() / 3) + 1;
      period = `${format(startDate, 'yyyy')}-Q${quarter}`; // 例: 2024-Q2
      break;

    case 'YEARLY':
      startDate = startOfYear(referenceDate);
      endDate = endOfYear(referenceDate);
      period = format(startDate, 'yyyy'); // 例: 2024
      break;

    default:
      throw new Error(`Unknown period type: ${type}`);
  }

  return { startDate, endDate, period };
}

/**
 * 計算兩個日期之間的天數差
 */
export function daysBetween(date1: Date, date2: Date): number {
  return differenceInDays(date2, date1);
}

/**
 * 計算兩個日期之間的小時差
 */
export function hoursBetween(date1: Date, date2: Date): number {
  return differenceInHours(date2, date1);
}

/**
 * 增加天數
 */
export function addDaysToDate(date: Date, days: number): Date {
  return addDays(date, days);
}

/**
 * 增加月數
 */
export function addMonthsToDate(date: Date, months: number): Date {
  return addMonths(date, months);
}

/**
 * 增加年數
 */
export function addYearsToDate(date: Date, years: number): Date {
  return addYears(date, years);
}

/**
 * 檢查是否為今天（使用者時區）
 */
export function isToday(date: Date, timezone: string): boolean {
  const userTime = toUserTime(date, timezone);
  const now = toUserTime(new Date(), timezone);

  return format(userTime, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
}

/**
 * 檢查是否為凌晨時段（00:00 - 06:00）
 */
export function isLateNight(date: Date, timezone: string): boolean {
  const userTime = toUserTime(date, timezone);
  const hour = userTime.getHours();

  return hour >= 0 && hour < 6;
}

/**
 * 解析提醒時間（HH:mm）並返回今天的完整日期時間
 */
export function parseReminderTime(timeStr: string, timezone: string): Date | null {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) return null;

  const [, hourStr, minuteStr] = match;
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  // 獲取使用者當前時間
  const now = toUserTime(new Date(), timezone);

  // 設定時和分
  now.setHours(hour, minute, 0, 0);

  // 轉回 UTC
  return toUTC(now, timezone);
}

/**
 * 獲取當前使用者時間
 */
export function getCurrentUserTime(timezone: string): Date {
  return toUserTime(new Date(), timezone);
}

/**
 * 檢查是否應該發送提醒
 *
 * 判斷當前時間是否匹配設定的提醒時間（容許 5 分鐘誤差）
 */
export function shouldSendReminder(
  reminderTime: string,
  timezone: string,
  lastReminderDate?: Date
): boolean {
  const now = getCurrentUserTime(timezone);
  const match = reminderTime.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) return false;

  const [, hourStr, minuteStr] = match;
  const targetHour = parseInt(hourStr, 10);
  const targetMinute = parseInt(minuteStr, 10);

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // 檢查時間是否匹配（容許 5 分鐘誤差）
  const hourMatch = currentHour === targetHour;
  const minuteMatch = Math.abs(currentMinute - targetMinute) <= 5;

  if (!hourMatch || !minuteMatch) {
    return false;
  }

  // 如果今天已經發送過提醒，則不再發送
  if (lastReminderDate && isToday(lastReminderDate, timezone)) {
    return false;
  }

  return true;
}

/**
 * 獲取人性化的相對時間描述
 */
export function getRelativeTimeDescription(date: Date, timezone: string): string {
  const now = getCurrentUserTime(timezone);
  const targetDate = toUserTime(date, timezone);
  const days = daysBetween(now, targetDate);

  if (days === 0) return '今天';
  if (days === 1) return '明天';
  if (days === -1) return '昨天';
  if (days > 1 && days <= 7) return `${days} 天後`;
  if (days < -1 && days >= -7) return `${Math.abs(days)} 天前`;
  if (days > 7 && days <= 30) return `${Math.floor(days / 7)} 週後`;
  if (days < -7 && days >= -30) return `${Math.floor(Math.abs(days) / 7)} 週前`;
  if (days > 30 && days <= 365) return `${Math.floor(days / 30)} 個月後`;
  if (days < -30 && days >= -365) return `${Math.floor(Math.abs(days) / 30)} 個月前`;

  return formatDate(targetDate, timezone, 'yyyy-MM-dd');
}
