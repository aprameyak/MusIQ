//
//  GoogleSignInButton.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import SwiftUI
#if canImport(AppAuth)
import AppAuth
#endif

struct GoogleSignInButton: View {
    let onSuccess: (String, String?) -> Void
    let onError: (Error) -> Void
    
    @State private var authState: OIDAuthState?
    
    var body: some View {
        Button(action: {
            Task {
                await performGoogleSignIn()
            }
        }) {
            HStack {
                Image(systemName: "globe")
                    .font(.system(size: 18))
                Text("Continue with Google")
                    .font(.system(size: 16, weight: .medium))
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(Color(red: 0.26, green: 0.52, blue: 0.96))
            .cornerRadius(AppStyles.cornerRadiusMedium)
        }
    }
    
    #if canImport(AppAuth)
    @MainActor
    private func performGoogleSignIn() async {
        guard let googleIssuer = URL(string: "https://accounts.google.com"),
              let redirectURI = URL(string: "com.musicapp://oauth/google/callback") else {
            onError(NetworkError.invalidURL)
            return
        }
        
        do {
            // Discover configuration
            let configuration = try await OIDAuthorizationService.discoverConfiguration(forIssuer: googleIssuer)
            
            // Get client ID from configuration (should be in environment)
            let clientID = ProcessInfo.processInfo.environment["GOOGLE_CLIENT_ID"] ?? "YOUR_GOOGLE_CLIENT_ID"
            
            // Create authorization request
            let request = OIDAuthorizationRequest(
                configuration: configuration,
                clientId: clientID,
                scopes: [OIDScopeOpenID, OIDScopeProfile, OIDScopeEmail],
                redirectURL: redirectURI,
                responseType: OIDResponseTypeCode,
                additionalParameters: nil
            )
            
            // Present authorization (this needs to be done in a view controller)
            // For SwiftUI, we'd need to use UIViewControllerRepresentable
            // This is a simplified version - full implementation would use OIDAuthState
            
            onError(NSError(domain: "GoogleSignIn", code: -1, userInfo: [NSLocalizedDescriptionKey: "Google Sign In requires full AppAuth implementation with view controller"]))
        } catch {
            onError(error)
        }
    }
    #else
    @MainActor
    private func performGoogleSignIn() async {
        onError(NSError(domain: "GoogleSignIn", code: -1, userInfo: [NSLocalizedDescriptionKey: "AppAuth not available. Add AppAuth-iOS package"]))
    }
    #endif
}

#Preview {
    GoogleSignInButton(
        onSuccess: { _, _ in },
        onError: { _ in }
    )
}

