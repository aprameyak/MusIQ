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
    
    @MainActor
    private func performGoogleSignIn() async {
        #if canImport(AppAuth)
        guard let googleIssuer = URL(string: "https://accounts.google.com"),
              let redirectURI = URL(string: "com.musicapp://oauth/google/callback") else {
            onError(NetworkError.invalidURL)
            return
        }
        
        do {
            // Discover configuration
            let configuration = try await OIDAuthorizationService.discoverConfiguration(forIssuer: googleIssuer)
            
            // Get client ID from configuration (should be in environment or config)
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
            
            // Get the current window scene to present auth
            guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                  let rootViewController = windowScene.windows.first?.rootViewController else {
                onError(NSError(domain: "GoogleSignIn", code: -1, userInfo: [NSLocalizedDescriptionKey: "Could not find root view controller"]))
                return
            }
            
            // Perform authorization
            let authState = try await OIDAuthorizationService.present(
                request,
                presenting: rootViewController
            )
            
            // Get authorization code
            guard let authResponse = authState.lastAuthorizationResponse,
                  let authorizationCode = authResponse.authorizationCode else {
                onError(NSError(domain: "GoogleSignIn", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to get authorization code"]))
                return
            }
            
            // Get ID token if available
            let idToken = authResponse.idToken
            
            onSuccess(authorizationCode, idToken)
        } catch {
            onError(error)
        }
        #else
        onError(NSError(domain: "GoogleSignIn", code: -1, userInfo: [NSLocalizedDescriptionKey: "AppAuth not available. Add AppAuth-iOS package via SPM"]))
        #endif
    }
}

// Helper extension for AppAuth async presentation
#if canImport(AppAuth)
extension OIDAuthorizationService {
    static func present(_ request: OIDAuthorizationRequest, presenting: UIViewController) async throws -> OIDAuthState {
        return try await withCheckedThrowingContinuation { continuation in
            let authFlow = OIDAuthState.authState(byPresenting: request, presenting: presenting) { authState, error in
                if let error = error {
                    continuation.resume(throwing: error)
                } else if let authState = authState {
                    continuation.resume(returning: authState)
                } else {
                    continuation.resume(throwing: NSError(domain: "OAuth", code: -1, userInfo: [NSLocalizedDescriptionKey: "Unknown error"]))
                }
            }
        }
    }
}
#endif

#Preview {
    GoogleSignInButton(
        onSuccess: { _, _ in },
        onError: { _ in }
    )
}
