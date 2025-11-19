/**
 * Letter Delivery Job - 信件送達定時任務
 */

import cron from 'node-cron';
import { getPendingLetters } from '../services/letter.service';
import { sendLetterDeliveryNotification } from '../services/email.service';
import { log } from '../utils/logger';
import { ExtendedClient } from '../types';

export function startLetterDeliveryJob(client: ExtendedClient) {
  // 每小時檢查一次待送達信件
  cron.schedule('0 * * * *', async () => {
    try {
      const letters = await getPendingLetters();
      log.info(`Checking ${letters.length} pending letters for delivery`);

      for (const letter of letters) {
        try {
          const user = await client.users.fetch(letter.user.discordId);

          // 發送 Discord DM
          await user.send({
            content: `📬 你有一封來自 ${Math.floor((Date.now() - letter.sendDate.getTime()) / (1000 * 60 * 60 * 24))} 天前的信！\n\n使用 \`/open-letter ${letter.id}\` 開啟信件`,
          });

          // 發送 Email（如果有設定）
          if (letter.user.email) {
            await sendLetterDeliveryNotification(
              letter.user.email,
              letter.content,
              letter.sendDate
            );
          }

          log.info(`Letter ${letter.id} delivered to user ${letter.userId}`);
        } catch (error) {
          log.error(`Failed to deliver letter ${letter.id}:`, error);
        }
      }
    } catch (error) {
      log.error('Letter delivery job error:', error);
    }
  });

  log.info('✅ Letter delivery job started (hourly)');
}
