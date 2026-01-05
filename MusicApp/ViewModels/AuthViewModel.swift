//
//  AuthViewModel.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import Foundation
import SwiftUI

@MainActor
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
            
            // Store tokens securely
            KeychainHelper.store(token: token.accessToken, forKey: "accessToken")
            KeychainHelper.store(token: token.refreshToken, forKey: "refreshToken")
            
            // Fetch user profile
            let user = try await authService.getCurrentUser()
            isAuthenticated = true
            
            // Update app state
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
            
            // Store tokens securely
            KeychainHelper.store(token: token.accessToken, forKey: "accessToken")
            KeychainHelper.store(token: token.refreshToken, forKey: "refreshToken")
            
            // Fetch user profile
            let user = try await authService.getCurrentUser()
            isAuthenticated = true
            
            // Update app state
            let appState = getAppState()
            appState.authenticate(user: user)
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func loginWithApple() async {
        // TODO: Implement Apple Sign In
        errorMessage = "Apple Sign In not yet implemented"
    }
    
    func loginWithGoogle() async {
        // TODO: Implement Google Sign In
        errorMessage = "Google Sign In not yet implemented"
    }
    
    func loginWithSpotify() async {
        // TODO: Implement Spotify OAuth
        errorMessage = "Spotify OAuth not yet implemented"
    }
    
    private func getAppState() -> AppState {
        // This would typically be injected via environment
        // For now, we'll access it through a shared instance
        return AppState.shared
    }
}

