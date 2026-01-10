import { MusicBrainzExtractService } from './musicbrainz-extract.service';
import { MusicBrainzTransformService } from './musicbrainz-transform.service';
import { MusicBrainzLoadService } from './musicbrainz-load.service';
import { CoverArtEnrichmentService } from './cover-art-enrichment.service';
import { MusicBrainzConfig } from '../config/musicbrainz.config';
import { logger } from '../config/logger';

interface ETLOptions {
  albumsPerGenre?: number;
  genres?: string[];
  skipArtists?: boolean;
  skipAlbums?: boolean;
  skipTracks?: boolean;
  enrichCoverArt?: boolean;
}

export class MusicBrainzETLService {
  private extractService: MusicBrainzExtractService;
  private transformService: MusicBrainzTransformService;
  private loadService: MusicBrainzLoadService;
  private coverArtService: CoverArtEnrichmentService;

  constructor() {
    this.extractService = new MusicBrainzExtractService();
    this.transformService = new MusicBrainzTransformService();
    this.loadService = new MusicBrainzLoadService();
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
      
      const genresToProcess = options.genres || allGenres;
      const albumsPerGenre = options.albumsPerGenre || 
        (genresToProcess.some(g => MusicBrainzConfig.majorGenres.includes(g)) 
          ? MusicBrainzConfig.albumsPerMajorGenre 
          : MusicBrainzConfig.albumsPerNicheGenre);

      logger.info(`Processing ${genresToProcess.length} genres with ${albumsPerGenre} albums per genre`);

      let allAlbums: any[] = [];
      
      if (!options.skipAlbums) {
        logger.info('=== EXTRACT PHASE: Albums ===');
        allAlbums = await this.extractService.extractAllGenres(genresToProcess, albumsPerGenre);
        logger.info(`Extracted ${allAlbums.length} total albums`);
      }

      if (allAlbums.length === 0 && !options.skipAlbums) {
        logger.warn('No albums extracted. Exiting ETL.');
        return;
      }

      logger.info('=== TRANSFORM PHASE ===');
      const { artists, albumArtists } = this.transformService.transformArtists(allAlbums);
      const albums = this.transformService.transformAlbums(allAlbums);

      logger.info(`Transformed: ${artists.length} artists, ${albums.length} albums`);

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
          const album = albums[i];
          logger.info(`Extracting tracks for album ${i + 1}/${albums.length}: ${album.title}`);
          
          const recordings = await this.extractService.extractRecordingsForReleaseGroup(album.mbid);
          
          if (recordings.length > 0) {
            const positions = recordings.map((_, idx) => idx + 1);
            const { tracks, albumTracks } = this.transformService.transformTracks(
              recordings,
              album.mbid,
              positions
            );
            
            allTracks.push(...tracks);
            allAlbumTracks.push(...albumTracks);
          }

          if ((i + 1) % 10 === 0) {
            logger.info(`Processed ${i + 1}/${albums.length} albums for tracks`);
          }
        }

        logger.info(`Transformed ${allTracks.length} tracks`);
        
        const tracksLoaded = await this.loadService.loadTracks(allTracks);
        logger.info(`Loaded ${tracksLoaded} tracks`);
        
        const albumTracksLoaded = await this.loadService.loadAlbumTracks(allAlbumTracks);
        logger.info(`Loaded ${albumTracksLoaded} album-track relations`);
      }

      const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
      logger.info(`ETL pipeline completed successfully in ${duration} minutes`);
      
    } catch (error: any) {
      logger.error('ETL pipeline failed', { error: error.message, stack: error.stack });
      throw error;
    }
  }
}

