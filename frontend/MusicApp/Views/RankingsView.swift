import SwiftUI

struct RankingsView: View {
    @StateObject private var viewModel = RankingViewModel()
    
    var body: some View {
        VStack(spacing: 0) {
            // Type Selector
            Picker("Ranking Type", selection: $viewModel.activeType) {
                ForEach(RankingType.allCases, id: \.self) { type in
                    Text(type.displayName).tag(type)
                }
            }
            .pickerStyle(.segmented)
            .padding(.horizontal, AppStyles.paddingMedium)
            .padding(.bottom, AppStyles.paddingSmall)
            .onChange(of: viewModel.activeType) { _, newValue in
                viewModel.setType(newValue)
            }
            
            if viewModel.isLoading {
                Spacer()
                ProgressView()
                    .tint(AppColors.primary)
                Spacer()
            } else if viewModel.rankings.isEmpty {
                Spacer()
                VStack(spacing: 12) {
                    Image(systemName: "chart.bar.xaxis")
                        .font(.system(size: 40))
                        .foregroundColor(AppColors.textSecondary)
                    Text("No rankings available")
                        .foregroundColor(AppColors.textSecondary)
                }
                Spacer()
            } else {
                List(viewModel.rankings) { item in
                    RankingRow(item: item)
                        .listRowBackground(Color.clear)
                        .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                        .listRowSeparator(.hidden)
                }
                .listStyle(.plain)
                .refreshable {
                    await viewModel.loadRankings()
                }
            }
        }
        .task {
            await viewModel.loadRankings()
        }
    }
}

struct RankingRow: View {
    let item: RankingItem
    
    var body: some View {
        HStack(spacing: 12) {
            // Rank and Trend
            VStack(spacing: 2) {
                Text("\(item.rank)")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(AppColors.textPrimary)
                
                trendIndicator
            }
            .frame(width: 40)
            
            // Image
            ZStack {
                RoundedRectangle(cornerRadius: AppStyles.cornerRadiusSmall)
                    .fill(AppColors.secondaryBackground)
                    .frame(width: 50, height: 50)
                
                Image(systemName: "music.note")
                    .foregroundColor(AppColors.primary.opacity(0.3))
            }
            
            // Text
            VStack(alignment: .leading, spacing: 4) {
                Text(item.title)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(AppColors.textPrimary)
                    .lineLimit(1)
                
                Text(item.artist)
                    .font(.system(size: 14))
                    .foregroundColor(AppColors.textSecondary)
                    .lineLimit(1)
            }
            
            Spacer()
            
            // Rating
            VStack(alignment: .trailing, spacing: 4) {
                HStack(spacing: 4) {
                    Image(systemName: "star.fill")
                        .font(.system(size: 12))
                        .foregroundColor(AppColors.primary)
                    
                    Text(String(format: "%.1f", item.rating))
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(AppColors.textPrimary)
                }
                
                Text("\(item.ratingCount) ratings")
                    .font(.system(size: 10))
                    .foregroundColor(AppColors.textSecondary)
            }
        }
        .padding(12)
        .background(AppColors.cardBackground)
        .cornerRadius(AppStyles.cornerRadiusMedium)
        .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
    
    @ViewBuilder
    private var trendIndicator: some View {
        if item.isNew {
            Text("NEW")
                .font(.system(size: 8, weight: .bold))
                .foregroundColor(.white)
                .padding(.horizontal, 4)
                .padding(.vertical, 2)
                .background(AppColors.primary)
                .cornerRadius(4)
        } else if item.change > 0 {
            HStack(spacing: 2) {
                Image(systemName: "triangle.fill")
                    .font(.system(size: 8))
                Text("\(item.change)")
                    .font(.system(size: 9, weight: .bold))
            }
            .foregroundColor(.green)
        } else if item.change < 0 {
            HStack(spacing: 2) {
                Image(systemName: "triangle.fill")
                    .font(.system(size: 8))
                    .rotationEffect(.degrees(180))
                Text("\(abs(item.change))")
                    .font(.system(size: 9, weight: .bold))
            }
            .foregroundColor(.red)
        } else {
            Circle()
                .fill(AppColors.textSecondary.opacity(0.3))
                .frame(width: 4, height: 4)
        }
    }
}
