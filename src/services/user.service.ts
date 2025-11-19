/**
 * User Service
 *
 * 管理使用者資料和設定
 */

import { User, UserSettings } from '@prisma/client';
import { prisma } from '../config/prisma';
import { log } from '../utils/logger';
import { DatabaseError } from '../types';
import { LEVELS } from '../utils/constants';

/**
 * 取得或創建使用者
 */
export async function getOrCreateUser(
  discordId: string,
  username: string
): Promise<User> {
  try {
    // 嘗試查找使用者
    let user = await prisma.user.findUnique({
      where: { discordId },
    });

    // 如果不存在，創建新使用者
    if (!user) {
      user = await prisma.user.create({
        data: {
          discordId,
          username,
          settings: {
            create: {}, // 創建預設設定
          },
        },
      });

      log.info(`Created new user: ${username} (${discordId})`);
    } else if (user.username !== username) {
      // 更新使用者名稱（如果改變）
      user = await prisma.user.update({
        where: { discordId },
        data: { username },
      });
    }

    return user;
  } catch (error) {
    log.error('Error in getOrCreateUser:', error);
    throw new DatabaseError('無法取得使用者資料');
  }
}

/**
 * 取得使用者設定
 */
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  try {
    return await prisma.userSettings.findUnique({
      where: { userId },
    });
  } catch (error) {
    log.error('Error in getUserSettings:', error);
    throw new DatabaseError('無法取得使用者設定');
  }
}

/**
 * 更新使用者設定
 */
export async function updateUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<UserSettings> {
  try {
    return await prisma.userSettings.upsert({
      where: { userId },
      update: settings,
      create: {
        userId,
        ...settings,
      },
    });
  } catch (error) {
    log.error('Error in updateUserSettings:', error);
    throw new DatabaseError('無法更新使用者設定');
  }
}

/**
 * 更新使用者時區
 */
export async function updateUserTimezone(
  userId: string,
  timezone: string
): Promise<User> {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: { timezone },
    });
  } catch (error) {
    log.error('Error in updateUserTimezone:', error);
    throw new DatabaseError('無法更新時區');
  }
}

/**
 * 更新使用者提醒時間
 */
export async function updateUserReminderTime(
  userId: string,
  reminderTime: string
): Promise<User> {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: { reminderTime },
    });
  } catch (error) {
    log.error('Error in updateUserReminderTime:', error);
    throw new DatabaseError('無法更新提醒時間');
  }
}

/**
 * 更新使用者 Email
 */
export async function updateUserEmail(userId: string, email: string): Promise<User> {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: { email },
    });
  } catch (error) {
    log.error('Error in updateUserEmail:', error);
    throw new DatabaseError('無法更新 Email');
  }
}

/**
 * 增加星塵
 */
export async function addStardust(
  userId: string,
  amount: number,
  reason: string
): Promise<User> {
  try {
    // 使用事務確保數據一致性
    const result = await prisma.$transaction(async (tx) => {
      // 更新使用者星塵
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          stardust: { increment: amount },
        },
      });

      // 記錄交易
      await tx.stardustTransaction.create({
        data: {
          userId,
          amount,
          reason,
        },
      });

      return user;
    });

    log.info(`Added ${amount} stardust to user ${userId}: ${reason}`);
    return result;
  } catch (error) {
    log.error('Error in addStardust:', error);
    throw new DatabaseError('無法增加星塵');
  }
}

/**
 * 扣除星塵
 */
export async function deductStardust(
  userId: string,
  amount: number,
  reason: string
): Promise<User> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 檢查餘額
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user || user.stardust < amount) {
        throw new Error('星塵不足');
      }

      // 扣除星塵
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          stardust: { decrement: amount },
        },
      });

      // 記錄交易
      await tx.stardustTransaction.create({
        data: {
          userId,
          amount: -amount,
          reason,
        },
      });

      return updatedUser;
    });

    log.info(`Deducted ${amount} stardust from user ${userId}: ${reason}`);
    return result;
  } catch (error) {
    log.error('Error in deductStardust:', error);
    if (error instanceof Error && error.message === '星塵不足') {
      throw new Error('星塵不足，無法完成此操作');
    }
    throw new DatabaseError('無法扣除星塵');
  }
}

/**
 * 增加記錄天數並檢查升級
 */
