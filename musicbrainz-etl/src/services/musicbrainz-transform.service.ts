import { MusicBrainzConfig } from '../config/musicbrainz.config';
import { logger } from '../config/logger';

interface RawReleaseGroup {
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
  }>;
}

interface RawRecording {
  id: string;
  title: string;
  length?: number;
  disambiguation?: string;
}

export interface TransformedArtist {
  mbid: string;
  name: string;
  sort_name: string | null;
  type: string | null;
  area: string | null;
  disambiguation: string | null;
}

export interface TransformedAlbum {
  mbid: string;
  title: string;
  release_date: string | null;
  status: string;
  primary_type: string | null;
  secondary_types: string[] | null;
  cover_art_url: string | null;
}

export interface TransformedTrack {
  mbid: string;
  title: string;
  length: number | null;
  disambiguation: string | null;
}

export interface AlbumArtistRelation {
  album_mbid: string;
  artist_mbid: string;
  role: string;
}

export interface AlbumTrackRelation {
  album_mbid: string;
  track_mbid: string;
  position: number;
  disc_number: number;
}

export class MusicBrainzTransformService {
  private normalizeText(text: string | undefined): string {
    if (!text) return '';
    return text.trim().replace(/\s+/g, ' ');
  }

  private parseDate(dateString: string | undefined): string | null {
    if (!dateString) return null;
    
    const date = dateString.split('-')[0];
    if (date && date.length === 4) {
      return `${date}-01-01`;
    }
    
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return null;
    }
  }

  private shouldIncludeReleaseGroup(releaseGroup: RawReleaseGroup): boolean {
    if (!releaseGroup['primary-type'] || 
        !MusicBrainzConfig.releaseTypes.includes(releaseGroup['primary-type'])) {
      return false;
    }

    const secondaryTypes = releaseGroup['secondary-types'] || [];
    for (const excluded of MusicBrainzConfig.excludeSecondaryTypes) {
      if (secondaryTypes.includes(excluded)) {
        return false;
      }
    }

    if (!releaseGroup.title || !releaseGroup['artist-credit'] || releaseGroup['artist-credit'].length === 0) {
      return false;
    }

    return true;
  }

  transformArtists(releaseGroups: RawReleaseGroup[]): {
    artists: TransformedArtist[];
    albumArtists: AlbumArtistRelation[];
  } {
    const artistsMap = new Map<string, TransformedArtist>();
    const albumArtists: AlbumArtistRelation[] = [];

    for (const releaseGroup of releaseGroups) {
      if (!this.shouldIncludeReleaseGroup(releaseGroup)) {
        continue;
      }

      const artistCredits = releaseGroup['artist-credit'] || [];
      
      for (const credit of artistCredits) {
        const artist = credit.artist;
        if (!artist) continue;

        if (!artistsMap.has(artist.id)) {
          artistsMap.set(artist.id, {
            mbid: artist.id,
            name: this.normalizeText(artist.name),
            sort_name: this.normalizeText(artist['sort-name']),
            type: artist.type || null,
            area: artist.area?.name || null,
            disambiguation: this.normalizeText(artist.disambiguation) || null
          });
        }

        albumArtists.push({
          album_mbid: releaseGroup.id,
          artist_mbid: artist.id,
          role: 'Main'
        });
      }
    }

    return {
      artists: Array.from(artistsMap.values()),
      albumArtists
    };
  }

  transformAlbums(releaseGroups: RawReleaseGroup[]): TransformedAlbum[] {
    const albums: TransformedAlbum[] = [];

    for (const releaseGroup of releaseGroups) {
      if (!this.shouldIncludeReleaseGroup(releaseGroup)) {
        continue;
      }

      albums.push({
        mbid: releaseGroup.id,
        title: this.normalizeText(releaseGroup.title),
        release_date: this.parseDate(releaseGroup['first-release-date']),
        status: 'Official',
        primary_type: releaseGroup['primary-type'] || null,
        secondary_types: releaseGroup['secondary-types'] || null,
        cover_art_url: null
      });
    }

    return albums;
  }

  transformTracks(recordings: RawRecording[], albumMbid: string, positions: number[]): {
    tracks: TransformedTrack[];
    albumTracks: AlbumTrackRelation[];
  } {
    const tracks: TransformedTrack[] = [];
    const albumTracks: AlbumTrackRelation[] = [];

    for (let i = 0; i < recordings.length; i++) {
      const recording = recordings[i];
      const position = positions[i] || i + 1;

      tracks.push({
        mbid: recording.id,
        title: this.normalizeText(recording.title),
        length: recording.length || null,
        disambiguation: this.normalizeText(recording.disambiguation) || null
      });

      albumTracks.push({
        album_mbid: albumMbid,
        track_mbid: recording.id,
        position: position,
        disc_number: 1
      });
    }

    return { tracks, albumTracks };
  }
}

