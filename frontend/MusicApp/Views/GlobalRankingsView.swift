import SwiftUI

struct GlobalRankingsView: View {
    @StateObject private var viewModel = RankingViewModel()
    
    var body: some View {
        ZStack {
            AppColors.background
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                
                VStack(alignment: .leading, spacing: 8) {
                    Text("Global Charts")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundColor(AppColors.textPrimary)
                    
                    Text("Powered by your ratings")
                        .font(.system(size: 14))
                        .foregroundColor(AppColors.textSecondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, AppStyles.paddingMedium)
                .padding(.top, AppStyles.paddingLarge)
                .padding(.bottom, AppStyles.paddingMedium)
                
                HStack(spacing: 4) {
                    ForEach(RankingType.allCases, id: \.self) { type in
                        Button(action: {
                            viewModel.setType(type)
                        }) {
                            Text(type.displayName)
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(
                                    viewModel.activeType == type ?
                                    AppColors.textPrimary :
                                    AppColors.textSecondary
                                )
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 10)
                                .background(
                                    viewModel.activeType == type ?
                                    AppGradients.primary :
                                    Color.clear
                                )
                                .cornerRadius(AppStyles.cornerRadiusMedium)
                        }
                    }
                }
                .padding(4)
                .background(AppColors.cardBackground)
                .cornerRadius(AppStyles.cornerRadiusMedium)
                .overlay(
                    RoundedRectangle(cornerRadius: AppStyles.cornerRadiusMedium)
                        .stroke(AppColors.borderPurple, lineWidth: 1)
                )
                .padding(.horizontal, AppStyles.paddingMedium)
                .padding(.bottom, AppStyles.paddingMedium)
                
                if viewModel.isLoading {
                    Spacer()
                    ProgressView()
                        .tint(AppColors.primaryGreen)
                    Spacer()
                } else if viewModel.rankings.isEmpty {
                    Spacer()
                    VStack(spacing: 16) {
                        Image(systemName: "trophy")
                            .font(.system(size: 48))
                            .foregroundColor(AppColors.textSecondary)
                        
                        Text("No rankings available")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(AppColors.textSecondary)
                    }
                    Spacer()
                } else {
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            ForEach(viewModel.rankings) { ranking in
                                RankingRowView(ranking: ranking)
                                    .padding(.horizontal, AppStyles.paddingMedium)
                            }
                        }
                        .padding(.top, 8)
                        .padding(.bottom, 100)
                    }
                }
            }
        }
        .task {
            await viewModel.loadRankings()
        }
    }
}

struct RankingRowView: View {
    let ranking: RankingItem
    
    var body: some View {
        HStack(spacing: 16) {
            
            VStack(spacing: 4) {
                Text("\(ranking.rank)")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(
                        ranking.rank <= 3 ?
                        AppColors.accentYellow :
                        AppColors.textPrimary
                    )
                
                if ranking.change != 0 {
                    HStack(spacing: 2) {
                        Image(systemName: ranking.change > 0 ? "arrow.up" : "arrow.down")
                            .font(.system(size: 10))
                            .foregroundColor(
                                ranking.change > 0 ?
                                AppColors.primaryGreen :
                                AppColors.accentPink
                            )
                        
                        Text("\(abs(ranking.change))")
                            .font(.system(size: 10))
                            .foregroundColor(
                                ranking.change > 0 ?
                                AppColors.primaryGreen :
                                AppColors.accentPink
                            )
                    }
                }
            }
            .frame(width: 40)
            
            ZStack(alignment: .topTrailing) {
                AsyncImage(url: URL(string: ranking.imageUrl)) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle()
                        .fill(AppColors.secondaryBackground)
                }
                .frame(width: 64, height: 64)
                .cornerRadius(AppStyles.cornerRadiusMedium)
                .clipped()
                
                if ranking.isNew {
                    ZStack {
                        Circle()
                            .fill(AppColors.accentPink)
                            .frame(width: 20, height: 20)
                        
                        Image(systemName: "flame.fill")
                            .font(.system(size: 10))
                            .foregroundColor(.white)
                    }
                    .offset(x: 4, y: -4)
                }
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(ranking.title)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(AppColors.textPrimary)
                    .lineLimit(1)
                
                Text(ranking.artist)
                    .font(.system(size: 14))
                    .foregroundColor(AppColors.textSecondary)
                    .lineLimit(1)
                
                HStack(spacing: 8) {
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .font(.system(size: 12))
                            .foregroundColor(AppColors.accentYellow)
                        
                        Text(String(format: "%.1f", ranking.rating))
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(AppColors.textPrimary)
                    }
                    
                    Text("(\(ranking.ratingCount.formatted()))")
                        .font(.system(size: 12))
                        .foregroundColor(AppColors.textSecondary)
                }
            }
            
            Spacer()
        }
        .padding(AppStyles.paddingMedium)
        .cardStyle()
    }
}

#Preview {
    GlobalRankingsView()
}
