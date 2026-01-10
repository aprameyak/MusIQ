import dotenv from 'dotenv';
import { MusicBrainzETLService } from '../services/musicbrainz-etl.service';
import { logger } from '../config/logger';
import { testConnection } from '../database/connection';

dotenv.config();

interface CLIOptions {
  'albums-per-genre'?: number;
  'genres'?: string;
  'skip-artists'?: boolean;
  'skip-albums'?: boolean;
  'skip-tracks'?: boolean;
  'enrich-cover-art'?: boolean;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--albums-per-genre' && args[i + 1]) {
      options['albums-per-genre'] = parseInt(args[i + 1]);
      i++;
    } else if (arg === '--genres' && args[i + 1]) {
      options.genres = args[i + 1];
      i++;
    } else if (arg === '--skip-artists') {
      options['skip-artists'] = true;
    } else if (arg === '--skip-albums') {
      options['skip-albums'] = true;
    } else if (arg === '--skip-tracks') {
      options['skip-tracks'] = true;
    } else if (arg === '--enrich-cover-art') {
      options['enrich-cover-art'] = true;
    }
  }

  return options;
}

async function main() {
  try {
    logger.info('=== MusIQ MusicBrainz ETL Pipeline ===');
    
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('Database connection failed. Check DATABASE_URL in .env');
      process.exit(1);
    }
    
    logger.info('Database connection established');

    const cliOptions = parseArgs();
    
    const etlOptions = {
      albumsPerGenre: cliOptions['albums-per-genre'],
      genres: cliOptions.genres?.split(',').map(g => g.trim()),
      skipArtists: cliOptions['skip-artists'],
      skipAlbums: cliOptions['skip-albums'],
      skipTracks: cliOptions['skip-tracks'],
      enrichCoverArt: cliOptions['enrich-cover-art']
    };

    const etlService = new MusicBrainzETLService();
    await etlService.runETL(etlOptions);
    
    logger.info('ETL completed successfully');
    process.exit(0);
  } catch (error: any) {
    logger.error('ETL failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

main();

