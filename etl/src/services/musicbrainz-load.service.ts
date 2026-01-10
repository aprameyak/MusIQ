import { Pool } from 'pg';
import { getDatabasePool } from '../database/connection';
import { MusicBrainzConfig } from '../config/musicbrainz.config';
import { logger } from '../config/logger';
import {
  TransformedArtist,
  TransformedAlbum,
  TransformedTrack,
  AlbumArtistRelation,
  AlbumTrackRelation
} from './musicbrainz-transform.service';

export class MusicBrainzLoadService {
  private pool: Pool;

  constructor() {
    this.pool = getDatabasePool();
  }

  async loadArtists(artists: TransformedArtist[]): Promise<number> {
    if (artists.length === 0) return 0;

    let inserted = 0;
    const batchSize = MusicBrainzConfig.batchSize;

    for (let i = 0; i < artists.length; i += batchSize) {
      const batch = artists.slice(i, i + batchSize);
      
      const values = batch.map((_, idx) => {
        const baseIdx = idx * 6;
        return `($${baseIdx + 1}, $${baseIdx + 2}, $${baseIdx + 3}, $${baseIdx + 4}, $${baseIdx + 5}, $${baseIdx + 6})`;
      }).join(', ');

      const params: any[] = [];
      batch.forEach(artist => {
        params.push(
          artist.mbid,
          artist.name,
          artist.sort_name,
          artist.type,
          artist.area,
          artist.disambiguation
        );
      });

      const query = `
        INSERT INTO mb_artists (mbid, name, sort_name, type, area, disambiguation, created_at, updated_at)
        VALUES ${values}
        ON CONFLICT (mbid) DO UPDATE SET
          name = EXCLUDED.name,
          sort_name = EXCLUDED.sort_name,
          type = EXCLUDED.type,
          area = EXCLUDED.area,
          disambiguation = EXCLUDED.disambiguation,
          updated_at = NOW()
      `;

      try {
        await this.pool.query(query, params);
        inserted += batch.length;
        logger.info(`Loaded ${inserted}/${artists.length} artists`);
      } catch (error: any) {
        logger.error('Error loading artists batch', { error: error.message, batchStart: i });
        throw error;
      }
    }

    return inserted;
  }

  async loadAlbums(albums: TransformedAlbum[]): Promise<number> {
    if (albums.length === 0) return 0;

    let inserted = 0;
    const batchSize = MusicBrainzConfig.batchSize;

    for (let i = 0; i < albums.length; i += batchSize) {
      const batch = albums.slice(i, i + batchSize);
      
      const values = batch.map((_, idx) => {
        const baseIdx = idx * 7;
        return `($${baseIdx + 1}, $${baseIdx + 2}, $${baseIdx + 3}, $${baseIdx + 4}, $${baseIdx + 5}, $${baseIdx + 6}, $${baseIdx + 7})`;
      }).join(', ');

      const params: any[] = [];
      batch.forEach(album => {
        params.push(
          album.mbid,
          album.title,
          album.release_date,
          album.status,
          album.primary_type,
          album.secondary_types,
          album.cover_art_url
        );
      });

      const query = `
        INSERT INTO mb_albums (mbid, title, release_date, status, primary_type, secondary_types, cover_art_url, created_at, updated_at)
        VALUES ${values}
        ON CONFLICT (mbid) DO UPDATE SET
          title = EXCLUDED.title,
          release_date = EXCLUDED.release_date,
          status = EXCLUDED.status,
          primary_type = EXCLUDED.primary_type,
          secondary_types = EXCLUDED.secondary_types,
          cover_art_url = EXCLUDED.cover_art_url,
          updated_at = NOW()
      `;

      try {
        await this.pool.query(query, params);
        inserted += batch.length;
        logger.info(`Loaded ${inserted}/${albums.length} albums`);
      } catch (error: any) {
        logger.error('Error loading albums batch', { error: error.message, batchStart: i });
        throw error;
      }
    }

    return inserted;
  }

