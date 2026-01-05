import SwiftUI

struct BottomNavView: View {
    let activeTab: ActiveTab
    let onTabChange: (ActiveTab) -> Void
    
    var body: some View {
        HStack(spacing: 0) {
            ForEach(ActiveTab.allCases, id: \.self) { tab in
                Button(action: {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                        onTabChange(tab)
                    }
                }) {
                    VStack(spacing: 4) {
                        Image(systemName: iconName(for: tab))
                            .font(.system(size: 24))
                            .foregroundColor(
                                activeTab == tab ?
                                AppColors.primaryGreen :
                                AppColors.textSecondary
                            )
                        
                        Text(tabLabel(for: tab))
                            .font(.system(size: 10))
                            .foregroundColor(
                                activeTab == tab ?
                                AppColors.primaryGreen :
                                AppColors.textSecondary
                            )
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                    .background(
                        Group {
                            if activeTab == tab {
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(
                                        LinearGradient(
                                            colors: [
                                                AppColors.primaryPurple.opacity(0.2),
                                                AppColors.primaryGreen.opacity(0.2)
                                            ],
                                            startPoint: .leading,
                                            endPoint: .trailing
                                        )
                                    )
                            }
                        }
                    )
                }
                .buttonStyle(PlainButtonStyle())
            }
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 8)
        .background(AppColors.cardBackground)
        .overlay(
            Rectangle()
                .frame(height: 1)
                .foregroundColor(AppColors.borderPurple),
            alignment: .top
        )
        .overlay(
            Group {
                if let activeIndex = ActiveTab.allCases.firstIndex(of: activeTab) {
                    GeometryReader { geometry in
                        let tabWidth = geometry.size.width / CGFloat(ActiveTab.allCases.count)
                        let xOffset = CGFloat(activeIndex) * tabWidth + tabWidth / 2 - 16
                        
                        Capsule()
                            .fill(AppGradients.primary)
                            .frame(width: 32, height: 2)
                            .offset(x: xOffset, y: -1)
                            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: activeTab)
                    }
                }
            },
            alignment: .top
        )
    }
    
    private func iconName(for tab: ActiveTab) -> String {
        switch tab {
        case .pulse: return "flame.fill"
        case .charts: return "trophy.fill"
        case .profile: return "person.fill"
        case .social: return "person.2.fill"
        case .notifications: return "bell.fill"
        }
    }
    
    private func tabLabel(for tab: ActiveTab) -> String {
        switch tab {
        case .pulse: return "Pulse"
        case .charts: return "Charts"
        case .profile: return "Profile"
        case .social: return "Social"
        case .notifications: return "Alerts"
        }
    }
}

#Preview {
    BottomNavView(activeTab: .pulse, onTabChange: { _ in })
        .background(AppColors.background)
}
