import SwiftUI

struct ProfileView: View {
    let userId: String?
    @ObservedObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    @StateObject private var viewModel: ProfileViewModel
    @StateObject private var editViewModel = ProfileEditViewModel()
    @State private var selectedTab = 0
    @State private var isLoggingOut = false
    @State private var showSuccessMessage = false
    
    init(userId: String? = nil, appState: AppState) {
        self.userId = userId
        self.appState = appState
        self._viewModel = StateObject(wrappedValue: ProfileViewModel(userId: userId))
    }
    
    private var isOwnProfile: Bool {
        userId == nil || userId == appState.currentUser?.id
    }
    
    var body: some View {
        ZStack {
            AppColors.background
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(isOwnProfile ? "Profile" : (viewModel.user?.username ?? "User"))
                            .font(.system(size: 32, weight: .bold))
                            .foregroundColor(AppColors.textPrimary)
                    }
                    
                    Spacer()
                    
                    if !isOwnProfile {
                        Button(action: {
                            Task {
                                if viewModel.user?.isFollowing == true {
                                    await viewModel.unfollow()
                                } else {
                                    await viewModel.follow()
                                }
                            }
                        }) {
                            Text(viewModel.user?.isFollowing == true ? "Unfollow" : "Follow")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(viewModel.user?.isFollowing == true ? AppColors.textPrimary : .white)
                                .padding(.horizontal, 20)
                                .padding(.vertical, 8)
                                .background(viewModel.user?.isFollowing == true ? AppColors.secondaryBackground : AppColors.primary)
                                .cornerRadius(20)
                        }
                    }
                    
                    if !isOwnProfile {
                        Button(action: { dismiss() }) {
                            Image(systemName: "xmark.circle.fill")
                                .font(.system(size: 24))
                                .foregroundColor(AppColors.textSecondary)
                        }
                    }
                }
                .padding(.horizontal, AppStyles.paddingMedium)
                .padding(.top, AppStyles.paddingMedium)

