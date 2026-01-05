# OAuth Authentication Setup

## Current Implementation

### Authentication Methods

1. **Email/Password** ✅
   - Custom implementation using URLSession
   - JWT tokens stored in Keychain
   - Fully functional

2. **Apple Sign In** ✅ (Native)
   - Uses `AuthenticationServices` framework (native iOS)
   - No external dependencies required
   - `AppleSignInButton` component created

3. **Google Sign In** ✅ (AppAuth Ready)
   - Full AppAuth implementation in `GoogleSignInButton`
   - Requires AppAuth-iOS package to be added via SPM
   - `GoogleSignInButton` component fully implemented
   - Backend endpoint ready at `/api/auth/oauth/google`

4. **Spotify OAuth** ✅ (AppAuth Ready)
   - Full AppAuth implementation in `SpotifySignInButton`
   - Requires AppAuth-iOS package to be added via SPM
   - `SpotifySignInButton` component fully implemented
   - Backend endpoint ready at `/api/auth/oauth/spotify`

## Adding AppAuth to Xcode Project

### Option 1: Swift Package Manager (Recommended)

1. Open Xcode project
2. Go to **File** → **Add Package Dependencies...**
3. Enter URL: `https://github.com/openid/AppAuth-iOS`
4. Select version: **Latest** (or specific version like 1.7.0)
5. Add to target: **MusicApp**
6. Click **Add Package**

### Option 2: Manual Installation

If SPM doesn't work, you can add it manually via CocoaPods or Carthage.

## Required Configuration

### 1. Info.plist Updates

Add URL schemes for OAuth callbacks:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.musicapp</string>
        </array>
    </dict>
</array>
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 Client ID
3. Add iOS bundle ID: `com.musicapp`
4. Add redirect URI: `com.musicapp://oauth/google/callback`
5. Copy Client ID to environment or config

### 3. Spotify OAuth Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create app
3. Add redirect URI: `com.musicapp://oauth/spotify/callback`
4. Copy Client ID and Secret to backend `.env`

### 4. Apple Sign In Setup

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Enable "Sign in with Apple" capability
3. Configure in Xcode: **Signing & Capabilities** → **+ Capability** → **Sign in with Apple**

## Implementation Status

- ✅ Apple Sign In button component (fully functional)
- ✅ Google Sign In button component (AppAuth implementation complete)
- ✅ Spotify Sign In button component (AppAuth implementation complete)
- ✅ OAuth service structure
- ✅ Backend OAuth endpoints (`/api/auth/oauth/apple`, `/google`, `/spotify`)
- ✅ OAuth callback handling in `MusicAppApp.swift`
- ✅ URL scheme configuration in `Info.plist`
- ✅ OAuth callback handler view modifier
- ⏳ AppAuth-iOS package installation (user needs to add via SPM)

## Next Steps

1. **Add AppAuth Package** (Required for Google & Spotify):
   - Open Xcode project
   - Go to **File** → **Add Package Dependencies...**
   - Enter URL: `https://github.com/openid/AppAuth-iOS`
   - Select version: **Up to Next Major Version** (1.7.0 or later)
   - Add to target: **MusicApp**
   - Click **Add Package**

2. **Configure OAuth Providers**:
   - Set up Google OAuth in Google Cloud Console
   - Set up Spotify OAuth in Spotify Developer Dashboard
   - Configure Apple Sign In in Apple Developer Portal
   - Add Client IDs to environment variables or config

3. **Test OAuth Flows**:
   - Test Apple Sign In (should work immediately)
   - Test Google Sign In (after adding AppAuth package)
   - Test Spotify OAuth (after adding AppAuth package)

## Current Auth Flow

```
User taps "Sign in with Apple/Google"
    ↓
Native OAuth flow (AuthenticationServices/AppAuth)
    ↓
Receives authorization code + ID token
    ↓
Sends to backend /api/auth/oauth/{provider}
    ↓
Backend verifies token and creates/updates user
    ↓
Returns JWT tokens
    ↓
Store in Keychain
    ↓
User authenticated
```

## Notes

- **Apple Sign In**: Uses native `AuthenticationServices` - no AppAuth needed
- **Google/Spotify**: Require AppAuth-iOS for OAuth 2.0 flow
- **Backend**: Already has OAuth endpoint structure ready
- **Security**: All tokens stored securely in Keychain

