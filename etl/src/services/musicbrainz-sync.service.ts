import { Pool } from 'pg';
import { getDatabasePool } from '../database/connection';
import { logger } from '../config/logger';

export class MusicBrainzSyncService {
  private readonly pool: Pool;

  constructor() {
    this.pool = getDatabasePool();
  }

  async syncAlbumsToMusicItems(): Promise<number> {
    logger.info('Syncing albums from mb_albums to music_items...');

    const query = `
      INSERT INTO music_items (type, title, artist, image_url, mbid, metadata)
      SELECT 
        'album' as type,
        ma.title,
        COALESCE(
          STRING_AGG(DISTINCT mba.name, ', ' ORDER BY mba.name),
          'Unknown Artist'
        ) as artist,
        ma.cover_art_url as image_url,
        ma.mbid,
        jsonb_build_object(
          'release_date', ma.release_date,
          'primary_type', ma.primary_type,
          'secondary_types', ma.secondary_types,
          'status', ma.status
        ) as metadata
      FROM mb_albums ma
      LEFT JOIN mb_album_artists maa ON ma.mbid = maa.album_mbid
      LEFT JOIN mb_artists mba ON maa.artist_mbid = mba.mbid
      WHERE ma.mbid IS NOT NULL
      GROUP BY ma.mbid, ma.title, ma.cover_art_url, ma.release_date, ma.primary_type, ma.secondary_types, ma.status
      ON CONFLICT (mbid) 
      DO UPDATE SET
        title = EXCLUDED.title,
        artist = EXCLUDED.artist,
        image_url = EXCLUDED.image_url,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
    `;

    try {
      const result = await this.pool.query(query);
      const count = result.rowCount || 0;
      logger.info(`Synced ${count} albums to music_items`);
      return count;
    } catch (error: any) {
      logger.error('Error syncing albums', { error: error.message });
      throw error;
    }
  }

  async syncTracksToMusicItems(): Promise<number> {
    logger.info('Syncing tracks from mb_tracks to music_items...');

    const query = `
      INSERT INTO music_items (type, title, artist, image_url, mbid, metadata)
      SELECT 
        'song' as type,
        mt.title,
        COALESCE(
          STRING_AGG(DISTINCT mba.name, ', ' ORDER BY mba.name),
          'Unknown Artist'
        ) as artist,
        ma.cover_art_url as image_url,
        mt.mbid,
        jsonb_build_object(
          'album_title', ma.title,
          'album_mbid', ma.mbid,
          'length', mt.length,
          'position', mat.position,
          'disc_number', mat.disc_number
        ) as metadata
      FROM mb_tracks mt
      INNER JOIN mb_album_tracks mat ON mt.mbid = mat.track_mbid
      INNER JOIN mb_albums ma ON mat.album_mbid = ma.mbid
      LEFT JOIN mb_album_artists maa ON ma.mbid = maa.album_mbid
      LEFT JOIN mb_artists mba ON maa.artist_mbid = mba.mbid
      WHERE mt.mbid IS NOT NULL
      GROUP BY mt.mbid, mt.title, mt.length, ma.cover_art_url, ma.title, ma.mbid, mat.position, mat.disc_number
      ON CONFLICT (mbid) 
      DO UPDATE SET
        title = EXCLUDED.title,
        artist = EXCLUDED.artist,
        image_url = EXCLUDED.image_url,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
    `;

    try {
      const result = await this.pool.query(query);
      const count = result.rowCount || 0;
      logger.info(`Synced ${count} tracks to music_items`);
      return count;
    } catch (error: any) {
      logger.error('Error syncing tracks', { error: error.message });
      throw error;
    }
  }

  async syncArtistsToMusicItems(): Promise<number> {
    logger.info('Syncing artists from mb_artists to music_items...');

    const query = `
      INSERT INTO music_items (type, title, artist, image_url, mbid, metadata)
      SELECT 
        'artist' as type,
        mba.name as title,
        mba.name as artist,
        NULL as image_url,
        mba.mbid,
        jsonb_build_object(
          'sort_name', mba.sort_name,
          'type', mba.type,
          'area', mba.area,
          'disambiguation', mba.disambiguation
        ) as metadata
      FROM mb_artists mba
      WHERE mba.mbid IS NOT NULL
        AND mba.mbid NOT IN (
          SELECT mbid FROM music_items WHERE mbid IS NOT NULL AND type = 'artist'
        )
      ON CONFLICT (mbid) 
      DO UPDATE SET
        title = EXCLUDED.title,
        artist = EXCLUDED.artist,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
    `;

    try {
      const result = await this.pool.query(query);
      const count = result.rowCount || 0;
      logger.info(`Synced ${count} artists to music_items`);
      return count;
    } catch (error: any) {
      logger.error('Error syncing artists', { error: error.message });
      throw error;
    }
  }

  async syncAll(): Promise<{ albums: number; tracks: number; artists: number }> {
    logger.info('Starting sync of all MusicBrainz data to music_items...');
    
    const albums = await this.syncAlbumsToMusicItems();
    const tracks = await this.syncTracksToMusicItems();
    const artists = await this.syncArtistsToMusicItems();

    const total = albums + tracks + artists;
    logger.info(`Sync completed: ${albums} albums, ${tracks} tracks, ${artists} artists (${total} total)`);

    return { albums, tracks, artists };
  }
}
