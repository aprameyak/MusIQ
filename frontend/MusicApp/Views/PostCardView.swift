import SwiftUI

struct PostCardView: View {
    @State var post: Post
    var onUserTap: (() -> Void)? = nil
    @State private var showComments = false
    private let service = PostService()
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            if post.isRepostItem == true {
                HStack(spacing: 4) {
                    Image(systemName: "arrow.2.squarepath")
                        .font(.system(size: 10))
                    Text("\(post.username) reposted")
                        .font(.system(size: 10, weight: .medium))
                }
                .foregroundColor(AppColors.textSecondary)
                .padding(.bottom, -8)
            }
            
            HStack(spacing: 12) {
                Button(action: { onUserTap?() }) {
                    Circle()
                        .fill(AppColors.primary.opacity(0.1))
                        .frame(width: 40, height: 40)
                        .overlay(
                            Text(post.username.prefix(1).uppercased())
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(AppColors.primary)
                        )
                }
                
                Button(action: { onUserTap?() }) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(post.username)
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(AppColors.textPrimary)
                        
                        Text(post.createdAt.formatted(date: .abbreviated, time: .shortened))
                            .font(.system(size: 12))
                            .foregroundColor(AppColors.textSecondary)
                    }
                }
                
                Spacer()
                
                RatingBadgeView(rating: post.rating)
            }
            
            if let text = post.text, !text.isEmpty {
                Text(text)
                    .font(.system(size: 15))
                    .foregroundColor(AppColors.textPrimary)
                    .lineLimit(3)
            }
            
            HStack(spacing: 12) {
                AsyncImage(url: URL(string: post.musicItem.imageUrl ?? "")) { image in
                    image.resizable()
                } placeholder: {
                    Rectangle().fill(AppColors.secondaryBackground)
                }
                .frame(width: 60, height: 60)
                .cornerRadius(4)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(post.musicItem.title)
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(AppColors.textPrimary)
                    
                    Text(post.musicItem.artist ?? "Unknown Artist")
                        .font(.system(size: 12))
                        .foregroundColor(AppColors.textSecondary)
                    
                    Text(post.musicItem.type.rawValue.capitalized)
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(AppColors.primary)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(AppColors.primary.opacity(0.1))
                        .cornerRadius(4)
                }
                
                Spacer()
            }
            .padding(10)
            .background(AppColors.secondaryBackground.opacity(0.5))
            .cornerRadius(AppStyles.cornerRadiusSmall)
            
            HStack(spacing: 24) {
                SocialActionButton(
                    icon: post.isLiked ? "heart.fill" : "heart",
                    count: post.likesCount,
                    color: post.isLiked ? .red : AppColors.textSecondary
                ) {
                    toggleLike()
                }
                
                SocialActionButton(
                    icon: "bubble.right",
                    count: post.commentsCount,
                    color: AppColors.textSecondary
                ) {
                    showComments = true
                }
                
                SocialActionButton(
                    icon: "arrow.2.squarepath",
                    count: post.repostsCount,
                    color: post.isReposted ? .green : AppColors.textSecondary
                ) {
                    toggleRepost()
                }
                
                Spacer()
                
                Button(action: {}) {
                    Image(systemName: "square.and.arrow.up")
                        .foregroundColor(AppColors.textSecondary)
                }
            }
            .padding(.top, 4)
        }
        .padding(AppStyles.paddingMedium)
        .cardStyle()
        .sheet(isPresented: $showComments) {
            CommentsView(viewModel: CommentsViewModel(postId: post.id))
        }
    }
    
    private func toggleLike() {
        let wasLiked = post.isLiked
        post.isLiked.toggle()
        post.likesCount += wasLiked ? -1 : 1
        
        Task {
            do {
                if wasLiked {
                    try await service.unlikePost(postId: post.id)
                } else {
                    try await service.likePost(postId: post.id)
                }
            } catch {
                post.isLiked = wasLiked
                post.likesCount += wasLiked ? 1 : -1
            }
        }
    }
    
    private func toggleRepost() {
        let wasReposted = post.isReposted
        post.isReposted.toggle()
        post.repostsCount += wasReposted ? -1 : 1
        
        Task {
            do {
                if wasReposted {
                    try await service.unsharePost(postId: post.id)
                } else {
                    try await service.sharePost(postId: post.id, text: nil)
                }
            } catch {
                post.isReposted = wasReposted
                post.repostsCount += wasReposted ? 1 : -1
            }
        }
    }
}

struct SocialActionButton: View {
    let icon: String
    let count: Int
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .foregroundColor(color)
                    .font(.system(size: 16))
                
                if count > 0 {
                    Text("\(count)")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(AppColors.textSecondary)
                }
            }
        }
    }
}
