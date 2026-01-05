//
//  AppGradients.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import SwiftUI

struct AppGradients {
    // Primary gradient (purple to green)
    static let primary = LinearGradient(
        colors: [AppColors.primaryPurple, AppColors.primaryGreen],
        startPoint: .leading,
        endPoint: .trailing
    )
    
    // Background gradient
    static let background = LinearGradient(
        colors: [
            AppColors.background,
            AppColors.cardBackground,
            AppColors.background
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    // Card gradient
    static let card = LinearGradient(
        colors: [
            AppColors.cardBackground,
            AppColors.secondaryBackground
        ],
        startPoint: .top,
        endPoint: .bottom
    )
    
    // Accent gradient (pink to purple)
    static let accent = LinearGradient(
        colors: [AppColors.accentPink, AppColors.primaryPurple],
        startPoint: .leading,
        endPoint: .trailing
    )
    
    // Radial gradient for splash screen
    static let splash = RadialGradient(
        colors: [
            AppColors.primaryPurple.opacity(0.3),
            AppColors.primaryGreen.opacity(0.2),
            AppColors.background
        ],
        center: .center,
        startRadius: 50,
        endRadius: 200
    )
}

// View modifier for gradient backgrounds
struct GradientBackground: ViewModifier {
    let gradient: LinearGradient
    
    func body(content: Content) -> some View {
        content
            .background(gradient)
    }
}

extension View {
    func gradientBackground(_ gradient: LinearGradient = AppGradients.background) -> some View {
        modifier(GradientBackground(gradient: gradient))
    }
}

