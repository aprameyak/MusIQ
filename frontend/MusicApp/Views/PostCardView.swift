import SwiftUI

struct PostCardView: View {
    let post: Post
    
    private var iconName: String {
        switch post.musicItem.type {
        case .album:
            return "opticaldisc.fill"
        case .song:
            return "music.note"
        case .artist:
            return "person.fill"
        }
    }
    
    private var iconColor: Color {
        switch post.musicItem.type {
        case .album:
            return AppColors.primary
        case .song:
            return AppColors.secondary
        case .artist:
            return AppColors.accent
        }
    }
    
    private var timeAgo: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: post.createdAt, relativeTo: Date())
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(post.username)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(AppColors.textPrimary)
                
                Text(timeAgo)
                    .font(.system(size: 13))
                    .foregroundColor(AppColors.textSecondary)
                
                Spacer()
            }
            
            if let text = post.text, !text.isEmpty {
                Text(text)
                    .font(.system(size: 15))
                    .foregroundColor(AppColors.textPrimary)
                    .lineSpacing(4)
            }
            
            HStack(spacing: 12) {
                RoundedRectangle(cornerRadius: AppStyles.cornerRadiusSmall)
                    .fill(AppColors.secondaryBackground)
                    .frame(width: 64, height: 64)
                    .overlay(
                        Image(systemName: iconName)
                            .font(.system(size: 28))
                            .foregroundColor(iconColor)
                    )
                
                VStack(alignment: .leading, spacing: 6) {
                    HStack(spacing: 6) {
                        Image(systemName: iconName)
                            .font(.system(size: 10))
                            .foregroundColor(iconColor)
                        
                        Text(post.musicItem.type.rawValue.capitalized)
                            .font(.system(size: 10, weight: .semibold))
                            .foregroundColor(iconColor)
                    }
                    .padding(.horizontal, 6)
                    .padding(.vertical, 3)
                    .background(iconColor.opacity(0.15))
                    .cornerRadius(8)
                    
                    Text(post.musicItem.title)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(AppColors.textPrimary)
                        .lineLimit(1)
                    
                    if let artist = post.musicItem.artist {
                        Text(artist)
                            .font(.system(size: 12))
                            .foregroundColor(AppColors.textSecondary)
                            .lineLimit(1)
                    }
                }
                
                Spacer()
                
                HStack(spacing: 4) {
                    Image(systemName: "star.fill")
                        .font(.system(size: 14))
                        .foregroundColor(AppColors.secondary)
                    
                    Text("\(post.rating)/10")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(AppColors.textPrimary)
                }
            }
            .padding(AppStyles.paddingSmall)
            .background(AppColors.secondaryBackground.opacity(0.5))
            .cornerRadius(AppStyles.cornerRadiusSmall)
        }
        .padding(AppStyles.paddingMedium)
        .cardStyle()
    }
}
