/**
 * Emotion Service
 *
 * 管理情緒日記記錄
 */

import { Emotion, EmotionTag } from '@prisma/client';
import { prisma } from '../config/prisma';
import { log } from '../utils/logger';
import { DatabaseError } from '../types';
import { analyzeEmotion, analyzeChatHistory } from '../ai/sentiment-analyzer';
import { recommendSong } from '../ai/song-recommender';
import { generatePlanetColor } from '../ai/insight-generator';
import {
  addStardust,
  incrementTotalRecords,
  earnBadge,
} from './user.service';
import { STARDUST_REWARDS } from '../utils/constants';
import { isLateNight } from '../utils/date-utils';

/**
 * 創建情緒記錄（手動輸入）
 */
export async function createEmotionRecord(
  userId: string,
  mood: number,
  content: string,
  timezone: string = 'Asia/Taipei'
): Promise<Emotion> {
  try {
    log.info(`Creating emotion record for user ${userId}`);

    // AI 分析
    const analysis = await analyzeEmotion(content);
    const song = await recommendSong(content, mood, analysis.moodLabel);
    const planetColor = await generatePlanetColor(content, mood, analysis.moodLabel);

    // 生成星球 ID
    const userEmotionCount = await prisma.emotion.count({ where: { userId } });
    const planetId = `#${(userEmotionCount + 1).toString().padStart(3, '0')}`;

    // 創建記錄
    const emotion = await prisma.emotion.create({
      data: {
        userId,
        date: new Date(),
        mood,
        moodLabel: analysis.moodLabel,
        content,
        songUrl: song.url,
        songName: `${song.songName} - ${song.artist}`,
        color: planetColor.color,
        planetId,
        aiInsight: analysis.aiInsight,
        wordCount: content.length,
        tags: {
          create: analysis.tags?.map((tag) => ({ name: tag })) || [],
        },
      },
      include: { tags: true },
    });

    // 獎勵星塵
    await addStardust(userId, STARDUST_REWARDS.DAILY_RECORD, '完成每日記錄');

    // 增加總記錄數並檢查升級
    const { leveledUp, newLevel, reward } = await incrementTotalRecords(userId);

    // 檢查並授予徽章
    await checkAndAwardBadges(userId, timezone);

    log.info(
      `Created emotion record ${emotion.id} for user ${userId}${leveledUp ? ` - Leveled up to ${newLevel}!` : ''}`
    );

    return emotion;
  } catch (error) {
    log.error('Error creating emotion record:', error);
    throw new DatabaseError('無法創建情緒記錄');
  }
}

/**
 * 創建情緒記錄（從聊天記錄分析）
 */
export async function createEmotionFromChat(
  userId: string,
  chatContent: string,
  timezone: string = 'Asia/Taipei'
): Promise<Emotion[]> {
  try {
    log.info(`Creating emotion records from chat for user ${userId}`);

    // 分析聊天記錄
    const analysis = await analyzeChatHistory(chatContent);

    const emotions: Emotion[] = [];

    // 為每個片段創建記錄（如果有多個）
    // 簡化版：只創建一個綜合記錄
    const mood = analysis.overallMood;
    const content = `${analysis.summary}\n\n${analysis.segments.map((s) => `- ${s.keyEvent}: ${s.content}`).join('\n')}`;

    const emotion = await createEmotionRecord(userId, mood, content, timezone);
    emotions.push(emotion);

    return emotions;
  } catch (error) {
    log.error('Error creating emotion from chat:', error);
    throw new DatabaseError('無法從聊天記錄創建情緒記錄');
  }
}

/**
 * 取得特定日期的情緒記錄
 */
export async function getEmotionByDate(
  userId: string,
  date: Date
): Promise<Emotion | null> {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.emotion.findFirst({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: { tags: true },
      orderBy: { date: 'desc' },
    });
  } catch (error) {
    log.error('Error getting emotion by date:', error);
    throw new DatabaseError('無法取得情緒記錄');
  }
}

/**
 * 取得今天的情緒記錄
 */
export async function getTodayEmotion(userId: string): Promise<Emotion | null> {
  return getEmotionByDate(userId, new Date());
}

/**
 * 取得本月所有情緒記錄
 */
export async function getEmotionsByMonth(
  userId: string,
  year: number,
  month: number
): Promise<Emotion[]> {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    return await prisma.emotion.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { tags: true },
      orderBy: { date: 'asc' },
    });
  } catch (error) {
    log.error('Error getting emotions by month:', error);
    throw new DatabaseError('無法取得月度情緒記錄');
  }
}

/**
 * 取得使用者所有情緒記錄（分頁）
 */
