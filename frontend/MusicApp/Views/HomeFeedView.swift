import SwiftUI

struct HomeFeedView: View {
    @StateObject private var viewModel = HomeFeedViewModel()
    @StateObject private var ratingViewModel = RatingViewModel()
    @StateObject private var createPostViewModel = CreatePostViewModel()
    @ObservedObject var appState = AppState.shared
    @State private var showCreatePostModal = false
    @State private var selectedUserId: String?
    @State private var showProfile = false
    @State private var showNotifications = false
    
    var body: some View {
        ZStack {
            AppColors.background
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                VStack(spacing: 16) {
                    HStack {
                        Text("MusIQ")
                            .font(.system(size: 32, weight: .bold))
                            .foregroundColor(AppColors.textPrimary)
                            .shadow(color: AppColors.primary.opacity(0.1), radius: 20)
                        
                        Spacer()
                        
                        Button(action: {
                            showNotifications = true
                        }) {
                            ZStack {
                                Image(systemName: "bell.fill")
                                    .font(.system(size: 22))
                                    .foregroundColor(AppColors.primary)
                            }
                            .padding(8)
                            .background(AppColors.secondaryBackground)
                            .clipShape(Circle())
                        }
                    }
                }
                .padding(.horizontal, AppStyles.paddingMedium)
                .padding(.top, AppStyles.paddingMedium)
                .padding(.bottom, AppStyles.paddingMedium)

                
                if viewModel.isLoading {
                    Spacer()
                    ProgressView()
                        .tint(AppColors.primary)
                    Spacer()
                } else if viewModel.feedItems.isEmpty {
                    Spacer()
                    VStack(spacing: 16) {
                        Image(systemName: "bubble.left.and.bubble.right")
                            .font(.system(size: 48))
                            .foregroundColor(AppColors.textSecondary)
                        
                        Text("No posts yet")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(AppColors.textSecondary)
                    }
                    Spacer()
                } else {
                    ScrollView {
                        LazyVStack(spacing: 16) {
                            ForEach(viewModel.feedItems) { post in
                                PostCardView(
                                    post: post,
                                    onUserTap: {
                                        selectedUserId = post.userId
                                        showProfile = true
                                    }
                                )
                                    .padding(.horizontal, AppStyles.paddingMedium)
                                    .onAppear {
                                        Task {
                                            await viewModel.loadMoreIfNeeded(currentItem: post)
                                        }
                                    }
                            }
                            
                            if viewModel.isLoadingMore {
                                ProgressView()
                                    .tint(AppColors.primary)
                                    .padding()
                            }
                        }
                        .padding(.top, 8)
                        .padding(.bottom, 20)
                    }
                }
            }
            
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    Button(action: {
                        showCreatePostModal = true
                    }) {
                        Image(systemName: "plus")
                            .font(.system(size: 24, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(width: 56, height: 56)
                            .background(AppColors.primary)
                            .clipShape(Circle())
                            .shadow(color: AppColors.primary.opacity(0.3), radius: 8, x: 0, y: 4)
                    }
                    .padding(.trailing, AppStyles.paddingLarge)
                    .padding(.bottom, AppStyles.paddingLarge)
                }
            }
        }
        .sheet(isPresented: $showCreatePostModal) {
            CreatePostModalView(
                viewModel: createPostViewModel,
                onClose: {
                    showCreatePostModal = false
                    createPostViewModel.reset()
                },
                onSubmit: {
                    Task {
                        await viewModel.refreshFeed()
                    }
                }
            )
        }
        .sheet(isPresented: $viewModel.showRatingModal) {
            if let item = viewModel.selectedItem {
                RatingModalView(
                    viewModel: ratingViewModel,
                    item: item,
                    onClose: {
                        viewModel.showRatingModal = false
                        ratingViewModel.reset()
                    },
                    onSubmit: { _ in
                        Task {
                            await viewModel.refreshFeed()
                        }
                    }
                )
            }
        }
        .sheet(isPresented: $showProfile) {
            if let userId = selectedUserId {
                ProfileView(userId: userId, appState: appState)
            }
        }
        .sheet(isPresented: $showNotifications) {
            NotificationsView(appState: appState)
        }
        .task {
            await viewModel.loadFeed()
        }
    }
}

#Preview {
    HomeFeedView()
}
