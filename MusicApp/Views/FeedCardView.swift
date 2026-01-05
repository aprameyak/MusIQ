import SwiftUI

struct FeedCardView: View {
    let item: MusicItem
    let onRate: () -> Void
    let onFavorite: () -> Void
    let onComment: () -> Void
    
    @State private var isFavorited = false
    
    var body: some View {
        HStack(spacing: 16) {
            
            ZStack(alignment: .topTrailing) {
                AsyncImage(url: URL(string: item.imageUrl)) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle()
                        .fill(AppColors.secondaryBackground)
                        .overlay(
                            ProgressView()
                                .tint(AppColors.primaryGreen)
                        )
                }
                .frame(width: 96, height: 96)
                .cornerRadius(AppStyles.cornerRadiusMedium)
                .clipped()
                
                if item.type == .song {
                    ZStack {
                        Color.black.opacity(0.4)
                            .frame(width: 96, height: 96)
                            .cornerRadius(AppStyles.cornerRadiusMedium)
                        
                        Image(systemName: "play.fill")
                            .font(.system(size: 32))
                            .foregroundColor(.white)
                    }
                }
                
                if item.trending == true {
                    ZStack {
                        Circle()
                            .fill(AppGradients.accent)
                            .frame(width: 24, height: 24)
                        
                        Image(systemName: "arrow.up")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.white)
                    }
                    .offset(x: 8, y: -8)
                }
            }
            
            VStack(alignment: .leading, spacing: 8) {
                
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
                
                HStack(spacing: 8) {
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .font(.system(size: 14))
                            .foregroundColor(AppColors.accentYellow)
                        
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
                                .foregroundColor(AppColors.primaryGreen)
                            
                            Text("+\(change)")
                                .font(.system(size: 12))
                                .foregroundColor(AppColors.primaryGreen)
                        }
                    }
                }
                
                HStack(spacing: 8) {
                    Button(action: {
                        isFavorited.toggle()
                        onFavorite()
                    }) {
                        Image(systemName: isFavorited ? "heart.fill" : "heart")
                            .font(.system(size: 16))
                            .foregroundColor(
                                isFavorited ?
                                AppColors.accentPink :
                                AppColors.textSecondary
                            )
                            .frame(width: 36, height: 36)
                            .background(
                                isFavorited ?
                                AppColors.accentPink.opacity(0.2) :
                                AppColors.secondaryBackground
                            )
                            .cornerRadius(AppStyles.cornerRadiusSmall)
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
                        .background(AppGradients.primary)
                        .cornerRadius(AppStyles.cornerRadiusSmall)
                    }
                    
                    Button(action: onComment) {
                        Image(systemName: "message")
                            .font(.system(size: 16))
                            .foregroundColor(AppColors.textSecondary)
                            .frame(width: 36, height: 36)
                            .background(AppColors.secondaryBackground)
                            .cornerRadius(AppStyles.cornerRadiusSmall)
                    }
                }
            }
            
            Spacer()
        }
        .padding(AppStyles.paddingMedium)
        .cardStyle()
    }
}

#Preview {
    FeedCardView(
        item: MusicItem(
            id: "1",
            type: .album,
            title: "ASTROWORLD",
            artist: "Travis Scott",
            imageUrl: "https:
            rating: 8.7,
            ratingCount: 234500,
            trending: true,
            trendingChange: 12,
            spotifyId: nil,
            appleMusicId: nil,
            metadata: nil
        ),
        onRate: {},
        onFavorite: {},
        onComment: {}
    )
    .padding()
    .background(AppColors.background)
}
