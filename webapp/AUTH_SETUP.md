# Authentication Setup Guide

This guide will help you set up authentication for the MusIQ webapp with username-based authentication.

## Environment Variables

Create a `.env.local` file in the `webapp` directory with the following variables (optional):

```env
# API Configuration
# Default is the hosted backend, but you can override for local development
NEXT_PUBLIC_API_URL=https://musiq-sc2d.onrender.com/api
```

## Username Authentication

Username-based authentication is fully functional and doesn't require additional setup. Users can sign up and sign in using:
- Username (3-30 characters, letters, numbers, and underscores only)
- Password with security requirements:
  - 8-128 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (@$!%*?&)
- Password confirmation required on signup

## Testing

The backend is hosted at `https://musiq-sc2d.onrender.com`, so you can test authentication directly:

1. Start the webapp:
   ```bash
   cd webapp
   npm run dev
   ```

2. Navigate to `http://localhost:3000/auth` to test authentication

**Note**: The webapp defaults to the hosted backend. If you need to use a local backend for development, set `NEXT_PUBLIC_API_URL=http://localhost:3000/api` in your `.env.local` file.

## API Endpoints

The authentication system uses these backend endpoints:

- `POST /api/auth/signup` - Username sign up
- `POST /api/auth/login` - Username login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

## Notes

- Tokens are stored in `localStorage` (consider using httpOnly cookies for production)
- The auth state is checked on page load
- Users are redirected to the homepage after successful authentication
- Unauthenticated users see a "Get Started" button that links to `/auth`
