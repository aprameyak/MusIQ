import dotenv from 'dotenv';
import { runETLJobManually } from '../jobs/music-etl.job';
import { logger } from '../config/logger';

dotenv.config();

async function main() {
  try {
    logger.info('Running ETL job manually...');
    await runETLJobManually();
    logger.info('ETL job completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('ETL job failed', { error });
    process.exit(1);
  }
}

main();

