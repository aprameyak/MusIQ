import SwiftUI

struct AppColors {
    static let background = Color(hex: "#F5F8FC")
    static let cardBackground = Color(hex: "#FFFFFF")
    static let secondaryBackground = Color(hex: "#EAF1F8")
    
    static let primary = Color(hex: "#35516D")
    static let secondary = Color(hex: "#7A93AC")
    
    static let accent = Color(hex: "#35516D")
    static let accentLight = Color(hex: "#D0DEEC")
    
    static let textPrimary = Color(hex: "#0F2A44")
    static let textSecondary = Color(hex: "#7A93AC")
    
    static let border = Color(hex: "#D6E0EB")
    static let borderLight = Color(hex: "#D0DEEC")
    
    static let notificationImpact = Color(hex: "#35516D")
    static let notificationBadge = Color(hex: "#7A93AC")
    static let notificationSocial = Color(hex: "#35516D")
    static let notificationTrending = Color(hex: "#7A93AC")
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: 
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: 
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: 
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
