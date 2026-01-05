//
//  AppleSignInButton.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import SwiftUI
import AuthenticationServices

struct AppleSignInButton: View {
    let onSuccess: (String, String?) -> Void
    let onError: (Error) -> Void
    
    var body: some View {
        SignInWithAppleButton(
            onRequest: { request in
                request.requestedScopes = [.fullName, .email]
            },
            onCompletion: { result in
                switch result {
                case .success(let authorization):
                    switch authorization.credential {
                    case let appleIDCredential as ASAuthorizationAppleIDCredential:
                        // Get identity token
                        guard let identityTokenData = appleIDCredential.identityToken,
                              let identityToken = String(data: identityTokenData, encoding: .utf8) else {
                            onError(NSError(domain: "AppleSignIn", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to get identity token"]))
                            return
                        }
                        
                        // Get authorization code
                        guard let authorizationCodeData = appleIDCredential.authorizationCode,
                              let authorizationCode = String(data: authorizationCodeData, encoding: .utf8) else {
                            onError(NSError(domain: "AppleSignIn", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to get authorization code"]))
                            return
                        }
                        
                        onSuccess(authorizationCode, identityToken)
                        
                    default:
                        onError(NSError(domain: "AppleSignIn", code: -1, userInfo: [NSLocalizedDescriptionKey: "Unknown credential type"]))
                    }
                case .failure(let error):
                    onError(error)
                }
            }
        )
        .signInWithAppleButtonStyle(.black)
        .frame(height: 50)
        .cornerRadius(AppStyles.cornerRadiusMedium)
    }
}

#Preview {
    AppleSignInButton(
        onSuccess: { _, _ in },
        onError: { _ in }
    )
}

