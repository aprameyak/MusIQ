import SwiftUI

struct AppGradients {
    
    static let primary = LinearGradient(
        colors: [AppColors.primaryPurple, AppColors.primaryGreen],
        startPoint: .leading,
        endPoint: .trailing
    )
    
    static let background = LinearGradient(
        colors: [
            AppColors.background,
            AppColors.cardBackground,
            AppColors.background
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    static let card = LinearGradient(
        colors: [
            AppColors.cardBackground,
            AppColors.secondaryBackground
        ],
        startPoint: .top,
        endPoint: .bottom
    )
    
    static let accent = LinearGradient(
        colors: [AppColors.accentPink, AppColors.primaryPurple],
        startPoint: .leading,
        endPoint: .trailing
    )
    
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
