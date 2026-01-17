import SwiftUI

struct AppStyles {
    
    static let cornerRadiusSmall: CGFloat = 12
    static let cornerRadiusMedium: CGFloat = 16
    static let cornerRadiusLarge: CGFloat = 24
    
    static let spacingSmall: CGFloat = 8
    static let spacingMedium: CGFloat = 16
    static let spacingLarge: CGFloat = 24
    
    static let paddingSmall: CGFloat = 12
    static let paddingMedium: CGFloat = 16
    static let paddingLarge: CGFloat = 24
    
    static let shadowColor = Color.black.opacity(0.1)
    static let shadowRadius: CGFloat = 8
    static let shadowOffset = CGSize(width: 0, height: 4)
}

struct CardStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(AppColors.cardBackground)
            .cornerRadius(AppStyles.cornerRadiusMedium)
            .overlay(
                RoundedRectangle(cornerRadius: AppStyles.cornerRadiusMedium)
                    .stroke(AppColors.border, lineWidth: 1)
            )
            .shadow(
                color: AppStyles.shadowColor,
                radius: AppStyles.shadowRadius,
                x: AppStyles.shadowOffset.width,
                y: AppStyles.shadowOffset.height
            )
    }
}

struct GradientButtonStyle: ButtonStyle {
    let isEnabled: Bool
    
    init(isEnabled: Bool = true) {
        self.isEnabled = isEnabled
    }
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(.horizontal, AppStyles.paddingMedium)
            .padding(.vertical, AppStyles.paddingSmall)
            .background(isEnabled ? AppColors.primary : AppColors.secondaryBackground)
            .foregroundColor(isEnabled ? .white : AppColors.textSecondary)
            .cornerRadius(AppStyles.cornerRadiusMedium)
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(.horizontal, AppStyles.paddingMedium)
            .padding(.vertical, AppStyles.paddingSmall)
            .background(AppColors.secondaryBackground)
            .foregroundColor(AppColors.textSecondary)
            .cornerRadius(AppStyles.cornerRadiusMedium)
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

extension View {
    func cardStyle() -> some View {
        modifier(CardStyle())
    }
    
    func gradientButton(isEnabled: Bool = true) -> some View {
        buttonStyle(GradientButtonStyle(isEnabled: isEnabled))
    }
    
    func secondaryButton() -> some View {
        buttonStyle(SecondaryButtonStyle())
    }
}
