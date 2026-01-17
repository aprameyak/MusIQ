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
        
    }
}

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
