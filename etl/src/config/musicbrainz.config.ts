export const MusicBrainzConfig = {
  // MusicBrainz API Endpoint (Override with MUSICBRAINZ_API_URL)
  apiUrl: process.env.MUSICBRAINZ_API_URL || 'https://musicbrainz.org/ws/2',
  // User Agent for MusicBrainz (Override with MUSICBRAINZ_USER_AGENT)
  userAgent: process.env.MUSICBRAINZ_USER_AGENT || 'MusIQ/1.0 (https://musiq.app)',
  rateLimitMs: 1000,

  majorGenres: process.env.ETL_MAJOR_GENRES?.split(',') || [
    'hip-hop', 'pop', 'rock', 'electronic', 'jazz', 'classical',
    'country', 'r&b', 'blues', 'folk', 'metal', 'punk', 'reggae', 'soul'
  ],

  nicheGenres: process.env.ETL_NICHE_GENRES?.split(',') || [
    'indie', 'alternative', 'experimental', 'world music', 'ambient',
    'folk rock', 'progressive rock', 'post-rock'
  ],

  albumsPerMajorGenre: parseInt(process.env.ETL_ALBUMS_PER_MAJOR_GENRE || '1500'),
  albumsPerNicheGenre: parseInt(process.env.ETL_ALBUMS_PER_NICHE_GENRE || '300'),

  batchSize: parseInt(process.env.ETL_BATCH_SIZE || '1000'),

  releaseStatuses: ['Official'],
  releaseTypes: ['Album', 'Single', 'EP'],

  excludeSecondaryTypes: ['Bootleg', 'Promotional']
};

