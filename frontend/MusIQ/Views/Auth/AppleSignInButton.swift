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
