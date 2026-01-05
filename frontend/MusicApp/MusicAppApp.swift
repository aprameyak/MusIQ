import SwiftUI

@main
struct MusicAppApp: App {
    @StateObject private var appState = AppState.shared
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
                .onOpenURL { url in
                    
                    handleOAuthCallback(url: url)
                }
        }
    }
    
    private func handleOAuthCallback(url: URL) {
        
        let components = URLComponents(url: url, resolvingAgainstBaseURL: false)
        
        guard let host = url.host,
              let queryItems = components?.queryItems,
              let code = queryItems.first(where: { $0.name == "code" })?.value else {
            return
        }
        
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
        
        let idToken = queryItems.first(where: { $0.name == "id_token" })?.value
        
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
