/**
 * Review Generation Job - 定期回顧生成定時任務
 *
 * 每天檢查並生成週/月/季/年回顧報告
 */

import cron from 'node-cron';
import { prisma } from '../config/prisma';
import { checkAndGenerateReviews } from '../services/review.service';
import { log } from '../utils/logger';
import { ExtendedClient } from '../types';

export function startReviewGenerationJob(client: ExtendedClient) {
  // 每天凌晨 2 點執行檢查
  cron.schedule('0 2 * * *', async () => {
    try {
      log.info('Starting review generation job...');

      // 獲取所有啟用提醒的使用者
      const users = await prisma.user.findMany({
        where: {
          settings: {
            dailyReminder: true, // 只為有啟用提醒的用戶生成
          },
        },
        select: {
          id: true,
          discordId: true,
        },
      });

      log.info(`Checking ${users.length} users for review generation`);

      let generatedCount = 0;

      for (const user of users) {
        try {
          const reviews = await checkAndGenerateReviews(user.id);

          if (reviews.length > 0) {
            // 通知使用者有新的回顧報告
            try {
              const discordUser = await client.users.fetch(user.discordId);

              for (const review of reviews) {
                const typeLabel = {
                  WEEKLY: '週回顧',
                  MONTHLY: '月回顧',
                  QUARTERLY: '季回顧',
                  YEARLY: '年回顧',
                }[review.type];

                await discordUser.send({
                  content:
                    `🌟 **你的${typeLabel}已生成！**\n\n` +
                    `${review.summary}\n\n` +
                    `使用 \`/review type:${review.type}\` 查看完整報告 ✨`,
                });
              }

              generatedCount += reviews.length;
              log.info(`Generated ${reviews.length} reviews for user ${user.id}`);
            } catch (error) {
              log.error(`Failed to notify user ${user.id}:`, error);
            }
          }
        } catch (error) {
          log.error(`Failed to generate reviews for user ${user.id}:`, error);
        }
      }

      log.info(`Review generation job complete. Generated ${generatedCount} reviews.`);
    } catch (error) {
      log.error('Review generation job error:', error);
    }
  });

  log.info('✅ Review generation job started (daily at 2 AM)');
}
