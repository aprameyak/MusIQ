import SwiftUI
#if canImport(AppAuth)
import AppAuth
#endif

struct SpotifySignInButton: View {
    let onSuccess: (String) -> Void
    let onError: (Error) -> Void
    
    var body: some View {
        Button(action: {
            Task {
                await performSpotifySignIn()
            }
        }) {
            HStack {
                Image(systemName: "music.note")
                    .font(.system(size: 18))
                Text("Continue with Spotify")
                    .font(.system(size: 16, weight: .medium))
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(Color(red: 0.12, green: 0.73, blue: 0.33))
            .cornerRadius(AppStyles.cornerRadiusMedium)
        }
    }
    
    @MainActor
    private func performSpotifySignIn() async {
        #if canImport(AppAuth)
        
        guard let spotifyAuthURL = URL(string: "https://accounts.spotify.com/authorize"),
              let redirectURI = URL(string: "com.musiq://oauth/spotify/callback"),
              let tokenURL = URL(string: "https://accounts.spotify.com/api/token") else {
            onError(NetworkError.invalidURL)
            return
        }
        
        let clientID = ProcessInfo.processInfo.environment["SPOTIFY_CLIENT_ID"] ?? "YOUR_SPOTIFY_CLIENT_ID"
        
        let configuration = OIDServiceConfiguration(
            authorizationEndpoint: spotifyAuthURL,
            tokenEndpoint: tokenURL
        )
        
        do {
            
            let request = OIDAuthorizationRequest(
                configuration: configuration,
                clientId: clientID,
                scopes: ["user-read-email", "user-read-private"],
                redirectURL: redirectURI,
                responseType: OIDResponseTypeCode,
                additionalParameters: nil
            )
            
            guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                  let rootViewController = windowScene.windows.first?.rootViewController else {
                onError(NSError(domain: "SpotifySignIn", code: -1, userInfo: [NSLocalizedDescriptionKey: "Could not find root view controller"]))
                return
            }
            
            let authState = try await OIDAuthorizationService.present(
                request,
                presenting: rootViewController
            )
            
            guard let authResponse = authState.lastAuthorizationResponse,
                  let authorizationCode = authResponse.authorizationCode else {
                onError(NSError(domain: "SpotifySignIn", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to get authorization code"]))
                return
            }
            
            onSuccess(authorizationCode)
        } catch {
            onError(error)
        }
        #else
        onError(NSError(domain: "SpotifySignIn", code: -1, userInfo: [NSLocalizedDescriptionKey: "AppAuth not available. Add AppAuth-iOS package via SPM"]))
        #endif
    }
}

#Preview {
    SpotifySignInButton(
        onSuccess: { _ in },
        onError: { _ in }
    )
}
