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
        
    }
}

#Preview {
    SpotifySignInButton(
        onSuccess: { _ in },
        onError: { _ in }
    )
}
