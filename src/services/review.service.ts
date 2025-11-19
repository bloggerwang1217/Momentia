/**
 * Review Service - 回顧報告服務
 */

import { prisma } from '../config/prisma';
import { Review, ReviewType } from '@prisma/client';
import { generateReview, EmotionData } from '../ai/review-generator';
import { addStardust } from './user.service';
import { log } from '../utils/logger';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  format,
  subWeeks,
  subMonths,
  subQuarters,
  subYears,
} from 'date-fns';

/**
 * 生成並儲存回顧報告
 */
export async function createReview(
  userId: string,
  type: ReviewType,
  startDate: Date,
  endDate: Date
): Promise<Review> {
  try {
    // 獲取該期間的情緒記錄
    const emotions = await prisma.emotion.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    if (emotions.length === 0) {
      throw new Error('No emotion records found for this period');
    }

    // 生成期間標識
    const period = generatePeriodId(type, startDate);

    // 檢查是否已存在
    const existing = await prisma.review.findUnique({
      where: {
        userId_type_period: {
          userId,
          type,
          period,
        },
      },
    });

    if (existing) {
      return existing;
    }

    // 轉換為 AI 需要的格式
    const emotionData: EmotionData[] = emotions.map((e) => ({
      date: e.date,
      mood: e.mood,
      moodLabel: e.moodLabel,
      content: e.content,
      aiInsight: e.aiInsight,
    }));

    // 生成 AI 回顧
    log.info(`Generating ${type} review for user ${userId}, period ${period}`);
    const reviewData = await generateReview(emotionData, type, startDate, endDate);

    // 儲存到資料庫
    const review = await prisma.review.create({
      data: {
        userId,
        type,
        period,
        startDate,
        endDate,
        summary: reviewData.summary,
        highlights: reviewData.highlights,
        insights: reviewData.insights,
        moodTrend: reviewData.moodTrend,
        wordCloud: reviewData.wordCloud || [],
      },
    });

    // 獎勵星塵
    const stardustReward = {
      WEEKLY: 50,
      MONTHLY: 100,
      QUARTERLY: 200,
      YEARLY: 500,
    }[type];

    await addStardust(userId, stardustReward, `${type} review generated`);

    log.info(`Review created: ${review.id} for user ${userId}`);
    return review;
  } catch (error) {
    log.error('Error creating review:', error);
    throw error;
  }
}

/**
 * 獲取使用者的回顧列表
 */
export async function getUserReviews(
  userId: string,
  type?: ReviewType
): Promise<Review[]> {
  return prisma.review.findMany({
    where: {
      userId,
      ...(type && { type }),
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * 獲取特定回顧
 */
export async function getReview(reviewId: string): Promise<Review | null> {
  return prisma.review.findUnique({
    where: { id: reviewId },
  });
}

/**
 * 獲取或生成最新的回顧
 */
export async function getOrCreateLatestReview(
  userId: string,
  type: ReviewType
): Promise<Review> {
  const { startDate, endDate } = getReviewPeriod(type);
  const period = generatePeriodId(type, startDate);

  // 嘗試獲取已存在的回顧
  const existing = await prisma.review.findUnique({
    where: {
      userId_type_period: {
        userId,
        type,
        period,
      },
    },
  });

  if (existing) {
    return existing;
  }

  // 不存在則生成新的
  return createReview(userId, type, startDate, endDate);
}

/**
 * 生成期間標識
 */
function generatePeriodId(type: ReviewType, date: Date): string {
  switch (type) {
    case 'WEEKLY':
      // 格式：2024-W12
      return `${format(date, 'yyyy')}-W${format(date, 'II')}`;
    case 'MONTHLY':
      // 格式：2024-06
      return format(date, 'yyyy-MM');
    case 'QUARTERLY':
      // 格式：2024-Q2
      const quarter = Math.ceil((date.getMonth() + 1) / 3);
      return `${format(date, 'yyyy')}-Q${quarter}`;
    case 'YEARLY':
      // 格式：2024
      return format(date, 'yyyy');
    default:
      throw new Error(`Unknown review type: ${type}`);
  }
}

/**
 * 獲取回顧期間的開始和結束日期
 */
export function getReviewPeriod(
  type: ReviewType,
  offset: number = 0
): { startDate: Date; endDate: Date } {
  const now = new Date();

  switch (type) {
    case 'WEEKLY': {
      const targetDate = offset === 0 ? now : subWeeks(now, Math.abs(offset));
      return {
        startDate: startOfWeek(targetDate, { weekStartsOn: 1 }), // 週一開始
        endDate: endOfWeek(targetDate, { weekStartsOn: 1 }),
      };
    }
    case 'MONTHLY': {
      const targetDate = offset === 0 ? now : subMonths(now, Math.abs(offset));
      return {
        startDate: startOfMonth(targetDate),
        endDate: endOfMonth(targetDate),
      };
    }
    case 'QUARTERLY': {
      const targetDate = offset === 0 ? now : subQuarters(now, Math.abs(offset));
      return {
        startDate: startOfQuarter(targetDate),
        endDate: endOfQuarter(targetDate),
      };
    }
    case 'YEARLY': {
      const targetDate = offset === 0 ? now : subYears(now, Math.abs(offset));
      return {
        startDate: startOfYear(targetDate),
        endDate: endOfYear(targetDate),
      };
    }
    default:
      throw new Error(`Unknown review type: ${type}`);
  }
}

/**
 * 檢查是否需要生成新的回顧
 * 用於定時任務
 */
export async function checkAndGenerateReviews(userId: string): Promise<Review[]> {
  const generated: Review[] = [];

  try {
    // 檢查週回顧（每週一生成）
    const now = new Date();
    if (now.getDay() === 1) {
      // 週一
      const { startDate, endDate } = getReviewPeriod('WEEKLY', 1); // 上週
      try {
        const review = await createReview(userId, 'WEEKLY', startDate, endDate);
        generated.push(review);
      } catch (error) {
        log.error(`Failed to generate weekly review for user ${userId}:`, error);
      }
    }

    // 檢查月回顧（每月1號生成）
    if (now.getDate() === 1) {
      const { startDate, endDate } = getReviewPeriod('MONTHLY', 1); // 上個月
      try {
        const review = await createReview(userId, 'MONTHLY', startDate, endDate);
        generated.push(review);
      } catch (error) {
        log.error(`Failed to generate monthly review for user ${userId}:`, error);
      }
    }

    // 檢查季回顧（每季第一天生成）
    const month = now.getMonth();
    if (now.getDate() === 1 && [0, 3, 6, 9].includes(month)) {
      const { startDate, endDate } = getReviewPeriod('QUARTERLY', 1); // 上一季
      try {
        const review = await createReview(userId, 'QUARTERLY', startDate, endDate);
        generated.push(review);
      } catch (error) {
        log.error(`Failed to generate quarterly review for user ${userId}:`, error);
      }
    }

    // 檢查年回顧（1月1號生成）
    if (now.getMonth() === 0 && now.getDate() === 1) {
      const { startDate, endDate } = getReviewPeriod('YEARLY', 1); // 去年
      try {
        const review = await createReview(userId, 'YEARLY', startDate, endDate);
        generated.push(review);
      } catch (error) {
        log.error(`Failed to generate yearly review for user ${userId}:`, error);
      }
    }

    return generated;
  } catch (error) {
    log.error('Error in checkAndGenerateReviews:', error);
    return generated;
  }
}
