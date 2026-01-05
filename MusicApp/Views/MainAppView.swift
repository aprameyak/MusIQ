import SwiftUI

struct MainAppView: View {
    @ObservedObject var appState: AppState
    
    var body: some View {
        ZStack {
            AppColors.background
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                
                Group {
                    switch appState.activeTab {
                    case .pulse:
                        HomeFeedView()
                    case .charts:
                        GlobalRankingsView()
                    case .profile:
                        TasteProfileView()
                    case .social:
                        SocialView()
                    case .notifications:
                        NotificationsView()
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                
                BottomNavView(
                    activeTab: appState.activeTab,
                    onTabChange: { tab in
                        appState.setActiveTab(tab)
                    }
                )
            }
        }
    }
}

#Preview {
    MainAppView(appState: AppState())
}
