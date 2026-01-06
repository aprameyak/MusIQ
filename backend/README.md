# Music Rating API - Backend

## Setup

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in the required environment variables in `.env`:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `JWT_SECRET`: A secure random string (min 32 characters)
   - `JWT_REFRESH_SECRET`: Another secure random string (min 32 characters)
   - `ENCRYPTION_KEY`: A 32-character encryption key

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run database migrations:
   ```bash
   npm run migrate
   ```

5. Seed the database (optional):
   ```bash
   npm run seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

See `.env.example` for all available environment variables.

### Required Variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for signing JWT tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `ENCRYPTION_KEY` - 32-character encryption key

### Optional Variables:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Frontend URL
- OAuth credentials (Google, Spotify)
- Redis configuration
- Azure Key Vault configuration

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/profile` - Get user profile
- `GET /api/music/feed` - Get music feed
- `POST /api/ratings` - Submit rating
- `GET /api/rankings` - Get global rankings
- `GET /api/social/friends` - Get friends list
- `GET /api/notifications` - Get notifications

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- CORS configuration
- Security headers (Helmet)
- Audit logging
- RBAC (Role-Based Access Control)
