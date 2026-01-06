import Foundation
import SwiftUI
import Combine

enum AppScreen {
    case splash
    case onboarding
    case authentication
    case main
}

enum ActiveTab: String, CaseIterable {
    case pulse = "pulse"
    case charts = "charts"
    case profile = "profile"
    case social = "social"
    case notifications = "notifications"
}

class AppState: ObservableObject {
    @Published var currentScreen: AppScreen = .splash
    @Published var activeTab: ActiveTab = .pulse
    @Published var hasCompletedOnboarding: Bool = false
    @Published var isAuthenticated: Bool = false
    @Published var currentUser: User?
    
    private let userDefaults = UserDefaults.standard
    private let onboardingKey = "hasCompletedOnboarding"
    private let authKey = "isAuthenticated"
    
    @MainActor
    init() {
        hasCompletedOnboarding = userDefaults.bool(forKey: onboardingKey)
        isAuthenticated = userDefaults.bool(forKey: authKey)
        
        if !hasCompletedOnboarding {
            currentScreen = .onboarding
        } else if !isAuthenticated {
            currentScreen = .authentication
        } else {
            currentScreen = .main
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
        currentScreen = .authentication
    }
    
    @MainActor
    func setActiveTab(_ tab: ActiveTab) {
        activeTab = tab
    }
}

extension AppState {
    static var shared: AppState = AppState()
}
