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

3. **Google Sign In** ⚠️ (AppAuth Required)
   - Structure ready for AppAuth
   - Requires AppAuth-iOS package
   - `GoogleSignInButton` component created (needs AppAuth)

4. **Spotify OAuth** ⚠️ (AppAuth Required)
   - Structure ready for AppAuth
   - Requires AppAuth-iOS package
   - Not yet implemented in UI

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

- ✅ Apple Sign In button component
- ✅ Google Sign In button component (needs AppAuth)
- ✅ OAuth service structure
- ✅ Backend OAuth endpoints ready
- ⏳ Full AppAuth integration (requires package installation)
- ⏳ OAuth callback handling in app delegate

## Next Steps

1. **Add AppAuth Package**:
   - Add AppAuth-iOS via SPM in Xcode
   - Update imports in `OAuthService.swift` and `GoogleSignInButton.swift`

2. **Complete Google Sign In**:
   - Implement full OIDAuthState flow
   - Handle authorization in view controller
   - Process callback URL

3. **Complete Spotify OAuth**:
   - Similar to Google implementation
   - Use Spotify-specific scopes

4. **Handle OAuth Callbacks**:
   - Update `AppDelegate` or `SceneDelegate` to handle URL schemes
   - Process authorization codes and exchange for tokens

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