  async loadTracks(tracks: TransformedTrack[]): Promise<number> {
    if (tracks.length === 0) return 0;

    let inserted = 0;
    const batchSize = MusicBrainzConfig.batchSize;

    for (let i = 0; i < tracks.length; i += batchSize) {
      const batch = tracks.slice(i, i + batchSize);
      
      const values = batch.map((_, idx) => {
        const baseIdx = idx * 4;
        return `($${baseIdx + 1}, $${baseIdx + 2}, $${baseIdx + 3}, $${baseIdx + 4})`;
      }).join(', ');

      const params: any[] = [];
      batch.forEach(track => {
        params.push(
          track.mbid,
          track.title,
          track.length,
          track.disambiguation
        );
      });

      const query = `
        INSERT INTO mb_tracks (mbid, title, length, disambiguation, created_at, updated_at)
        VALUES ${values}
        ON CONFLICT (mbid) DO UPDATE SET
          title = EXCLUDED.title,
          length = EXCLUDED.length,
          disambiguation = EXCLUDED.disambiguation,
          updated_at = NOW()
      `;

      try {
        await this.pool.query(query, params);
        inserted += batch.length;
        logger.info(`Loaded ${inserted}/${tracks.length} tracks`);
      } catch (error: any) {
        logger.error('Error loading tracks batch', { error: error.message, batchStart: i });
        throw error;
      }
    }

    return inserted;
  }

  async loadAlbumArtists(relations: AlbumArtistRelation[]): Promise<number> {
    if (relations.length === 0) return 0;

    let inserted = 0;
    const batchSize = MusicBrainzConfig.batchSize;

    for (let i = 0; i < relations.length; i += batchSize) {
      const batch = relations.slice(i, i + batchSize);
      
      const values = batch.map((_, idx) => {
        const baseIdx = idx * 3;
        return `($${baseIdx + 1}, $${baseIdx + 2}, $${baseIdx + 3})`;
      }).join(', ');

      const params: any[] = [];
      batch.forEach(rel => {
        params.push(rel.album_mbid, rel.artist_mbid, rel.role);
      });

      const query = `
        INSERT INTO mb_album_artists (album_mbid, artist_mbid, role)
        VALUES ${values}
        ON CONFLICT (album_mbid, artist_mbid, role) DO NOTHING
      `;

      try {
        await this.pool.query(query, params);
        inserted += batch.length;
        logger.info(`Loaded ${inserted}/${relations.length} album-artist relations`);
      } catch (error: any) {
        logger.error('Error loading album-artist relations', { error: error.message });
        throw error;
      }
    }

    return inserted;
  }

  async loadAlbumTracks(relations: AlbumTrackRelation[]): Promise<number> {
    if (relations.length === 0) return 0;

    let inserted = 0;
    const batchSize = MusicBrainzConfig.batchSize;

    for (let i = 0; i < relations.length; i += batchSize) {
      const batch = relations.slice(i, i + batchSize);
      
      const values = batch.map((_, idx) => {
        const baseIdx = idx * 4;
        return `($${baseIdx + 1}, $${baseIdx + 2}, $${baseIdx + 3}, $${baseIdx + 4})`;
      }).join(', ');

      const params: any[] = [];
      batch.forEach(rel => {
        params.push(rel.album_mbid, rel.track_mbid, rel.position, rel.disc_number);
      });

      const query = `
        INSERT INTO mb_album_tracks (album_mbid, track_mbid, position, disc_number)
        VALUES ${values}
        ON CONFLICT (album_mbid, track_mbid, position, disc_number) DO NOTHING
      `;

      try {
        await this.pool.query(query, params);
        inserted += batch.length;
        logger.info(`Loaded ${inserted}/${relations.length} album-track relations`);
      } catch (error: any) {
        logger.error('Error loading album-track relations', { error: error.message });
        throw error;
      }
    }

    return inserted;
  }
}

