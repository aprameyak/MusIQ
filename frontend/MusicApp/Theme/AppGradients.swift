import SwiftUI

struct AppGradients {
    static let primary = AppColors.primary
    static let background = AppColors.background
    static let card = AppColors.cardBackground
    static let accent = AppColors.accent
    static let splash = AppColors.background
}

struct GradientBackground: ViewModifier {
    let color: Color
    
    func body(content: Content) -> some View {
        content
            .background(color)
    }
}

extension View {
    func gradientBackground(_ color: Color = AppColors.background) -> some View {
        modifier(GradientBackground(color: color))
    }
}
