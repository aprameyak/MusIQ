import SwiftUI

struct UserSearchView: View {
    @ObservedObject var appState: AppState
    @StateObject private var viewModel = UserSearchViewModel()
    @Environment(\.dismiss) var dismiss
    @State private var selectedUserId: String?
    @State private var showProfile = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                HStack {
                    TextField("Search users...", text: $viewModel.searchQuery)
                        .textFieldStyle(.plain)
                        .padding(AppStyles.paddingMedium)
                        .background(AppColors.secondaryBackground)
                        .cornerRadius(AppStyles.cornerRadiusMedium)
                        .onChange(of: viewModel.searchQuery) { _, _ in
                            viewModel.search()
                        }
                    
                    if !viewModel.searchQuery.isEmpty {
                        Button(action: {
                            viewModel.searchQuery = ""
                            viewModel.users = []
                        }) {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(AppColors.textSecondary)
                        }
                    }
                }
                .padding(AppStyles.paddingMedium)
                
                if viewModel.isSearching {
                    Spacer()
                    ProgressView()
                    Spacer()
                } else if viewModel.users.isEmpty && !viewModel.searchQuery.isEmpty {
                    Spacer()
                    VStack(spacing: 12) {
                        Image(systemName: "person.badge.minus")
                            .font(.system(size: 40))
                            .foregroundColor(AppColors.textSecondary)
                        Text("No users found")
                            .foregroundColor(AppColors.textSecondary)
                    }
                    Spacer()
                } else {
                    List(viewModel.users) { user in
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
            .background(AppColors.background)
            .navigationTitle("Search Users")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .sheet(isPresented: $showProfile) {
                if let userId = selectedUserId {
                    ProfileView(userId: userId, appState: appState)
                }
            }
        }
    }
}

struct UserSearchResultCard: View {
    let user: UserSummary
    
    var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(AppColors.primary.opacity(0.2))
                .frame(width: 44, height: 44)
                .overlay(
                    Text(user.username.prefix(1).uppercased())
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(AppColors.primary)
                )
            
            VStack(alignment: .leading, spacing: 4) {
                Text(user.username)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(AppColors.textPrimary)
                Text(user.email)
                    .font(.system(size: 12))
                    .foregroundColor(AppColors.textSecondary)
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .foregroundColor(AppColors.textSecondary)
        }
        .padding(12)
        .background(AppColors.cardBackground)
        .cornerRadius(AppStyles.cornerRadiusMedium)
        .overlay(
            RoundedRectangle(cornerRadius: AppStyles.cornerRadiusMedium)
                .stroke(AppColors.border, lineWidth: 1)
        )
    }
}
