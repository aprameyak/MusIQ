# Music Rating API Backend

Backend REST API for the Music Rating iOS app.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon DB)
- **Authentication**: JWT with refresh tokens
- **Security**: Helmet, CORS, Rate Limiting, RBAC

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:
   - Set `DATABASE_URL` to your Neon PostgreSQL connection string
   - Set `JWT_SECRET` and `JWT_REFRESH_SECRET`
   - Configure OAuth credentials (Apple, Google, Spotify)

4. Run database migrations:
```bash
npm run migrate
```

5. (Optional) Seed the database:
```bash
npm run seed
```

6. Start development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Environment Variables

See `.env.example` for all required environment variables.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Music
- `GET /api/music/feed` - Get music feed
- `GET /api/music/:id` - Get music item details
- `GET /api/music/search` - Search music

### Ratings
- `POST /api/ratings` - Submit a rating
- `GET /api/ratings/:musicItemId` - Get ratings for an item

### Rankings
- `GET /api/rankings/albums` - Album rankings
- `GET /api/rankings/songs` - Song rankings
- `GET /api/rankings/artists` - Artist rankings

### Profile
- `GET /api/profile` - Get user profile
- `GET /api/profile/taste` - Get taste profile

### Social
- `GET /api/social/friends` - Get friends list
- `POST /api/social/follow/:userId` - Follow a user

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read

## Project Structure

```
backend/
├── src/
│   ├── routes/          # API route handlers
│   ├── models/          # Data models
│   ├── services/        # Business logic
│   ├── middleware/      # Express middleware
│   ├── security/        # Security services
│   ├── database/        # Database migrations and seeds
│   └── config/          # Configuration files
├── dist/                # Compiled JavaScript
└── package.json
```

## Security Features

- JWT authentication with refresh tokens
- RBAC (Role-Based Access Control)
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- CORS configuration
- Security headers (Helmet)
- Audit logging

## Deployment

The backend is designed to run on an Azure VM with:
- Ubuntu 22.04 LTS
- Nginx reverse proxy
- PM2 process manager
- SSL/TLS certificates (Let's Encrypt)

