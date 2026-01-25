import SwiftUI

struct MainAppView: View {
    @ObservedObject var appState: AppState
    
    var body: some View {
        TabView {
            HomeFeedView()
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
            
            GlobalSearchView(appState: appState)
                .tabItem {
                    Label("Search", systemImage: "magnifyingglass")
                }
            
            ProfileView(appState: appState)
                .tabItem {
                    Label("Profile", systemImage: "person.fill")
                }
        }
        .accentColor(AppColors.primary)
        .onAppear {
            let appearance = UITabBarAppearance()
            appearance.configureWithOpaqueBackground()
            appearance.backgroundColor = UIColor(AppColors.background)
            UITabBar.appearance().standardAppearance = appearance
            UITabBar.appearance().scrollEdgeAppearance = appearance
        }
    }
}

#Preview {
    MainAppView(appState: AppState())
}
