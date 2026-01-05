//
//  OAuthService.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import Foundation
import AuthenticationServices
#if canImport(AppAuth)
import AppAuth
#endif

enum OAuthProvider {
    case apple
    case google
    case spotify
}

class OAuthService {
    private let authService: AuthService
    
    init(authService: AuthService = AuthService()) {
        self.authService = authService
    }
    
    // MARK: - Apple Sign In (Native)
    func signInWithApple() async throws -> AuthToken {
        // Apple Sign In uses AuthenticationServices framework (native)
        // This will be handled in the view with ASAuthorizationController
        throw NetworkError.unknown(NSError(domain: "OAuthService", code: -1, userInfo: [NSLocalizedDescriptionKey: "Apple Sign In must be initiated from view"]))
    }
    
    // MARK: - Google Sign In (AppAuth)
    #if canImport(AppAuth)
    func signInWithGoogle() async throws -> AuthToken {
        // AppAuth implementation for Google
        // Configuration
        guard let googleIssuer = URL(string: "https://accounts.google.com"),
              let redirectURI = URL(string: "com.musicapp://oauth/callback") else {
            throw NetworkError.invalidURL
        }
        
        // Discover configuration
        let configuration = try await OIDAuthorizationService.discoverConfiguration(forIssuer: googleIssuer)
        
        // Create authorization request
        let request = OIDAuthorizationRequest(
            configuration: configuration,
            clientId: "YOUR_GOOGLE_CLIENT_ID", // From .env or config
            scopes: [OIDScopeOpenID, OIDScopeProfile, OIDScopeEmail, "openid"],
            redirectURL: redirectURI,
            responseType: OIDResponseTypeCode,
            additionalParameters: nil
        )
        
        // This needs to be handled in the view with OIDAuthState
        // For now, return error indicating it needs view-level handling
        throw NetworkError.unknown(NSError(domain: "OAuthService", code: -1, userInfo: [NSLocalizedDescriptionKey: "Google Sign In requires AppAuth view controller"]))
    }
    #else
    func signInWithGoogle() async throws -> AuthToken {
        throw NetworkError.unknown(NSError(domain: "OAuthService", code: -1, userInfo: [NSLocalizedDescriptionKey: "AppAuth not available. Add AppAuth-iOS via SPM"]))
    }
    #endif
    
    // MARK: - Spotify OAuth (AppAuth)
    #if canImport(AppAuth)
    func signInWithSpotify() async throws -> AuthToken {
        // Spotify OAuth implementation
        guard let spotifyIssuer = URL(string: "https://accounts.spotify.com"),
              let redirectURI = URL(string: "com.musicapp://oauth/spotify/callback") else {
            throw NetworkError.invalidURL
        }
        
        // Discover configuration
        let configuration = try await OIDAuthorizationService.discoverConfiguration(forIssuer: spotifyIssuer)
        
        // Create authorization request
        let request = OIDAuthorizationRequest(
            configuration: configuration,
            clientId: "YOUR_SPOTIFY_CLIENT_ID", // From .env or config
            scopes: ["user-read-email", "user-read-private"],
            redirectURL: redirectURI,
            responseType: OIDResponseTypeCode,
            additionalParameters: nil
        )
        
        throw NetworkError.unknown(NSError(domain: "OAuthService", code: -1, userInfo: [NSLocalizedDescriptionKey: "Spotify OAuth requires AppAuth view controller"]))
    }
    #else
    func signInWithSpotify() async throws -> AuthToken {
        throw NetworkError.unknown(NSError(domain: "OAuthService", code: -1, userInfo: [NSLocalizedDescriptionKey: "AppAuth not available. Add AppAuth-iOS via SPM"]))
    }
    #endif
    
    // MARK: - Handle OAuth Callback
    func handleOAuthCallback(authorizationCode: String, provider: OAuthProvider) async throws -> AuthToken {
        let request = OAuthRequest(
            provider: provider.rawValue,
            token: authorizationCode,
            idToken: nil
        )
        
        let response: APIResponse<AuthToken> = try await APIService.shared.request(
            endpoint: "/auth/oauth/\(provider.rawValue)",
            method: .post,
            body: request,
            requiresAuth: false
        )
        
        guard response.success, let data = response.data else {
            throw NetworkError.unauthorized
        }
        
        return data
    }
}

extension OAuthProvider {
    var rawValue: String {
        switch self {
        case .apple: return "apple"
        case .google: return "google"
        case .spotify: return "spotify"
        }
    }
}