export async function incrementTotalRecords(userId: string): Promise<{
  user: User;
  leveledUp: boolean;
  newLevel?: number;
  reward?: number;
}> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 增加總記錄天數
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          totalRecords: { increment: 1 },
        },
      });

      // 檢查是否升級
      const currentLevel = LEVELS.find((l) => l.requiredDays <= user.totalRecords);
      const leveledUp = currentLevel && currentLevel.level > user.level;

      if (leveledUp) {
        // 升級
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            level: currentLevel.level,
            stardust: { increment: currentLevel.reward },
          },
        });

        // 記錄星塵獎勵
        await tx.stardustTransaction.create({
          data: {
            userId,
            amount: currentLevel.reward,
            reason: `升級到 Lv.${currentLevel.level} ${currentLevel.name}`,
          },
        });

        return {
          user: updatedUser,
          leveledUp: true,
          newLevel: currentLevel.level,
          reward: currentLevel.reward,
        };
      }

      return { user, leveledUp: false };
    });

    return result;
  } catch (error) {
    log.error('Error in incrementTotalRecords:', error);
    throw new DatabaseError('無法更新記錄天數');
  }
}

/**
 * 獲得徽章
 */
export async function earnBadge(userId: string, badgeCode: string): Promise<boolean> {
  try {
    // 查找徽章
    const badge = await prisma.badge.findUnique({
      where: { code: badgeCode },
    });

    if (!badge) {
      log.warn(`Badge not found: ${badgeCode}`);
      return false;
    }

    // 檢查是否已擁有
    const existing = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId: badge.id,
        },
      },
    });

    if (existing) {
      return false; // 已擁有
    }

    // 授予徽章
    await prisma.userBadge.create({
      data: {
        userId,
        badgeId: badge.id,
      },
    });

    log.info(`User ${userId} earned badge: ${badgeCode}`);
    return true;
  } catch (error) {
    log.error('Error in earnBadge:', error);
    throw new DatabaseError('無法授予徽章');
  }
}

/**
 * 取得使用者統計
 */
export async function getUserStats(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userBadges: {
          include: { badge: true },
        },
        emotions: {
          orderBy: { date: 'desc' },
          take: 100, // 最近 100 筆記錄
        },
      },
    });

    if (!user) {
      throw new Error('使用者不存在');
    }

    // 計算連續記錄天數
    const { currentStreak, longestStreak } = calculateStreaks(user.emotions);

    // 取得當前等級資訊
    const levelInfo = LEVELS.find((l) => l.level === user.level) || LEVELS[0];

    return {
      level: user.level,
      levelName: levelInfo.name,
      levelEmoji: levelInfo.emoji,
      stardust: user.stardust,
      totalRecords: user.totalRecords,
      badges: user.userBadges.length,
      currentStreak,
      longestStreak,
      nextLevel: LEVELS.find((l) => l.level === user.level + 1),
    };
  } catch (error) {
    log.error('Error in getUserStats:', error);
    throw new DatabaseError('無法取得統計資料');
  }
}

/**
 * 計算連續記錄天數
 */
function calculateStreaks(emotions: any[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (emotions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 檢查是否今天有記錄
  const latestDate = new Date(emotions[0].date);
  latestDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0 || diffDays === 1) {
    currentStreak = 1;

    // 計算連續天數
    for (let i = 0; i < emotions.length - 1; i++) {
      const date1 = new Date(emotions[i].date);
      const date2 = new Date(emotions[i + 1].date);
      date1.setHours(0, 0, 0, 0);
      date2.setHours(0, 0, 0, 0);

      const diff = Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));

      if (diff === 1) {
        currentStreak++;
        tempStreak++;
      } else {
        break;
      }
    }
  }

  // 計算最長連續天數
  tempStreak = 1;
  for (let i = 0; i < emotions.length - 1; i++) {
    const date1 = new Date(emotions[i].date);
    const date2 = new Date(emotions[i + 1].date);
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);

    const diff = Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return { currentStreak, longestStreak };
}

/**
 * 取得使用者徽章
 */
export async function getUserBadges(userId: string) {
  try {
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });

    return userBadges.map((ub) => ({
      ...ub.badge,
      earnedAt: ub.earnedAt,
    }));
  } catch (error) {
    log.error('Error in getUserBadges:', error);
    throw new DatabaseError('無法取得徽章資料');
  }
}
