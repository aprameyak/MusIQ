import SwiftUI

struct HomeFeedView: View {
    @StateObject private var viewModel = HomeFeedViewModel()
    @StateObject private var ratingViewModel = RatingViewModel()
    
    var body: some View {
        ZStack {
            AppColors.background
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                
                VStack(spacing: 16) {
                    HStack {
                        Text("Pulse")
                            .font(.system(size: 32, weight: .bold))
                            .foregroundColor(AppColors.textPrimary)
                            .shadow(color: AppColors.primaryGreen.opacity(0.3), radius: 20)
                        
                        Spacer()
                        
                        Button(action: {}) {
                            Image(systemName: "line.3.horizontal.decrease")
                                .font(.system(size: 20))
                                .foregroundColor(AppColors.textSecondary)
                                .frame(width: 40, height: 40)
                                .background(AppColors.cardBackground)
                                .cornerRadius(AppStyles.cornerRadiusMedium)
                                .overlay(
                                    RoundedRectangle(cornerRadius: AppStyles.cornerRadiusMedium)
                                        .stroke(AppColors.borderPurple, lineWidth: 1)
                                )
                        }
                    }
                    
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(FeedFilter.allCases, id: \.self) { filter in
                                Button(action: {
                                    viewModel.setFilter(filter)
                                }) {
                                    HStack(spacing: 6) {
                                        Image(systemName: iconName(for: filter))
                                            .font(.system(size: 14))
                                        
                                        Text(filter.displayName)
                                            .font(.system(size: 14, weight: .medium))
                                    }
                                    .foregroundColor(
                                        viewModel.activeFilter == filter ?
                                        AppColors.textPrimary :
                                        AppColors.textSecondary
                                    )
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 8)
                                    .background(
                                        viewModel.activeFilter == filter ?
                                        AppGradients.primary :
                                        LinearGradient(
                                            colors: [AppColors.cardBackground],
                                            startPoint: .leading,
                                            endPoint: .trailing
                                        )
                                    )
                                    .cornerRadius(AppStyles.cornerRadiusMedium)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: AppStyles.cornerRadiusMedium)
                                            .stroke(
                                                viewModel.activeFilter == filter ?
                                                Color.clear :
                                                AppColors.borderPurple,
                                                lineWidth: 1
                                            )
                                    )
                                }
                            }
                        }
                        .padding(.horizontal, 4)
                    }
                }
                .padding(.horizontal, AppStyles.paddingMedium)
                .padding(.top, AppStyles.paddingLarge)
                .padding(.bottom, AppStyles.paddingMedium)
                
                if viewModel.isLoading {
                    Spacer()
                    ProgressView()
                        .tint(AppColors.primaryGreen)
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
                                    },
                                    onFavorite: {},
                                    onComment: {}
                                )
                                .padding(.horizontal, AppStyles.paddingMedium)
                            }
                        }
                        .padding(.top, 8)
                        .padding(.bottom, 100)
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
                    onSubmit: { rating, tags in
                        
                        Task {
                            await viewModel.refreshFeed()
                        }
                    }
                )
            }
        }
        .task {
            await viewModel.loadFeed()
        }
    }
    
    private func iconName(for filter: FeedFilter) -> String {
        switch filter {
        case .trending: return "arrow.up"
        case .forYou: return "sparkles"
        case .following: return "person.2.fill"
        }
    }
}

#Preview {
    HomeFeedView()
}
