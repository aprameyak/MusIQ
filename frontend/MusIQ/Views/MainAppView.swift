import SwiftUI

struct MainAppView: View {
    @ObservedObject var appState: AppState
    
    var body: some View {
        ZStack {
            AppColors.background
                .ignoresSafeArea()
            
            HomeFeedView()
        }
    }
}

#Preview {
    MainAppView(appState: AppState())
}
