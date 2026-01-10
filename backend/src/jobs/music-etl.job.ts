import * as cron from 'node-cron';
import { MusicETLService } from '../services/music-etl.service';
import { logger } from '../config/logger';

let etlService: MusicETLService;
let isRunning = false;

export function startETLScheduler(): void {
  etlService = new MusicETLService();

  const cronSchedule = process.env.ETL_CRON_SCHEDULE || '0 */6 * * *';

  logger.info(`Starting ETL scheduler with schedule: ${cronSchedule}`);

  cron.schedule(cronSchedule, async () => {
    if (isRunning) {
      logger.warn('ETL job already running, skipping...');
      return;
    }

    isRunning = true;
    try {
      await etlService.runETLJob();
    } catch (error) {
      logger.error('Scheduled ETL job failed', { error });
    } finally {
      isRunning = false;
    }
  });

  logger.info('ETL scheduler started');
}

export async function runETLJobManually(): Promise<void> {
  if (!etlService) {
    etlService = new MusicETLService();
  }

  if (isRunning) {
    throw new Error('ETL job is already running');
  }

  isRunning = true;
  try {
    await etlService.runETLJob();
  } finally {
    isRunning = false;
  }
}

