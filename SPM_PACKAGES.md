# Swift Package Manager Dependencies

## Required Packages

### AppAuth-iOS

**Purpose**: OAuth 2.0 and OpenID Connect authentication for Google and Spotify

**Installation**:
1. Open Xcode project
2. Go to **File** → **Add Package Dependencies...**
3. Enter URL: `https://github.com/openid/AppAuth-iOS`
4. Select version: **Up to Next Major Version** (1.7.0 or later)
5. Add to target: **MusicApp**
6. Click **Add Package**

**Usage**: Already integrated in:
- `OAuthService.swift`
- `GoogleSignInButton.swift`
- `SpotifySignInButton.swift`

**Note**: The code uses `#if canImport(AppAuth)` so it will compile without the package, but OAuth features won't work until the package is added.

## Optional Packages (Future)

### SwiftUI Charts
- Already using native Swift Charts framework (iOS 16+)
- No external package needed

### Keychain Access
- Using custom `KeychainHelper` with Security framework
- No external package needed

## Verification

After adding AppAuth-iOS, verify it's working:

1. Check imports work:
   ```swift
   import AppAuth  // Should not show error
   ```

2. Build the project:
   ```bash
   # In Xcode: Product → Build (Cmd+B)
   ```

3. Test OAuth buttons appear and are functional

