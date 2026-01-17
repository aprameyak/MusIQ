import Foundation
import SwiftUI
import Combine

enum AppScreen {
    case splash
    case onboarding
    case authentication
    case main
}

class AppState: ObservableObject {
    @Published var currentScreen: AppScreen = .splash
    @Published var hasCompletedOnboarding: Bool = false
    @Published var isAuthenticated: Bool = false
    @Published var currentUser: User?
    
    private let userDefaults = UserDefaults.standard
    private let onboardingKey = "hasCompletedOnboarding"
    private let authKey = "isAuthenticated"
    
    @MainActor
    init() {
        hasCompletedOnboarding = userDefaults.bool(forKey: onboardingKey)
        
        let hasAccessToken = KeychainHelper.retrieve(forKey: "accessToken") != nil
        isAuthenticated = hasAccessToken
        
        if !hasAccessToken {
            userDefaults.set(false, forKey: authKey)
        }
        
        if !hasCompletedOnboarding {
            currentScreen = .onboarding
        } else if !isAuthenticated {
            currentScreen = .authentication
        } else {
            Task {
                await verifyAuthentication()
            }
            currentScreen = .main
        }
    }
    
    @MainActor
    private func verifyAuthentication() async {
        let authService = AuthService()
        do {
            let user = try await authService.getCurrentUser()
            self.currentUser = user
            self.isAuthenticated = true
            userDefaults.set(true, forKey: authKey)
        } catch {
            self.isAuthenticated = false
            self.currentUser = nil
            userDefaults.set(false, forKey: authKey)
            KeychainHelper.clearAll()
            self.currentScreen = .authentication
        }
    }
    
    @MainActor
    func completeOnboarding() {
        hasCompletedOnboarding = true
        userDefaults.set(true, forKey: onboardingKey)
        currentScreen = .authentication
    }
    
    @MainActor
    func authenticate(user: User) {
        isAuthenticated = true
        currentUser = user
        userDefaults.set(true, forKey: authKey)
        currentScreen = .main
    }
    
    @MainActor
    func logout() {
        isAuthenticated = false
        currentUser = nil
        userDefaults.set(false, forKey: authKey)
        KeychainHelper.clearAll()
        currentScreen = .authentication
    }
}

extension AppState {
    static var shared: AppState = AppState()
}
