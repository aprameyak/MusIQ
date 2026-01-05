//
//  AppState.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import Foundation
import SwiftUI

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

@MainActor
class AppState: ObservableObject {
    @Published var currentScreen: AppScreen = .splash
    @Published var activeTab: ActiveTab = .pulse
    @Published var hasCompletedOnboarding: Bool = false
    @Published var isAuthenticated: Bool = false
    @Published var currentUser: User?
    
    private let userDefaults = UserDefaults.standard
    private let onboardingKey = "hasCompletedOnboarding"
    private let authKey = "isAuthenticated"
    
    init() {
        // Load persisted state
        hasCompletedOnboarding = userDefaults.bool(forKey: onboardingKey)
        isAuthenticated = userDefaults.bool(forKey: authKey)
        
        // Determine initial screen
        if !hasCompletedOnboarding {
            currentScreen = .onboarding
        } else if !isAuthenticated {
            currentScreen = .authentication
        } else {
            currentScreen = .main
        }
    }
    
    func completeOnboarding() {
        hasCompletedOnboarding = true
        userDefaults.set(true, forKey: onboardingKey)
        currentScreen = .authentication
    }
    
    func authenticate(user: User) {
        isAuthenticated = true
        currentUser = user
        userDefaults.set(true, forKey: authKey)
        currentScreen = .main
    }
    
    func logout() {
        isAuthenticated = false
        currentUser = nil
        userDefaults.set(false, forKey: authKey)
        currentScreen = .authentication
    }
    
    func setActiveTab(_ tab: ActiveTab) {
        activeTab = tab
    }
}

// Extension to make AppState accessible
extension AppState {
    static var shared: AppState = AppState()
}

