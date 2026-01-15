import Foundation
import SwiftUI
import Combine

class AuthViewModel: ObservableObject {
    @Published var username: String = ""
    @Published var password: String = ""
    @Published var confirmPassword: String = ""
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var isAuthenticated: Bool = false
    @Published var passwordErrors: [String] = []
    
    private let authService: AuthService
    
    init(authService: AuthService = AuthService()) {
        self.authService = authService
    }
    
    func validatePassword(_ password: String) -> [String] {
        var errors: [String] = []
        
        if password.count < 8 || password.count > 128 {
            errors.append("Password must be between 8 and 128 characters")
        }
        if !password.contains(where: { $0.isLowercase }) {
            errors.append("Password must contain at least one lowercase letter")
        }
        if !password.contains(where: { $0.isUppercase }) {
            errors.append("Password must contain at least one uppercase letter")
        }
        if !password.contains(where: { $0.isNumber }) {
            errors.append("Password must contain at least one number")
        }
        let specialChars = CharacterSet(charactersIn: "@$!%*?&")
        if !password.unicodeScalars.contains(where: { specialChars.contains($0) }) {
            errors.append("Password must contain at least one special character (@$!%*?&)")
        }
        
        return errors
    }
    
    func login() async {
        isLoading = true
        errorMessage = nil
        
        guard !username.isEmpty, !password.isEmpty else {
            errorMessage = "Username and password are required"
            isLoading = false
            return
        }
        
        do {
            let request = LoginRequest(username: username, password: password)
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
        passwordErrors = []
        
        if username.count < 3 || username.count > 30 {
            errorMessage = "Username must be between 3 and 30 characters"
            isLoading = false
            return
        }
        
        if !username.allSatisfy({ $0.isLetter || $0.isNumber || $0 == "_" }) {
            errorMessage = "Username can only contain letters, numbers, and underscores"
            isLoading = false
            return
        }
        
        if password != confirmPassword {
            errorMessage = "Passwords do not match"
            isLoading = false
            return
        }
        
        let pwdErrors = validatePassword(password)
        if !pwdErrors.isEmpty {
            passwordErrors = pwdErrors
            errorMessage = "Please fix password requirements"
            isLoading = false
            return
        }
        
        do {
            let request = SignupRequest(username: username, password: password)
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
    
    
    private func getAppState() -> AppState {
        
        return AppState.shared
    }
}