export async function getUserEmotions(
  userId: string,
  skip: number = 0,
  take: number = 30
): Promise<{ emotions: Emotion[]; total: number }> {
  try {
    const [emotions, total] = await Promise.all([
      prisma.emotion.findMany({
        where: { userId },
        include: { tags: true },
        orderBy: { date: 'desc' },
        skip,
        take,
      }),
      prisma.emotion.count({ where: { userId } }),
    ]);

    return { emotions, total };
  } catch (error) {
    log.error('Error getting user emotions:', error);
    throw new DatabaseError('無法取得情緒記錄');
  }
}

/**
 * 檢查並授予徽章
 */
async function checkAndAwardBadges(userId: string, timezone: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        emotions: {
          orderBy: { date: 'desc' },
          take: 100,
        },
        userBadges: {
          include: { badge: true },
        },
      },
    });

    if (!user) return;

    const badgeCodes = user.userBadges.map((ub) => ub.badge.code);

    // 首次記錄徽章
    if (user.totalRecords === 1 && !badgeCodes.includes('FIRST_RECORD')) {
      await earnBadge(userId, 'FIRST_RECORD');
    }

    // 連續記錄徽章
    const { currentStreak } = calculateStreak(user.emotions);

    if (currentStreak >= 7 && !badgeCodes.includes('WEEK_STREAK')) {
      await earnBadge(userId, 'WEEK_STREAK');
      await addStardust(userId, STARDUST_REWARDS.WEEK_STREAK, '連續記錄 7 天');
    }

    if (currentStreak >= 30 && !badgeCodes.includes('MONTH_STREAK')) {
      await earnBadge(userId, 'MONTH_STREAK');
      await addStardust(userId, STARDUST_REWARDS.MONTH_STREAK, '連續記錄 30 天');
    }

    if (currentStreak >= 100 && !badgeCodes.includes('HUNDRED_DAYS')) {
      await earnBadge(userId, 'HUNDRED_DAYS');
    }

    if (currentStreak >= 365 && !badgeCodes.includes('YEAR_GUARDIAN')) {
      await earnBadge(userId, 'YEAR_GUARDIAN');
    }

    // 勇氣之心徽章（低潮時仍記錄）
    const latestEmotion = user.emotions[0];
    if (
      latestEmotion &&
      latestEmotion.mood <= 3 &&
      !badgeCodes.includes('COURAGE_HEART')
    ) {
      await earnBadge(userId, 'COURAGE_HEART');
    }

    // 夜空守護者徽章（凌晨記錄）
    if (
      latestEmotion &&
      isLateNight(latestEmotion.date, timezone) &&
      !badgeCodes.includes('NIGHT_GUARDIAN')
    ) {
      await earnBadge(userId, 'NIGHT_GUARDIAN');
    }

    // 星球藝術家徽章（50 個星球）
    if (user.totalRecords >= 50 && !badgeCodes.includes('PLANET_ARTIST')) {
      await earnBadge(userId, 'PLANET_ARTIST');
    }

    // 成長之星徽章（單月情緒進步）
    await checkGrowthStarBadge(userId, badgeCodes);
  } catch (error) {
    log.error('Error checking and awarding badges:', error);
    // 不拋出錯誤，避免影響主流程
  }
}

/**
 * 計算連續記錄天數
 */
function calculateStreak(emotions: Emotion[]): { currentStreak: number } {
  if (emotions.length === 0) {
    return { currentStreak: 0 };
  }

  let currentStreak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const latestDate = new Date(emotions[0].date);
  latestDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays > 1) {
    return { currentStreak: 0 };
  }

  // 計算連續天數
  for (let i = 0; i < emotions.length - 1; i++) {
    const date1 = new Date(emotions[i].date);
    const date2 = new Date(emotions[i + 1].date);
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);

    const diff = Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  return { currentStreak };
}

/**
 * 檢查成長之星徽章
 */
async function checkGrowthStarBadge(
  userId: string,
  badgeCodes: string[]
): Promise<void> {
  if (badgeCodes.includes('GROWTH_STAR')) return;

  try {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [thisMonth, lastMonth] = await Promise.all([
      prisma.emotion.aggregate({
        where: {
          userId,
          date: { gte: thisMonthStart, lte: thisMonthEnd },
        },
        _avg: { mood: true },
      }),
      prisma.emotion.aggregate({
        where: {
          userId,
          date: { gte: lastMonthStart, lte: lastMonthEnd },
        },
        _avg: { mood: true },
      }),
    ]);

    const thisAvg = thisMonth._avg.mood || 0;
    const lastAvg = lastMonth._avg.mood || 0;

    if (thisAvg - lastAvg >= 3) {
      await earnBadge(userId, 'GROWTH_STAR');
    }
  } catch (error) {
    log.error('Error checking growth star badge:', error);
  }
}
