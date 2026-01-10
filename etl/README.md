# MusIQ MusicBrainz ETL Pipeline

One-time ETL pipeline to extract music metadata from MusicBrainz API and load it into PostgreSQL.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment file:
   ```bash
   cp .env.example .env
   ```

3. Configure `.env`:
   - `DATABASE_URL`: Your PostgreSQL connection string (same as backend)
   - `MUSICBRAINZ_USER_AGENT`: Required by MusicBrainz API
   - Genre configuration (optional, defaults provided)

4. Run database migration:
   ```bash
   npm run migrate
   ```

5. Run ETL:
   ```bash
   npm run etl
   ```

## Usage

### Basic Run
```bash
npm run etl
```

### With Options
```bash
npm run etl -- --albums-per-genre 2000 --genres "hip-hop,pop,rock" --enrich-cover-art
```

### Options
- `--albums-per-genre N` - Albums per genre (default: 1500 major, 300 niche)
- `--genres "genre1,genre2"` - Specific genres to extract
- `--skip-artists` - Skip artist extraction
- `--skip-albums` - Skip album extraction
- `--skip-tracks` - Skip track extraction
- `--enrich-cover-art` - Enable cover art enrichment

## What It Does

1. **Extracts** top releases across 20+ genres from MusicBrainz API
2. **Transforms** data into normalized schema (artists, albums, tracks)
3. **Loads** into PostgreSQL with proper relationships
4. **Enriches** with cover art from Cover Art Archive (optional)

## Output

Creates normalized tables:
- `mb_artists` - Artist data
- `mb_albums` - Album/release group data
- `mb_tracks` - Track/recording data
- `mb_album_artists` - Artist-album relationships
- `mb_album_tracks` - Album-track relationships

## Notes

- Respects MusicBrainz rate limits (1 req/sec)
- Idempotent: Can re-run safely
- Processes ~20k-30k albums across genres
- Takes 3-5 hours to complete

