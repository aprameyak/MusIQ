//
//  MainAppView.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import SwiftUI

struct MainAppView: View {
    @ObservedObject var appState: AppState
    
    var body: some View {
        ZStack {
            AppColors.background
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Content area
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
                
                // Bottom navigation
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