                ScrollView {
                    VStack(spacing: 24) {
                        VStack(spacing: 20) {
                            ZStack {
                                Circle()
                                    .fill(AppColors.primary)
                                    .frame(width: 80, height: 80)
                                
                                Text((viewModel.user?.username ?? appState.currentUser?.username ?? "U").prefix(1).uppercased())
                                    .font(.system(size: 32, weight: .bold))
                                    .foregroundColor(.white)
                            }
                            
                            VStack(spacing: 4) {
                                Text(viewModel.user?.username ?? appState.currentUser?.username ?? "User")
                                    .font(.system(size: 24, weight: .semibold))
                                    .foregroundColor(AppColors.textPrimary)
                                
                                Text("Member since \(viewModel.user?.createdAt.formatted(date: .abbreviated, time: .omitted) ?? appState.currentUser?.createdAt.formatted(date: .abbreviated, time: .omitted) ?? "")")
                                    .font(.system(size: 13))
                                    .foregroundColor(AppColors.textSecondary)
                            }
                            
                            HStack(spacing: 40) {
                                StatView(label: "Posts", value: "\(viewModel.user?.postsCount ?? 0)") {
                                    selectedTab = 0
                                }
                                StatView(label: "Followers", value: "\(viewModel.user?.followersCount ?? 0)") {
                                    selectedTab = 1
                                }
                                StatView(label: "Following", value: "\(viewModel.user?.followingCount ?? 0)") {
                                    selectedTab = 2
                                }
                            }
                        }
                        .padding(.top, 20)
                        
                        Picker("", selection: $selectedTab) {
                            Text("Posts").tag(0)
                            Text("Followers").tag(1)
                            Text("Following").tag(2)
                            if isOwnProfile {
                                Text("Settings").tag(3)
                            }
                        }
                        .pickerStyle(SegmentedPickerStyle())
                        .padding(.horizontal, AppStyles.paddingMedium)
                        
                        if selectedTab == 0 {
                            postsTab
                        } else if selectedTab == 1 {
                            followersTab
                        } else if selectedTab == 2 {
                            followingTab
                        } else if isOwnProfile {
                            settingsTab
                        }
                    }
                }
            }
        }
        .task {
            await viewModel.loadFullProfile()
            if isOwnProfile, let user = appState.currentUser {
                editViewModel.loadProfile(user: user)
            }
        }
    }
    
    private var postsTab: some View {
        VStack(spacing: 16) {
            if viewModel.isLoading {
                ProgressView().padding()
            } else if viewModel.posts.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "music.note.list")
                        .font(.system(size: 40))
                        .foregroundColor(AppColors.textSecondary)
                    Text("No posts yet")
                        .font(.system(size: 16))
                        .foregroundColor(AppColors.textSecondary)
                }
                .padding(.top, 40)
            } else {
                ForEach(viewModel.posts) { post in
                    PostCardView(post: post)
                        .padding(.horizontal, AppStyles.paddingMedium)
                }
            }
        }
    }

    private var followersTab: some View {
        VStack(spacing: 16) {
            if viewModel.isLoading {
                ProgressView().padding()
            } else if viewModel.followers.isEmpty {
                emptySocialState(icon: "person.2", title: "No followers yet")
            } else {
                VStack(spacing: 0) {
                    ForEach(viewModel.followers) { user in
                        SocialUserRow(user: user)
                    }
                }
                .padding(.horizontal, AppStyles.paddingMedium)
            }
        }
    }
    
    private var followingTab: some View {
        VStack(spacing: 16) {
            if viewModel.isLoading {
                ProgressView().padding()
            } else if viewModel.following.isEmpty {
                emptySocialState(icon: "person.badge.plus", title: "Not following anyone yet")
            } else {
                VStack(spacing: 0) {
                    ForEach(viewModel.following) { user in
                        SocialUserRow(user: user, unfollowAction: isOwnProfile ? {
                            Task {
                                await viewModel.unfollowUser(targetUserId: user.id)
                            }
                        } : nil)
                    }
                }
                .padding(.horizontal, AppStyles.paddingMedium)
            }
        }
    }
    
    private func emptySocialState(icon: String, title: String) -> some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 40))
                .foregroundColor(AppColors.textSecondary)
            Text(title)
                .font(.system(size: 16))
                .foregroundColor(AppColors.textSecondary)
        }
        .padding(.top, 40)
    }
    
    private var settingsTab: some View {
        VStack(spacing: 20) {
            VStack(alignment: .leading, spacing: 8) {
                Text("Email")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(AppColors.textSecondary)
                
                TextField("", text: $editViewModel.email)
                    .textFieldStyle(PlainTextFieldStyle())
                    .padding()
                    .background(AppColors.cardBackground)
                    .cornerRadius(AppStyles.cornerRadiusMedium)
                    .overlay(
                        RoundedRectangle(cornerRadius: AppStyles.cornerRadiusMedium)
                            .stroke(editViewModel.emailError != nil ? AppColors.accent : AppColors.border, lineWidth: 1)
                    )
                    .foregroundColor(AppColors.textPrimary)
            }
            
            VStack(alignment: .leading, spacing: 8) {
                Text("First Name")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(AppColors.textSecondary)
                
                TextField("", text: $editViewModel.firstName)
                    .textFieldStyle(PlainTextFieldStyle())
                    .padding()
                    .background(AppColors.cardBackground)
                    .cornerRadius(AppStyles.cornerRadiusMedium)
                    .overlay(
                        RoundedRectangle(cornerRadius: AppStyles.cornerRadiusMedium)
                            .stroke(editViewModel.firstNameError != nil ? AppColors.accent : AppColors.border, lineWidth: 1)
                    )
                    .foregroundColor(AppColors.textPrimary)
            }
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Last Name")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(AppColors.textSecondary)
                
                TextField("", text: $editViewModel.lastName)
                    .textFieldStyle(PlainTextFieldStyle())
                    .padding()
                    .background(AppColors.cardBackground)
                    .cornerRadius(AppStyles.cornerRadiusMedium)
                    .overlay(
                        RoundedRectangle(cornerRadius: AppStyles.cornerRadiusMedium)
                            .stroke(editViewModel.lastNameError != nil ? AppColors.accent : AppColors.border, lineWidth: 1)
                    )
                    .foregroundColor(AppColors.textPrimary)
            }
            
            Button(action: {
                Task {
                    if await editViewModel.updateProfile() {
                        showSuccessMessage = true
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                            showSuccessMessage = false
                        }
                        await viewModel.refreshProfile()
                    }
                }
            }) {
                if editViewModel.isUpdating {
                    ProgressView().tint(.white)
                } else {
                    Text("Save Changes").font(.system(size: 16, weight: .semibold))
                }
            }
            .gradientButton(isEnabled: editViewModel.canSave)
            .disabled(!editViewModel.canSave)
            
            Button(action: {
                Task {
                    isLoggingOut = true
                    try? await AuthService().logout()
                    appState.logout()
                    isLoggingOut = false
                }
            }) {
                Text("Log Out")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(AppColors.accent)
                    .cornerRadius(AppStyles.cornerRadiusMedium)
            }
            .padding(.top, 20)
        }
        .padding(.horizontal, AppStyles.paddingMedium)
    }
}

struct StatView: View {
    let label: String
    let value: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Text(value)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(AppColors.textPrimary)
                Text(label)
                    .font(.system(size: 12))
                    .foregroundColor(AppColors.textSecondary)
            }
        }
    }
}

struct SocialUserRow: View {
    let user: SocialUser
    var unfollowAction: (() -> Void)? = nil
    
    var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(AppColors.primary.opacity(0.1))
                .frame(width: 44, height: 44)
                .overlay(
                    Text(user.username.prefix(1).uppercased())
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(AppColors.primary)
                )
            
            VStack(alignment: .leading, spacing: 2) {
                Text(user.username)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(AppColors.textPrimary)
                
                Text(user.status.capitalized)
                    .font(.system(size: 12))
                    .foregroundColor(AppColors.textSecondary)
            }
            
            Spacer()
            
            if let unfollowAction = unfollowAction {
                Button(action: unfollowAction) {
                    Text("Unfollow")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(AppColors.textPrimary)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(AppColors.secondaryBackground)
                        .cornerRadius(15)
                }
            } else {
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(AppColors.textSecondary)
            }
        }
        .padding(.vertical, 12)
        .background(AppColors.background)
    }
}


#Preview {
    ProfileView(appState: AppState.shared)
}
