import SwiftUI

struct HomeFeedView: View {
    @StateObject private var viewModel = HomeFeedViewModel()
    @StateObject private var ratingViewModel = RatingViewModel()
    @ObservedObject var appState = AppState.shared
    @State private var showProfile = false
    
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
                            showProfile = true
                        }) {
                            Image(systemName: "person.circle.fill")
                                .font(.system(size: 24))
                                .foregroundColor(AppColors.textSecondary)
                                .frame(width: 40, height: 40)
                        }
                    }
                }
                .padding(.horizontal, AppStyles.paddingMedium)
                .padding(.top, AppStyles.paddingLarge)
                .padding(.bottom, AppStyles.paddingMedium)
                
                if viewModel.isLoading {
                    Spacer()
                    ProgressView()
                        .tint(AppColors.primary)
                    Spacer()
                } else if viewModel.feedItems.isEmpty {
                    Spacer()
                    VStack(spacing: 16) {
                        Image(systemName: "music.note.list")
                            .font(.system(size: 48))
                            .foregroundColor(AppColors.textSecondary)
                        
                        Text("No music found")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(AppColors.textSecondary)
                    }
                    Spacer()
                } else {
                    ScrollView {
                        LazyVStack(spacing: 16) {
                            ForEach(viewModel.feedItems) { item in
                                FeedCardView(
                                    item: item,
                                    onRate: {
                                        viewModel.selectItemForRating(item)
                                    }
                                )
                                .padding(.horizontal, AppStyles.paddingMedium)
                                .onAppear {
                                    Task {
                                        await viewModel.loadMoreIfNeeded(currentItem: item)
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
                    onSubmit: { rating in
                        Task {
                            await viewModel.refreshFeed()
                        }
                    }
                )
            }
        }
        .sheet(isPresented: $showProfile) {
            ProfileView(appState: appState)
        }
        .task {
            await viewModel.loadFeed()
        }
    }
}

#Preview {
    HomeFeedView()
}
