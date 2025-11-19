/**
 * Letter Service
 *
 * 管理給未來的信
 */

import { FutureLetter } from '@prisma/client';
import { prisma } from '../config/prisma';
import { log } from '../utils/logger';
import { DatabaseError } from '../types';
import { addStardust } from './user.service';
import { STARDUST_REWARDS } from '../utils/constants';

/**
 * 創建未來信件
 */
export async function createLetter(
  userId: string,
  content: string,
  deliverDate: Date
): Promise<FutureLetter> {
  try {
    const letter = await prisma.futureLetter.create({
      data: {
        userId,
        content,
        sendDate: new Date(),
        deliverDate,
      },
    });

    // 獎勵星塵
    await addStardust(userId, STARDUST_REWARDS.WRITE_LETTER, '寫下未來信件');

    log.info(`Created letter ${letter.id} for user ${userId}, deliver on ${deliverDate}`);

    return letter;
  } catch (error) {
    log.error('Error creating letter:', error);
    throw new DatabaseError('無法創建信件');
  }
}

/**
 * 取得使用者所有信件
 */
export async function getUserLetters(
  userId: string
): Promise<{
  pending: FutureLetter[];
  delivered: FutureLetter[];
}> {
  try {
    const now = new Date();

    const [pending, delivered] = await Promise.all([
      prisma.futureLetter.findMany({
        where: {
          userId,
          deliverDate: { gt: now },
        },
        orderBy: { deliverDate: 'asc' },
      }),
      prisma.futureLetter.findMany({
        where: {
          userId,
          deliverDate: { lte: now },
        },
        orderBy: { deliverDate: 'desc' },
      }),
    ]);

    return { pending, delivered };
  } catch (error) {
    log.error('Error getting user letters:', error);
    throw new DatabaseError('無法取得信件');
  }
}

/**
 * 取得單一信件
 */
export async function getLetter(letterId: string): Promise<FutureLetter | null> {
  try {
    return await prisma.futureLetter.findUnique({
      where: { id: letterId },
    });
  } catch (error) {
    log.error('Error getting letter:', error);
    throw new DatabaseError('無法取得信件');
  }
}

/**
 * 開啟信件
 */
export async function openLetter(letterId: string): Promise<FutureLetter> {
  try {
    const letter = await prisma.futureLetter.update({
      where: { id: letterId },
      data: {
        opened: true,
        openedAt: new Date(),
      },
    });

    log.info(`Letter ${letterId} opened`);

    return letter;
  } catch (error) {
    log.error('Error opening letter:', error);
    throw new DatabaseError('無法開啟信件');
  }
}

/**
 * 取得待送達的信件（用於定時任務）
 */
export async function getPendingLetters(): Promise<FutureLetter[]> {
  try {
    const now = new Date();

    return await prisma.futureLetter.findMany({
      where: {
        deliverDate: { lte: now },
        opened: false,
      },
      include: {
        user: true,
      },
    });
  } catch (error) {
    log.error('Error getting pending letters:', error);
    throw new DatabaseError('無法取得待送達信件');
  }
}

/**
 * 刪除信件
 */
export async function deleteLetter(letterId: string, userId: string): Promise<boolean> {
  try {
    const letter = await prisma.futureLetter.findUnique({
      where: { id: letterId },
    });

    if (!letter || letter.userId !== userId) {
      return false;
    }

    await prisma.futureLetter.delete({
      where: { id: letterId },
    });

    log.info(`Letter ${letterId} deleted by user ${userId}`);

    return true;
  } catch (error) {
    log.error('Error deleting letter:', error);
    throw new DatabaseError('無法刪除信件');
  }
}
