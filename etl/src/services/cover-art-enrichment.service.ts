import axios from 'axios';
import { logger } from '../config/logger';

interface CoverArtArchiveResponse {
  images: Array<{
    image: string;
    types: string[];
    front: boolean;
  }>;
}

export class CoverArtEnrichmentService {
  async getCoverArtUrl(releaseMbid: string): Promise<string | null> {
    try {
      const response = await axios.get<CoverArtArchiveResponse>(
        `https://coverartarchive.org/release/${releaseMbid}`,
        {
          timeout: 5000,
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      const frontCover = response.data.images?.find(img => img.front);
      return frontCover?.image || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      logger.warn(`Error fetching cover art for release ${releaseMbid}`, { error: error.message });
      return null;
    }
  }

  async enrichAlbumsWithCoverArt(albumMbids: string[]): Promise<Map<string, string>> {
    const coverArtMap = new Map<string, string>();
    let processed = 0;

    for (const mbid of albumMbids) {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const coverUrl = await this.getCoverArtUrl(mbid);
      if (coverUrl) {
        coverArtMap.set(mbid, coverUrl);
      }
      
      processed++;
      if (processed % 100 === 0) {
        logger.info(`Enriched ${processed}/${albumMbids.length} albums with cover art`);
      }
    }

    return coverArtMap;
  }
}

