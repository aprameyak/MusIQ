# MusIQ

MusIQ is a music rating app for iOS. You rate albums, songs, and artists from 1 to 10, follow friends, compare tastes, and see global rankings built from everyone's ratings. The catalog comes from MusicBrainz.

Live site: https://musiq-tawny.vercel.app

## Features

- Rate albums, songs, and artists on a 1 to 10 scale, with album, song, and artist rankings built from all users' ratings
- Fuzzy catalog search (Postgres `pg_trgm`) over music items loaded from MusicBrainz, with optional cover art from the Cover Art Archive
- Posts tied to a rating, with likes, comments, and reposts, plus a home feed
- Follow other users, list followers and following, and get a taste compatibility score or side-by-side comparison
- In-app notifications when someone likes, comments on, or reposts your post
- Profiles with a taste summary and profile pictures stored in Azure Blob Storage

## Tech stack

- API: Node.js, TypeScript, Express, Knex, PostgreSQL (Supabase), Supabase Auth, Jest and Supertest
- ETL: Node.js and TypeScript scripts that pull from the MusicBrainz API into Postgres
- iOS app: SwiftUI, with the Supabase Swift SDK
- Web app: Next.js and Tailwind, used for the landing page, auth callbacks, password reset, support, and privacy pages

## Quick start

You need Node.js 20 (CI uses 20.x), a PostgreSQL database such as a Supabase project, and Xcode for the iOS app.

There are no `.env.example` files in the repo, so create `backend/.env` and `etl/.env` yourself using the variable names listed below.

Run the API:

```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

The server listens on `PORT` (default 3000). Check it:

```bash
$ curl http://localhost:3000/health
{"status":"ok","timestamp":"2026-01-01T12:00:00.000Z"}
```

Load the music catalog with the ETL:

```bash
cd etl
npm install
npm run migrate
npm run etl -- --genres rock,jazz --albums-per-genre 50 --enrich-cover-art
```

Other ETL flags: `--skip-artists`, `--skip-albums`, `--skip-tracks`. Without `--genres` it processes hip-hop, pop, rock, electronic, and jazz, capped at 2000 albums.

Run the iOS app by opening `frontend/a.xcodeproj` in Xcode and building the `MusicApp` scheme. Xcode resolves `supabase-swift` through Swift Package Manager. Set `API_BASE_URL` in the build settings or scheme environment; it defaults to `http://localhost:3000/api`.

Run the web app with `cd webapp && npm install && npm run dev`.

### Docker

`docker-compose.yml` builds only the API from `backend/Dockerfile`, reads `backend/.env`, and exposes it on port 3001:

```bash
docker compose up --build
```

### Environment variables

- `backend/.env`: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PORT`, `NODE_ENV`, `CORS_ORIGIN`, `ENCRYPTION_KEY`, `AZURE_STORAGE_CONNECTION_STRING`, `AZURE_STORAGE_CONTAINER_NAME`, `DB_POOL_MIN`, `DB_POOL_MAX`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`, `LOG_LEVEL`, and for the Discord issue bot `DISCORD_PUBLIC_KEY`, `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`
- `etl/.env`: `DATABASE_URL`, `MUSICBRAINZ_API_URL`, `MUSICBRAINZ_USER_AGENT`, `ETL_MAJOR_GENRES`, `ETL_NICHE_GENRES`, `ETL_ALBUMS_PER_MAJOR_GENRE`, `ETL_ALBUMS_PER_NICHE_GENRE`, `ETL_BATCH_SIZE`, `LOG_LEVEL`
- `webapp`: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

### Tests

```bash
cd backend
npm test
npm run test:coverage
```

The Jest suites live in `backend/tests/` and cover the routes, auth service, Supabase service, and middleware. Coverage thresholds are set in `backend/jest.config.js`.

## API

All routes are mounted under `/api` in `backend/src/index.ts`:

| Prefix | What it does |
| --- | --- |
| `/api/auth` | signup, login, refresh, logout, password reset, email verification (backed by Supabase Auth) |
| `/api/music` | feed, fuzzy search (`?q=`), item details |
| `/api/ratings` | rate an item, ratings for an item or a user |
| `/api/rankings` | `/albums`, `/songs`, `/artists` |
| `/api/posts` | create posts, feed, likes, comments, reposts |
| `/api/social` | follow, unfollow, followers, following, compatibility, compare |
| `/api/profile` | profile, taste profile, user search, profile picture upload |
| `/api/notifications` | list and mark read |
| `/api/admin` | mounted, no routes defined yet |
| `/api/webhooks` | Discord interactions |

Most routes require a bearer token from `/api/auth/login`.

## How it works

- `backend/src/index.ts` sets up Express with Helmet, CORS, HPP, rate limiting, and the route modules in `backend/src/routes/`.
- `backend/src/middleware/` holds auth (token check), RBAC helpers (`requireRole`, `requirePermission`), audit logging, validation, rate limiting, and Discord request signature checks. Roles (`user`, `moderator`, `admin`) and permissions are seeded by `backend/src/database/seeds/001_seed_roles_permissions.ts`.
- `backend/src/database/migrations/` defines the schema: users, roles and permissions, `music_items`, ratings, refresh tokens, friendships, notifications, audit logs, posts, and post likes, comments, and reposts.
- `backend/src/services/` wraps Supabase Auth, RBAC, Azure Blob uploads, and the GitHub API.
- `etl/src/services/` runs extract, transform, and load against the MusicBrainz API into `mb_artists`, `mb_albums`, `mb_tracks`, and join tables, optionally adds cover art, then `musicbrainz-sync.service.ts` copies rows into the API's `music_items` table. The entry point is `etl/src/scripts/run-musicbrainz-etl.ts`.
- `frontend/MusicApp/` is the SwiftUI client, organized into `Models/`, `Services/` (one per API area), `ViewModels/`, and `Views/`.
- The `/create-issue` Discord slash command posts to `/api/webhooks/discord`, which verifies the signature and opens a GitHub issue in this repo.

## Project structure

```
backend/           Express API, migrations, seeds, Jest tests, Dockerfile
etl/               MusicBrainz ingestion pipeline
frontend/          SwiftUI iOS app (MusicApp/, tests, Xcode project)
webapp/            Next.js site for auth callbacks, support, and privacy
scripts/           issue generation script
.github/workflows/ backend CI/CD, CodeQL, issue automation
```

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) first, and report vulnerabilities as described in [SECURITY.md](SECURITY.md).

Before opening a PR, run the same checks CI runs for the backend:

```bash
cd backend
npm run lint
npm test
npm run build
```

The root Husky pre-commit hook runs `lint-staged` and `tsc --noEmit` in `backend/`, `webapp/`, and `etl/`.

Built by [@aprameyak](https://github.com/aprameyak).

## License

MIT. See [LICENSE](LICENSE).
