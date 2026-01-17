import SwiftUI

struct FeedCardView: View {
    let item: MusicItem
    let onRate: () -> Void
    
    private var iconName: String {
        switch item.type {
        case .album:
            return "opticaldisc.fill"
        case .song:
            return "music.note"
        case .artist:
            return "person.fill"
        }
    }
    
    private var iconColor: Color {
        switch item.type {
        case .album:
            return AppColors.primary
        case .song:
            return AppColors.secondary
        case .artist:
            return AppColors.accent
        }
    }
    
    var body: some View {
        HStack(spacing: 16) {
            ZStack(alignment: .topTrailing) {
                RoundedRectangle(cornerRadius: AppStyles.cornerRadiusMedium)
                    .fill(AppColors.secondaryBackground)
                    .frame(width: 96, height: 96)
                    .overlay(
                        Image(systemName: iconName)
                            .font(.system(size: 40))
                            .foregroundColor(iconColor)
                    )
                
                if item.trending == true {
                    ZStack {
                        Circle()
                            .fill(AppColors.accent)
                            .frame(width: 24, height: 24)
                        
                        Image(systemName: "arrow.up")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.white)
                    }
                    .offset(x: 8, y: -8)
                }
            }
            
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 6) {
                    Image(systemName: iconName)
                        .font(.system(size: 12))
                        .foregroundColor(iconColor)
                    
                    Text(item.type.rawValue.capitalized)
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(iconColor)
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(iconColor.opacity(0.15))
                .cornerRadius(12)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(item.title)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(AppColors.textPrimary)
                        .lineLimit(1)
                    
                    Text(item.artist ?? "Unknown Artist")
                        .font(.system(size: 14))
                        .foregroundColor(AppColors.textSecondary)
                        .lineLimit(1)
                }
                
                HStack(spacing: 8) {
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .font(.system(size: 14))
                            .foregroundColor(AppColors.secondary)
                        
                        Text(String(format: "%.1f", item.rating))
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(AppColors.textPrimary)
                    }
                    
                    Text("(\(item.ratingCount.formatted()))")
                        .font(.system(size: 12))
                        .foregroundColor(AppColors.textSecondary)
                    
                    if let change = item.trendingChange, item.trending == true {
                        HStack(spacing: 4) {
                            Image(systemName: "arrow.up")
                                .font(.system(size: 10))
                                .foregroundColor(AppColors.primary)
                            
                            Text("+\(change)")
                                .font(.system(size: 12))
                                .foregroundColor(AppColors.primary)
                        }
                    }
                }
                
                Button(action: onRate) {
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .font(.system(size: 14))
                        
                        Text("Rate")
                            .font(.system(size: 14, weight: .medium))
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(AppColors.primary)
                    .cornerRadius(AppStyles.cornerRadiusSmall)
                }
            }
            
            Spacer()
        }
        .padding(AppStyles.paddingMedium)
        .cardStyle()
    }
}
