# Music Rating App - iOS Frontend

## Setup

1. Open the project in Xcode:
   ```bash
   open MusicApp.xcodeproj
   ```

2. Configure environment variables (optional):
   - In Xcode: Edit Scheme → Run → Arguments → Environment Variables
   - Add:
     - `API_BASE_URL`: Your backend API URL (e.g., `http://localhost:3000/api`)
     - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID (if using Google Sign In)
     - `SPOTIFY_CLIENT_ID`: Your Spotify OAuth client ID (if using Spotify OAuth)

3. Update API base URL in code (if not using environment variable):
   - Edit `MusicApp/Services/APIService.swift`
   - Change the default `baseURL` value

4. Configure OAuth (if using):
   - **Apple Sign In**: Enable in Xcode → Signing & Capabilities → + Capability → Sign in with Apple
   - **Google Sign In**: Add AppAuth-iOS package via Swift Package Manager
   - **Spotify OAuth**: Add AppAuth-iOS package via Swift Package Manager

5. Build and run:
   - Select your target device/simulator
   - Press Cmd+R to build and run

## Environment Variables

See `.env.example` for available environment variables.

### Required:
- `API_BASE_URL` - Backend API base URL (default: `http://localhost:3000/api`)

### Optional:
- `GOOGLE_CLIENT_ID` - For Google Sign In
- `SPOTIFY_CLIENT_ID` - For Spotify OAuth

## Features

- User authentication (Email/Password, Apple, Google, Spotify)
- Music feed with ratings
- Global rankings
- Taste profile with charts
- Social features (friends, compatibility)
- Notifications
- Secure token storage (Keychain)

## Project Structure

- `Models/` - Data models
- `Views/` - SwiftUI views
- `ViewModels/` - View models for state management
- `Services/` - API services
- `Utilities/` - Helper utilities
- `Theme/` - App styling and colors


