import axios, { AxiosInstance } from 'axios';
import { MusicBrainzConfig } from '../config/musicbrainz.config';
import { logger } from '../config/logger';

interface MusicBrainzReleaseGroup {
  id: string;
  title: string;
  'first-release-date'?: string;
  'primary-type'?: string;
  'secondary-types'?: string[];
  'artist-credit'?: Array<{
    artist: {
      id: string;
      name: string;
      'sort-name'?: string;
      type?: string;
      area?: {
        name: string;
      };
      disambiguation?: string;
    };
    name?: string;
  }>;
  releases?: Array<{
    id: string;
    date?: string;
  }>;
}

interface MusicBrainzRecording {
  id: string;
  title: string;
  length?: number;
  disambiguation?: string;
  'artist-credit'?: Array<{
    artist: {
      id: string;
      name: string;
    };
  }>;
}

interface MusicBrainzRelease {
  id: string;
  title: string;
  'release-group'?: {
    id: string;
  };
  'medium-list'?: Array<{
    'track-list'?: Array<{
      'number': string;
      recording: {
        id: string;
        title: string;
        length?: number;
        disambiguation?: string;
      };
    }>;
  }>;
}

interface MusicBrainzSearchResponse<T> {
  'release-groups'?: T[];
  recordings?: T[];
  releases?: T[];
  count: number;
  offset: number;
}

export class MusicBrainzExtractService {
  private client: AxiosInstance;
  private lastRequestTime: number = 0;

  constructor() {
    this.client = axios.create({
      baseURL: MusicBrainzConfig.apiUrl,
      headers: {
        'User-Agent': MusicBrainzConfig.userAgent,
        'Accept': 'application/json'
      },
      timeout: 30000
    });
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < MusicBrainzConfig.rateLimitMs) {
      const waitTime = MusicBrainzConfig.rateLimitMs - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  async extractTopAlbumsByGenre(genre: string, limit: number): Promise<MusicBrainzReleaseGroup[]> {
    const allAlbums: MusicBrainzReleaseGroup[] = [];
    let offset = 0;
    const pageSize = 100;

    while (allAlbums.length < limit) {
      await this.rateLimit();

      try {
        const response = await this.client.get<MusicBrainzSearchResponse<MusicBrainzReleaseGroup>>(
          '/release-group',
          {
            params: {
              query: `tag:${genre} AND status:official AND (primarytype:Album OR primarytype:Single OR primarytype:EP)`,
              limit: Math.min(pageSize, limit - allAlbums.length),
              offset: offset,
              inc: 'artist-credits+releases'
            }
          }
        );

        const releaseGroups = response.data['release-groups'] || [];
        
        if (releaseGroups.length === 0) {
          break;
        }

        allAlbums.push(...releaseGroups);
        offset += releaseGroups.length;

        logger.info(`Extracted ${allAlbums.length}/${limit} albums for genre: ${genre}`);

        if (releaseGroups.length < pageSize || allAlbums.length >= limit) {
          break;
        }
      } catch (error: any) {
        logger.error(`Error extracting albums for genre ${genre}`, { error: error.message });
        throw error;
      }
    }

    return allAlbums.slice(0, limit);
  }

  async extractRecordingsForReleaseGroup(releaseGroupId: string): Promise<MusicBrainzRecording[]> {
    await this.rateLimit();

    try {
      const response = await this.client.get<MusicBrainzRelease>(
        `/release-group/${releaseGroupId}`,
        {
          params: {
            inc: 'releases+recordings'
          }
        }
      );

      const recordings: MusicBrainzRecording[] = [];
      const releases = response.data['medium-list'] || [];

      for (const medium of releases) {
        const tracks = medium['track-list'] || [];
        for (const track of tracks) {
          if (track.recording) {
            recordings.push({
              id: track.recording.id,
              title: track.recording.title,
              length: track.recording.length,
              disambiguation: track.recording.disambiguation
            });
          }
        }
      }

      return recordings;
    } catch (error: any) {
      logger.warn(`Error extracting recordings for release group ${releaseGroupId}`, { error: error.message });
      return [];
    }
  }

  async extractAllGenres(genres: string[], albumsPerGenre: number, maxTotalAlbums: number = 2000): Promise<MusicBrainzReleaseGroup[]> {
    const allAlbums: MusicBrainzReleaseGroup[] = [];
    const seenIds = new Set<string>();

    for (const genre of genres) {
      if (allAlbums.length >= maxTotalAlbums) {
        logger.info(`Reached max total albums limit (${maxTotalAlbums}). Stopping extraction.`);
        break;
      }
      
      logger.info(`Extracting albums for genre: ${genre}`);
      
      const remainingSlots = maxTotalAlbums - allAlbums.length;
      const albumsToExtract = Math.min(albumsPerGenre, remainingSlots);
      
      try {
        const albums = await this.extractTopAlbumsByGenre(genre, albumsToExtract);
        
        for (const album of albums) {
          if (allAlbums.length >= maxTotalAlbums) {
            break;
          }
          if (!seenIds.has(album.id)) {
            seenIds.add(album.id);
            allAlbums.push(album);
          }
        }
        
        logger.info(`Extracted ${albums.length} albums for ${genre}. Total: ${allAlbums.length}`);
      } catch (error: any) {
        logger.error(`Failed to extract albums for genre ${genre}`, { error: error.message });
      }
    }

    return allAlbums.slice(0, maxTotalAlbums);
  }
}

