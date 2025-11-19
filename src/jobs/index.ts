/**
 * Jobs Index
 *
 * 啟動所有定時任務
 */

import { ExtendedClient } from '../types';
import { startLetterDeliveryJob } from './letter-delivery.job';
import { startDailyReminderJob } from './daily-reminder.job';
import { log } from '../utils/logger';

export function startAllJobs(client: ExtendedClient) {
  log.info('Starting all cron jobs...');

  startLetterDeliveryJob(client);
  startDailyReminderJob(client);

  log.info('✅ All cron jobs started');
}
