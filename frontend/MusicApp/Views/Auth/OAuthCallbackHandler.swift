import SwiftUI
import Combine

struct OAuthCallbackHandler: ViewModifier {
    @ObservedObject var viewModel: AuthViewModel
    @State private var cancellables = Set<AnyCancellable>()
    
    func body(content: Content) -> some View {
        content
            .onAppear {
                
                NotificationCenter.default.publisher(for: NSNotification.Name("OAuthCallback"))
                    .sink { notification in
                        guard let userInfo = notification.userInfo,
                              let providerString = userInfo["provider"] as? String,
                              let code = userInfo["code"] as? String else {
                            return
                        }
                        
                        let idToken = userInfo["idToken"] as? String
                        
                        Task {
                            switch providerString {
                            case "apple":
                                let email = userInfo["email"] as? String
                                let name = userInfo["name"] as? String
                                let userIdentifier = userInfo["userIdentifier"] as? String
                                await viewModel.loginWithApple(
                                    authorizationCode: code,
                                    identityToken: idToken,
                                    email: email,
                                    name: name,
                                    userIdentifier: userIdentifier
                                )
                            case "google":
                                let email = userInfo["email"] as? String
                                let name = userInfo["name"] as? String
                                await viewModel.loginWithGoogle(
                                    authorizationCode: code,
                                    idToken: idToken
                                )
                            case "spotify":
                                await viewModel.loginWithSpotify(
                                    authorizationCode: code
                                )
                            default:
                                break
                            }
                        }
                    }
                    .store(in: &cancellables)
                
                NotificationCenter.default.publisher(for: NSNotification.Name("AppleSignInSuccess"))
                    .sink { notification in
                        guard let userInfo = notification.userInfo,
                              let code = userInfo["code"] as? String else {
                            return
                        }
                        
                        let idToken = userInfo["idToken"] as? String
                        let email = userInfo["email"] as? String
                        let name = userInfo["name"] as? String
                        let userIdentifier = userInfo["userIdentifier"] as? String
                        
                        Task {
                            await viewModel.loginWithApple(
                                authorizationCode: code,
                                identityToken: idToken,
                                email: email,
                                name: name,
                                userIdentifier: userIdentifier
                            )
                        }
                    }
                    .store(in: &cancellables)
            }
    }
}

extension View {
    func handleOAuthCallbacks(viewModel: AuthViewModel) -> some View {
        modifier(OAuthCallbackHandler(viewModel: viewModel))
    }
}
