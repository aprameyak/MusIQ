import { MusicBrainzExtractService } from './musicbrainz-extract.service';
import { MusicBrainzTransformService } from './musicbrainz-transform.service';
import { MusicBrainzLoadService } from './musicbrainz-load.service';
import { MusicBrainzSyncService } from './musicbrainz-sync.service';
import { CoverArtEnrichmentService } from './cover-art-enrichment.service';
import { MusicBrainzConfig } from '../config/musicbrainz.config';
import { logger } from '../config/logger';

interface ETLOptions {
  albumsPerGenre?: number;
  genres?: string[];
  maxTotalAlbums?: number;
  maxTotalArtists?: number;
  maxTotalTracks?: number;
  skipArtists?: boolean;
  skipAlbums?: boolean;
  skipTracks?: boolean;
  enrichCoverArt?: boolean;
}

export class MusicBrainzETLService {
  private extractService: MusicBrainzExtractService;
  private transformService: MusicBrainzTransformService;
  private loadService: MusicBrainzLoadService;
  private syncService: MusicBrainzSyncService;
  private coverArtService: CoverArtEnrichmentService;

  constructor() {
    this.extractService = new MusicBrainzExtractService();
    this.transformService = new MusicBrainzTransformService();
    this.loadService = new MusicBrainzLoadService();
    this.syncService = new MusicBrainzSyncService();
    this.coverArtService = new CoverArtEnrichmentService();
  }

  async runETL(options: ETLOptions = {}): Promise<void> {
    const startTime = Date.now();
    logger.info('Starting MusicBrainz ETL pipeline...');

    try {
      const allGenres = [
        ...MusicBrainzConfig.majorGenres,
        ...MusicBrainzConfig.nicheGenres
      ];
      
      const top5Genres = ['hip-hop', 'pop', 'rock', 'electronic', 'jazz'];
      const genresToProcess = options.genres || top5Genres;
      const maxTotalAlbums = options.maxTotalAlbums || 2000;
      const maxTotalArtists = options.maxTotalArtists || 2000;
      const maxTotalTracks = options.maxTotalTracks || 2000;
      const albumsPerGenre = options.albumsPerGenre || Math.ceil(maxTotalAlbums / genresToProcess.length);

      logger.info(`Processing ${genresToProcess.length} genres with ${albumsPerGenre} albums per genre (max: ${maxTotalAlbums} albums, ${maxTotalArtists} artists, ${maxTotalTracks} tracks)`);

      let allAlbums: any[] = [];
      
      if (!options.skipAlbums) {
        logger.info('=== EXTRACT PHASE: Albums ===');
        allAlbums = await this.extractService.extractAllGenres(genresToProcess, albumsPerGenre, maxTotalAlbums);
        logger.info(`Extracted ${allAlbums.length} total albums`);
      }

      if (allAlbums.length === 0 && !options.skipAlbums) {
        logger.warn('No albums extracted. Exiting ETL.');
        return;
      }

      logger.info('=== TRANSFORM PHASE ===');
      const { artists: allArtists, albumArtists: allAlbumArtists } = this.transformService.transformArtists(allAlbums);
      const albums = this.transformService.transformAlbums(allAlbums);

      const artists = allArtists.slice(0, maxTotalArtists);
      const albumArtists = allAlbumArtists.filter(rel => artists.some(a => a.mbid === rel.artist_mbid));

      logger.info(`Transformed: ${artists.length}/${allArtists.length} artists (limited to ${maxTotalArtists}), ${albums.length} albums`);

      if (options.enrichCoverArt) {
        logger.info('=== ENRICHMENT PHASE: Cover Art ===');
        const albumMbids = albums.map(a => a.mbid);
        const coverArtMap = await this.coverArtService.enrichAlbumsWithCoverArt(albumMbids);
        
        for (const album of albums) {
          if (coverArtMap.has(album.mbid)) {
            album.cover_art_url = coverArtMap.get(album.mbid) || null;
          }
        }
        
        logger.info(`Enriched ${coverArtMap.size} albums with cover art`);
      }

      logger.info('=== LOAD PHASE ===');
      
      if (!options.skipArtists) {
        const artistsLoaded = await this.loadService.loadArtists(artists);
        logger.info(`Loaded ${artistsLoaded} artists`);
      }

      if (!options.skipAlbums) {
        const albumsLoaded = await this.loadService.loadAlbums(albums);
        logger.info(`Loaded ${albumsLoaded} albums`);
        
        if (!options.skipArtists) {
          const relationsLoaded = await this.loadService.loadAlbumArtists(albumArtists);
          logger.info(`Loaded ${relationsLoaded} album-artist relations`);
        }
      }

      if (!options.skipTracks) {
        logger.info('=== EXTRACT & TRANSFORM PHASE: Tracks ===');
        const allTracks: any[] = [];
        const allAlbumTracks: any[] = [];

        for (let i = 0; i < albums.length; i++) {
          if (allTracks.length >= maxTotalTracks) {
            logger.info(`Reached max tracks limit (${maxTotalTracks}). Stopping track extraction.`);
            break;
          }
          
          const album = albums[i];
          logger.info(`Extracting tracks for album ${i + 1}/${albums.length}: ${album.title}`);
          
          const recordings = await this.extractService.extractRecordingsForReleaseGroup(album.mbid);
          
          if (recordings.length > 0) {
            const remainingSlots = maxTotalTracks - allTracks.length;
            const recordingsToProcess = recordings.slice(0, remainingSlots);
            
            const positions = recordingsToProcess.map((_, idx) => idx + 1);
            const { tracks, albumTracks } = this.transformService.transformTracks(
              recordingsToProcess,
              album.mbid,
              positions
            );
            
            allTracks.push(...tracks);
            allAlbumTracks.push(...albumTracks);
          }

          if (allTracks.length >= maxTotalTracks) {
            logger.info(`Reached max tracks limit (${maxTotalTracks}). Stopping track extraction.`);
            break;
          }

          if ((i + 1) % 10 === 0) {
            logger.info(`Processed ${i + 1}/${albums.length} albums for tracks. Total tracks: ${allTracks.length}`);
          }
        }

        const finalTracks = allTracks.slice(0, maxTotalTracks);
        const finalAlbumTracks = allAlbumTracks.slice(0, maxTotalTracks);
        
        logger.info(`Transformed ${finalTracks.length}/${allTracks.length} tracks (limited to ${maxTotalTracks})`);
        
        const tracksLoaded = await this.loadService.loadTracks(finalTracks);
        logger.info(`Loaded ${tracksLoaded} tracks`);
        
        const albumTracksLoaded = await this.loadService.loadAlbumTracks(finalAlbumTracks);
        logger.info(`Loaded ${albumTracksLoaded} album-track relations`);
      }

      logger.info('=== SYNC PHASE: music_items ===');
      const syncResults = await this.syncService.syncAll();
      logger.info(`Sync completed: ${syncResults.albums} albums, ${syncResults.tracks} tracks, ${syncResults.artists} artists synced to music_items`);

      const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
      logger.info(`ETL pipeline completed successfully in ${duration} minutes`);
      
    } catch (error: any) {
      logger.error('ETL pipeline failed', { error: error.message, stack: error.stack });
      throw error;
    }
  }
}

