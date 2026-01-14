import axios from 'axios';
import { getDatabasePool } from '../database/connection';
import { logger } from '../config/logger';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  external_ids?: {
    isrc?: string;
  };
}

interface SpotifyAlbum {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  images: Array<{ url: string }>;
  external_ids?: {
    upc?: string;
  };
}

export class MusicETLService {
  private pool = getDatabasePool();
  private spotifyClientId: string;
  private spotifyClientSecret: string;
  private spotifyAccessToken: string | null = null;
  private spotifyTokenExpiry: number = 0;

  constructor() {
    this.spotifyClientId = process.env.SPOTIFY_CLIENT_ID || '';
    this.spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
  }

  async getSpotifyAccessToken(): Promise<string> {
    if (this.spotifyAccessToken && Date.now() < this.spotifyTokenExpiry) {
      return this.spotifyAccessToken;
    }

    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'client_credentials',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(
              `${this.spotifyClientId}:${this.spotifyClientSecret}`
            ).toString('base64')}`,
          },
        }
      );

      const accessToken = response.data.access_token;
      if (!accessToken || typeof accessToken !== 'string') {
        throw new Error('Failed to get Spotify access token');
      }

      this.spotifyAccessToken = accessToken;
      this.spotifyTokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;
      
      return accessToken;
    } catch (error) {
      logger.error('Failed to get Spotify access token', { error });
      throw error;
    }
  }

  async fetchSpotifyNewReleases(limit: number = 50): Promise<SpotifyAlbum[]> {
    try {
      const token = await this.getSpotifyAccessToken();
      const response = await axios.get<{ albums: { items: SpotifyAlbum[] } }>(
        'https://api.spotify.com/v1/browse/new-releases',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            limit,
            country: 'US',
          },
        }
      );

      return response.data.albums.items;
    } catch (error) {
      logger.error('Failed to fetch Spotify new releases', { error });
      throw error;
    }
  }

  async fetchSpotifyFeaturedPlaylists(limit: number = 50): Promise<SpotifyTrack[]> {
    try {
      const token = await this.getSpotifyAccessToken();
      
      const playlistsResponse = await axios.get<{ playlists: { items: Array<{ id: string }> } }>(
        'https://api.spotify.com/v1/browse/featured-playlists',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            limit: 10,
            country: 'US',
          },
        }
      );

      const tracks: SpotifyTrack[] = [];
      
      for (const playlist of playlistsResponse.data.playlists.items.slice(0, 5)) {
        try {
          const tracksResponse = await axios.get<{ items: Array<{ track: SpotifyTrack }> }>(
            `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              params: {
                limit: 10,
              },
            }
          );

          tracks.push(...tracksResponse.data.items.map(item => item.track).filter(Boolean));
        } catch (error) {
          logger.warn('Failed to fetch playlist tracks', { playlistId: playlist.id, error });
        }
      }

      return tracks.slice(0, limit);
    } catch (error) {
      logger.error('Failed to fetch Spotify featured playlists', { error });
      throw error;
    }
  }

  async fetchSpotifyTopTracks(limit: number = 50): Promise<SpotifyTrack[]> {
    try {
      const token = await this.getSpotifyAccessToken();
      const response = await axios.get<{ items: Array<{ track: SpotifyTrack | null }> }>(
        'https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF/tracks',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            limit,
          },
        }
      );

      return response.data.items
        .map((item: { track: SpotifyTrack | null }) => item.track)
        .filter((track): track is SpotifyTrack => track !== null);
    } catch (error) {
      logger.error('Failed to fetch Spotify top tracks', { error });
      throw error;
    }
  }

  async transformAndStoreAlbums(albums: SpotifyAlbum[]): Promise<number> {
    let inserted = 0;

    for (const album of albums) {
      try {
        const artistName = album.artists.map(a => a.name).join(', ');
        const imageUrl = album.images?.[0]?.url || null;

        const result = await this.pool.query(
          `INSERT INTO music_items (type, title, artist, image_url, spotify_id, metadata)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (spotify_id) DO UPDATE SET
             title = EXCLUDED.title,
             artist = EXCLUDED.artist,
             image_url = EXCLUDED.image_url,
             metadata = EXCLUDED.metadata,
             updated_at = NOW()
           RETURNING id`,
          [
            'album',
            album.name,
            artistName,
            imageUrl,
            album.id,
            JSON.stringify({
              release_date: null,
              total_tracks: null,
              genres: [],
            }),
          ]
        );

        if (result.rows.length > 0) {
          inserted++;
        }
      } catch (error) {
        logger.warn('Failed to insert album', { album: album.name, error });
      }
    }

    return inserted;
  }

  async transformAndStoreTracks(tracks: SpotifyTrack[]): Promise<number> {
    let inserted = 0;

    for (const track of tracks) {
      try {
        const artistName = track.artists.map(a => a.name).join(', ');
        const imageUrl = track.album?.images?.[0]?.url || null;

        const result = await this.pool.query(
          `INSERT INTO music_items (type, title, artist, image_url, spotify_id, metadata)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (spotify_id) DO UPDATE SET
             title = EXCLUDED.title,
             artist = EXCLUDED.artist,
             image_url = EXCLUDED.image_url,
             metadata = EXCLUDED.metadata,
             updated_at = NOW()
           RETURNING id`,
          [
            'song',
            track.name,
            artistName,
            imageUrl,
            track.id,
            JSON.stringify({
              album: track.album?.name,
              duration_ms: null,
              explicit: null,
            }),
          ]
        );

        if (result.rows.length > 0) {
          inserted++;
        }
      } catch (error) {
        logger.warn('Failed to insert track', { track: track.name, error });
      }
    }

    return inserted;
  }

  async runETLJob(): Promise<void> {
    logger.info('Starting music ETL job...');

    try {
      let totalInserted = 0;

      const newReleases = await this.fetchSpotifyNewReleases(50);
      const albumsInserted = await this.transformAndStoreAlbums(newReleases);
      totalInserted += albumsInserted;
      logger.info(`Inserted ${albumsInserted} new albums from Spotify new releases`);

      const topTracks = await this.fetchSpotifyTopTracks(50);
      const tracksInserted = await this.transformAndStoreTracks(topTracks);
      totalInserted += tracksInserted;
      logger.info(`Inserted ${tracksInserted} new tracks from Spotify top tracks`);

      const featuredTracks = await this.fetchSpotifyFeaturedPlaylists(30);
      const featuredInserted = await this.transformAndStoreTracks(featuredTracks);
      totalInserted += featuredInserted;
      logger.info(`Inserted ${featuredInserted} new tracks from Spotify featured playlists`);

      logger.info(`ETL job completed. Total items inserted/updated: ${totalInserted}`);
    } catch (error) {
      logger.error('ETL job failed', { error });
      throw error;
    }
  }
}

