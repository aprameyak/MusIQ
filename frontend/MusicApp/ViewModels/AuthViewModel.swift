import Foundation
import SwiftUI
import Combine

class AuthViewModel: ObservableObject {
    @Published var email: String = ""
    @Published var username: String = ""
    @Published var password: String = ""
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var isAuthenticated: Bool = false
    
    private let authService: AuthService
    
    init(authService: AuthService = AuthService()) {
        self.authService = authService
    }
    
    func login() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let request = LoginRequest(email: email, password: password)
            let token = try await authService.login(request: request)
            
            KeychainHelper.store(token: token.accessToken, forKey: "accessToken")
            KeychainHelper.store(token: token.refreshToken, forKey: "refreshToken")
            
            let user = try await authService.getCurrentUser()
            isAuthenticated = true
            
            if let appState = try? await getAppState() {
                appState.authenticate(user: user)
            }
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func signup() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let request = SignupRequest(email: email, username: username, password: password)
            let token = try await authService.signup(request: request)
            
            KeychainHelper.store(token: token.accessToken, forKey: "accessToken")
            KeychainHelper.store(token: token.refreshToken, forKey: "refreshToken")
            
            let user = try await authService.getCurrentUser()
            isAuthenticated = true
            
            let appState = getAppState()
            appState.authenticate(user: user)
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func loginWithApple(authorizationCode: String, identityToken: String?, email: String? = nil, name: String? = nil, userIdentifier: String? = nil) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let oauthService = OAuthService(authService: authService)
            let token = try await oauthService.handleOAuthCallback(
                authorizationCode: authorizationCode,
                provider: .apple,
                idToken: identityToken,
                email: email,
                name: name,
                userIdentifier: userIdentifier
            )
            
            KeychainHelper.store(token: token.accessToken, forKey: "accessToken")
            KeychainHelper.store(token: token.refreshToken, forKey: "refreshToken")
            
            let user = try await authService.getCurrentUser()
            isAuthenticated = true
            
            let appState = getAppState()
            appState.authenticate(user: user)
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func loginWithGoogle(authorizationCode: String, idToken: String?) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let oauthService = OAuthService(authService: authService)
            let token = try await oauthService.handleOAuthCallback(
                authorizationCode: authorizationCode,
                provider: .google,
                idToken: idToken
            )
            
            KeychainHelper.store(token: token.accessToken, forKey: "accessToken")
            KeychainHelper.store(token: token.refreshToken, forKey: "refreshToken")
            
            let user = try await authService.getCurrentUser()
            isAuthenticated = true
            
            let appState = getAppState()
            appState.authenticate(user: user)
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func loginWithSpotify(authorizationCode: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let oauthService = OAuthService(authService: authService)
            let token = try await oauthService.handleOAuthCallback(
                authorizationCode: authorizationCode,
                provider: .spotify
            )
            
            KeychainHelper.store(token: token.accessToken, forKey: "accessToken")
            KeychainHelper.store(token: token.refreshToken, forKey: "refreshToken")
            
            let user = try await authService.getCurrentUser()
            isAuthenticated = true
            
            let appState = getAppState()
            appState.authenticate(user: user)
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    private func getAppState() -> AppState {
        
        return AppState.shared
    }
}
