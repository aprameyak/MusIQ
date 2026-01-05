//
//  AppColors.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import SwiftUI

struct AppColors {
    // Background colors
    static let background = Color(hex: "#0a0118")
    static let cardBackground = Color(hex: "#1a0f2e")
    static let secondaryBackground = Color(hex: "#2d1b4e")
    
    // Primary colors
    static let primaryPurple = Color(hex: "#7c3aed")
    static let primaryGreen = Color(hex: "#06d6a0")
    
    // Accent colors
    static let accentPink = Color(hex: "#ff006e")
    static let accentYellow = Color(hex: "#fbbf24")
    
    // Text colors
    static let textPrimary = Color.white
    static let textSecondary = Color(hex: "#9ca3af")
    
    // Border colors
    static let borderPurple = Color(hex: "#7c3aed").opacity(0.2)
    static let borderGreen = Color(hex: "#06d6a0").opacity(0.2)
    
    // Notification colors
    static let notificationImpact = Color(hex: "#06d6a0")
    static let notificationBadge = Color(hex: "#fbbf24")
    static let notificationSocial = Color(hex: "#7c3aed")
    static let notificationTrending = Color(hex: "#ff006e")
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

