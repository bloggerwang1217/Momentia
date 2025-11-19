/**
 * Challenge Service - 挑戰服務
 */

import { prisma } from '../config/prisma';
import { Challenge, UserChallenge } from '@prisma/client';
import { addStardust, earnBadge } from './user.service';
import { log } from '../utils/logger';
import { addDays } from 'date-fns';

export interface ChallengeWithProgress extends Challenge {
  userChallenge?: UserChallenge | null;
}

/**
 * 獲取所有活躍的挑戰
 */
export async function getActiveChallenges(): Promise<Challenge[]> {
  return prisma.challenge.findMany({
    where: { isActive: true },
    orderBy: { difficulty: 'asc' },
  });
}

/**
 * 獲取使用者的當前挑戰（包含進度）
 */
export async function getUserChallenges(
  userId: string,
  includeCompleted: boolean = false
): Promise<ChallengeWithProgress[]> {
  const userChallenges = await prisma.userChallenge.findMany({
    where: {
      userId,
      ...(includeCompleted ? {} : { completed: false }),
    },
    include: {
      challenge: true,
    },
    orderBy: { assignedAt: 'desc' },
  });

  return userChallenges.map((uc) => ({
    ...uc.challenge,
    userChallenge: uc,
  }));
}

/**
 * 獲取使用者已完成的挑戰
 */
export async function getUserCompletedChallenges(userId: string): Promise<UserChallenge[]> {
  return prisma.userChallenge.findMany({
    where: {
      userId,
      completed: true,
    },
    include: {
      challenge: true,
    },
    orderBy: { completedAt: 'desc' },
  });
}

/**
 * 為使用者分配隨機挑戰
 */
export async function assignRandomChallenge(userId: string): Promise<UserChallenge> {
  try {
    // 獲取使用者當前活躍的挑戰
    const activeChallenges = await prisma.userChallenge.findMany({
      where: {
        userId,
        completed: false,
      },
    });

    // 最多同時 3 個活躍挑戰
    if (activeChallenges.length >= 3) {
      throw new Error('User already has 3 active challenges');
    }

    // 獲取使用者已經有的挑戰 ID
    const existingChallengeIds = activeChallenges.map((uc) => uc.challengeId);

    // 獲取可用的挑戰（排除已有的）
    const availableChallenges = await prisma.challenge.findMany({
      where: {
        isActive: true,
        id: {
          notIn: existingChallengeIds,
        },
      },
    });

    if (availableChallenges.length === 0) {
      throw new Error('No available challenges');
    }

    // 隨機選擇一個挑戰
    const randomIndex = Math.floor(Math.random() * availableChallenges.length);
    const selectedChallenge = availableChallenges[randomIndex];

    // 分配挑戰（7 天內完成）
    const userChallenge = await prisma.userChallenge.create({
      data: {
        userId,
        challengeId: selectedChallenge.id,
        dueDate: addDays(new Date(), 7),
      },
      include: {
        challenge: true,
      },
    });

    log.info(`Challenge ${selectedChallenge.id} assigned to user ${userId}`);
    return userChallenge;
  } catch (error) {
    log.error('Error assigning challenge:', error);
    throw error;
  }
}

/**
 * 完成挑戰
 */
export async function completeChallenge(
  userChallengeId: string,
  proof: string
): Promise<UserChallenge> {
  try {
    const userChallenge = await prisma.userChallenge.findUnique({
      where: { id: userChallengeId },
      include: { challenge: true, user: true },
    });

    if (!userChallenge) {
      throw new Error('User challenge not found');
    }

    if (userChallenge.completed) {
      throw new Error('Challenge already completed');
    }

    // 檢查是否過期
    const now = new Date();
    const isExpired = now > userChallenge.dueDate;

    // 更新挑戰狀態
    const updated = await prisma.userChallenge.update({
      where: { id: userChallengeId },
      data: {
        completed: true,
        completedAt: now,
        proof,
        rewardClaimed: true,
      },
      include: {
        challenge: true,
      },
    });

    // 發放獎勵
    const reward = userChallenge.challenge.reward as {
      type: 'stardust' | 'badge';
      value: number | string;
    };

    if (reward.type === 'stardust' && typeof reward.value === 'number') {
      // 過期完成獎勵減半
      const stardustAmount = isExpired ? Math.floor(reward.value / 2) : reward.value;
      await addStardust(
        userChallenge.userId,
        stardustAmount,
        `Challenge completed: ${userChallenge.challenge.title}${isExpired ? ' (late)' : ''}`
      );
    } else if (reward.type === 'badge' && typeof reward.value === 'string') {
      await earnBadge(userChallenge.userId, reward.value);
    }

    // 檢查挑戰相關徽章
    const completedCount = await prisma.userChallenge.count({
      where: {
        userId: userChallenge.userId,
        completed: true,
      },
    });

    if (completedCount >= 1) {
      await earnBadge(userChallenge.userId, 'CHALLENGER');
    }
    if (completedCount >= 10) {
      await earnBadge(userChallenge.userId, 'CHALLENGE_MASTER');
    }

    log.info(`Challenge ${userChallengeId} completed by user ${userChallenge.userId}`);
    return updated;
  } catch (error) {
    log.error('Error completing challenge:', error);
    throw error;
  }
}

/**
 * 獲取使用者的挑戰統計
 */
export async function getUserChallengeStats(userId: string): Promise<{
  total: number;
  completed: number;
  active: number;
  expired: number;
  completionRate: number;
}> {
  const [total, completed, active] = await Promise.all([
    prisma.userChallenge.count({
      where: { userId },
    }),
    prisma.userChallenge.count({
      where: { userId, completed: true },
    }),
    prisma.userChallenge.count({
      where: { userId, completed: false },
    }),
  ]);

  const expiredChallenges = await prisma.userChallenge.findMany({
    where: {
      userId,
      completed: false,
      dueDate: {
        lt: new Date(),
      },
    },
  });

  const expired = expiredChallenges.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    active: active - expired,
    expired,
    completionRate,
  };
}

/**
 * 獲取特定挑戰
 */
export async function getChallenge(challengeId: string): Promise<Challenge | null> {
  return prisma.challenge.findUnique({
    where: { id: challengeId },
  });
}

/**
 * 獲取使用者特定的挑戰記錄
 */
export async function getUserChallenge(userChallengeId: string): Promise<UserChallenge | null> {
  return prisma.userChallenge.findUnique({
    where: { id: userChallengeId },
    include: {
      challenge: true,
    },
  });
}
