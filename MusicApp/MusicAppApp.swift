//
//  MusicAppApp.swift
//  MusicApp
//
//  Created by Aprameya Kannan on 1/5/26.
//

import SwiftUI

@main
struct MusicAppApp: App {
    @StateObject private var appState = AppState.shared
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
                .onOpenURL { url in
                    // Handle OAuth callbacks
                    handleOAuthCallback(url: url)
                }
        }
    }
    
    private func handleOAuthCallback(url: URL) {
        // Parse OAuth callback URL
        // Format: com.musicapp://oauth/{provider}/callback?code=...
        let components = URLComponents(url: url, resolvingAgainstBaseURL: false)
        
        guard let host = url.host,
              let queryItems = components?.queryItems,
              let code = queryItems.first(where: { $0.name == "code" })?.value else {
            return
        }
        
        // Determine provider from URL path
        var provider: OAuthProviderType?
        if host.contains("google") {
            provider = .google
        } else if host.contains("spotify") {
            provider = .spotify
        } else if host.contains("apple") {
            provider = .apple
        }
        
        guard let provider = provider else {
            return
        }
        
        // Get ID token if available
        let idToken = queryItems.first(where: { $0.name == "id_token" })?.value
        
        // Post notification to handle OAuth callback
        NotificationCenter.default.post(
            name: NSNotification.Name("OAuthCallback"),
            object: nil,
            userInfo: [
                "provider": provider.rawValue,
                "code": code,
                "idToken": idToken as Any
            ]
        )
    }
}
