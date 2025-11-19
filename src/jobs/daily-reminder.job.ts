/**
 * Daily Reminder Job - 每日提醒定時任務
 */

import cron from 'node-cron';
import { prisma } from '../config/prisma';
import { shouldSendReminder, getCurrentUserTime } from '../utils/date-utils';
import { log } from '../utils/logger';
import { ExtendedClient } from '../types';

export function startDailyReminderJob(client: ExtendedClient) {
  // 每小時檢查一次（檢查是否有使用者需要提醒）
  cron.schedule('0 * * * *', async () => {
    try {
      const users = await prisma.user.findMany({
        where: {
          reminderTime: { not: null },
          settings: {
            dailyReminder: true,
          },
        },
        include: {
          emotions: {
            orderBy: { date: 'desc' },
            take: 1,
          },
        },
      });

      for (const user of users) {
        try {
          if (!user.reminderTime) continue;

          const lastEmotion = user.emotions[0];
          const lastReminderDate = lastEmotion?.date;

          if (shouldSendReminder(user.reminderTime, user.timezone, lastReminderDate)) {
            const discordUser = await client.users.fetch(user.discordId);

            await discordUser.send({
              content:
                '🌟 Mementia 每日提醒\n\n' +
                '嗨！今天過得如何？😊\n\n' +
                '記得記錄今天的心情，\n' +
                '讓這一天成為你宇宙中獨特的星球 ✨\n\n' +
                '使用 `/paint` 開始記錄',
            });

            log.info(`Daily reminder sent to user ${user.id}`);
          }
        } catch (error) {
          log.error(`Failed to send reminder to user ${user.id}:`, error);
        }
      }
    } catch (error) {
      log.error('Daily reminder job error:', error);
    }
  });

  log.info('✅ Daily reminder job started (hourly check)');
}
