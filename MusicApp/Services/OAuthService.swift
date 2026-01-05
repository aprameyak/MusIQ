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

enum OAuthProviderType {
    case apple
    case google
    case spotify
    
    var rawValue: String {
        switch self {
        case .apple: return "apple"
        case .google: return "google"
        case .spotify: return "spotify"
        }
    }
}

class OAuthService {
    private let authService: AuthService
    
    init(authService: AuthService = AuthService()) {
        self.authService = authService
    }
    
    // MARK: - Apple Sign In (Native)
    // Apple Sign In is handled directly in AppleSignInButton using AuthenticationServices
    // This method is not needed as the button handles the flow
    
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
    func handleOAuthCallback(authorizationCode: String, provider: OAuthProviderType, idToken: String? = nil, email: String? = nil, name: String? = nil, userIdentifier: String? = nil) async throws -> AuthToken {
        // Prepare request with all available OAuth data
        var requestBody: [String: Any] = [
            "token": authorizationCode
        ]
        
        if let idToken = idToken {
            requestBody["idToken"] = idToken
        }
        
        if let email = email {
            requestBody["email"] = email
        }
        
        if let name = name {
            requestBody["name"] = name
        }
        
        if let userIdentifier = userIdentifier {
            requestBody["userIdentifier"] = userIdentifier
        }
        
        // Create encodable request
        struct OAuthRequestBody: Codable {
            let token: String
            let idToken: String?
            let email: String?
            let name: String?
            let userIdentifier: String?
        }
        
        let request = OAuthRequestBody(
            token: authorizationCode,
            idToken: idToken,
            email: email,
            name: name,
            userIdentifier: userIdentifier
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

