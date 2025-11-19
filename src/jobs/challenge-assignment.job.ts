/**
 * Challenge Assignment Job - 挑戰分配定時任務
 *
 * 每週一自動為使用者分配新的挑戰
 */

import cron from 'node-cron';
import { prisma } from '../config/prisma';
import { assignRandomChallenge } from '../services/challenge.service';
import { log } from '../utils/logger';
import { ExtendedClient } from '../types';

export function startChallengeAssignmentJob(client: ExtendedClient) {
  // 每週一早上 9 點執行
  cron.schedule('0 9 * * 1', async () => {
    try {
      log.info('Starting weekly challenge assignment...');

      // 獲取所有有活躍記錄的使用者（過去 30 天有記錄情緒的）
      const activeUsers = await prisma.user.findMany({
        where: {
          emotions: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
        include: {
          userChallenges: {
            where: {
              completed: false,
            },
          },
        },
      });

      log.info(`Found ${activeUsers.length} active users for challenge assignment`);

      let assignedCount = 0;

      for (const user of activeUsers) {
        try {
          // 如果使用者當前挑戰少於 2 個，分配新挑戰
          if (user.userChallenges.length < 2) {
            const userChallenge = await assignRandomChallenge(user.id);
            const challenge = userChallenge.challenge as any;

            // 通知使用者
            try {
              const discordUser = await client.users.fetch(user.discordId);

              const difficultyStars = '⭐'.repeat(challenge.difficulty);
              const reward = challenge.reward as { type: string; value: number | string };
              const rewardText = reward.type === 'stardust'
                ? `${reward.value} 星塵`
                : `徽章：${reward.value}`;

              await discordUser.send({
                content:
                  `👾 **新的幸福挑戰來襲！**\n\n` +
                  `${difficultyStars} **${challenge.title}**\n\n` +
                  `📝 ${challenge.description}\n\n` +
                  `🏆 完成獎勵：${rewardText}\n` +
                  `⏰ 截止日期：${userChallenge.dueDate.toLocaleDateString('zh-TW')}\n\n` +
                  `使用 \`/challenges\` 查看詳情，\`/complete-challenge ${userChallenge.id.substring(0, 8)}\` 完成挑戰！`,
              });

              assignedCount++;
              log.info(`Challenge ${userChallenge.id} assigned to user ${user.id}`);
            } catch (error) {
              log.error(`Failed to notify user ${user.id}:`, error);
            }
          }
        } catch (error) {
          log.error(`Failed to assign challenge to user ${user.id}:`, error);
        }
      }

      log.info(`Challenge assignment complete. Assigned ${assignedCount} challenges.`);
    } catch (error) {
      log.error('Challenge assignment job error:', error);
    }
  });

  log.info('✅ Challenge assignment job started (weekly on Monday 9 AM)');
}
