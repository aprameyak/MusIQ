import SwiftUI

struct GlobalSearchView: View {
    @ObservedObject var appState: AppState
    @StateObject private var userSearchViewModel = UserSearchViewModel()
    @State private var selectedUserId: String?
    @State private var showProfile = false
    
    var body: some View {
        VStack(spacing: 0) {
            // Custom Header
            VStack(spacing: 16) {
                Text("Search Users")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(AppColors.textPrimary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(AppColors.textSecondary)
                    
                    TextField("Search for users...", text: $userSearchViewModel.searchQuery)
                        .textFieldStyle(.plain)
                        .foregroundColor(AppColors.textPrimary)
                        .onChange(of: userSearchViewModel.searchQuery) { _, _ in
                            userSearchViewModel.search()
                        }
                    
                    if !userSearchViewModel.searchQuery.isEmpty {
                        Button(action: {
                            userSearchViewModel.searchQuery = ""
                            userSearchViewModel.users = []
                        }) {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(AppColors.textSecondary)
                        }
                    }
                }
                .padding(12)
                .background(AppColors.secondaryBackground)
                .cornerRadius(AppStyles.cornerRadiusMedium)
            }
            .padding(.horizontal, AppStyles.paddingMedium)
            .padding(.top, AppStyles.paddingMedium)
            .padding(.bottom, AppStyles.paddingMedium)
            
            userSearchResults
        }
        .background(AppColors.background)
        .sheet(isPresented: $showProfile) {
            if let userId = selectedUserId {
                ProfileView(userId: userId, appState: appState)
            }
        }
    }
    
    private var userSearchResults: some View {
        Group {
            if userSearchViewModel.isSearching {
                Spacer(); ProgressView().tint(AppColors.primary); Spacer()
            } else if userSearchViewModel.users.isEmpty && !userSearchViewModel.searchQuery.isEmpty {
                emptyState(icon: "person.slash", title: "No users found")
            } else if userSearchViewModel.searchQuery.isEmpty {
                emptyState(icon: "person.2", title: "Search for friends to follow")
            } else {
                List(userSearchViewModel.users) { user in
                    Button(action: {
                        selectedUserId = user.id
                        showProfile = true
                    }) {
                        UserSearchResultCard(user: user)
                    }
                    .listRowBackground(Color.clear)
                    .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                    .listRowSeparator(.hidden)
                }
                .listStyle(.plain)
            }
        }
    }
    
    private func emptyState(icon: String, title: String) -> some View {
        VStack {
            Spacer()
            VStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.system(size: 48))
                    .foregroundColor(AppColors.textSecondary)
                Text(title)
                    .font(.system(size: 16))
                    .foregroundColor(AppColors.textSecondary)
                    .multilineTextAlignment(.center)
            }
            Spacer()
        }
    }
}
