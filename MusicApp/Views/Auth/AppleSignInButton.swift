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
                        
                        // Get user info (only available on first sign in)
                        let email = appleIDCredential.email
                        let fullName = appleIDCredential.fullName
                        let name = fullName != nil ? "\(fullName?.givenName ?? "") \(fullName?.familyName ?? "")".trimmingCharacters(in: .whitespaces) : nil
                        let userIdentifier = appleIDCredential.user
                        
                        // Store user identifier for future sign-ins
                        UserDefaults.standard.set(userIdentifier, forKey: "appleUserIdentifier")
                        
                        // Pass all info via notification for AuthViewModel to handle
                        NotificationCenter.default.post(
                            name: NSNotification.Name("AppleSignInSuccess"),
                            object: nil,
                            userInfo: [
                                "code": authorizationCode,
                                "idToken": identityToken,
                                "email": email as Any,
                                "name": name as Any,
                                "userIdentifier": userIdentifier
                            ]
                        )
                        
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

