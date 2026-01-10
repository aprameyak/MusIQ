import SwiftUI

struct RatingModalView: View {
    @ObservedObject var viewModel: RatingViewModel
    let item: MusicItem?
    let onClose: () -> Void
    let onSubmit: (Int, [String]) -> Void
    
    var body: some View {
        ZStack {
            
            Color.black.opacity(0.8)
                .ignoresSafeArea()
                .onTapGesture {
                    onClose()
                }
            
            VStack(spacing: 0) {
                
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Rate this music")
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(AppColors.textPrimary)
                        
                        Text("Share your honest opinion")
                            .font(.system(size: 14))
                            .foregroundColor(AppColors.textSecondary)
                    }
                    
                    Spacer()
                    
                    Button(action: onClose) {
                        Image(systemName: "xmark")
                            .font(.system(size: 18))
                            .foregroundColor(AppColors.textSecondary)
                            .frame(width: 32, height: 32)
                    }
                }
                .padding(AppStyles.paddingLarge)
                
                if let item = item {
                    
                    HStack(spacing: 16) {
                        AsyncImage(url: URL(string: item.imageUrl)) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        } placeholder: {
                            Rectangle()
                                .fill(AppColors.secondaryBackground)
                        }
                        .frame(width: 80, height: 80)
                        .cornerRadius(AppStyles.cornerRadiusMedium)
                        .clipped()
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text(item.title)
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(AppColors.textPrimary)
                                .lineLimit(1)
                            
                            Text(item.artist)
                                .font(.system(size: 14))
                                .foregroundColor(AppColors.textSecondary)
                                .lineLimit(1)
                            
                            HStack(spacing: 4) {
                                Image(systemName: "star.fill")
                                    .font(.system(size: 12))
                                    .foregroundColor(AppColors.secondary)
                                
                                Text(String(format: "%.1f", item.rating))
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(AppColors.textPrimary)
                                
                                Text("current")
                                    .font(.system(size: 12))
                                    .foregroundColor(AppColors.textSecondary)
                            }
                        }
                        
                        Spacer()
                    }
                    .padding(AppStyles.paddingMedium)
                    .background(AppColors.background)
                    .cornerRadius(AppStyles.cornerRadiusMedium)
                    .padding(.horizontal, AppStyles.paddingLarge)
                    
                    VStack(spacing: 16) {
                        Text("Your rating")
                            .font(.system(size: 14))
                            .foregroundColor(AppColors.textPrimary)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        
                        HStack(spacing: 8) {
                            ForEach(1...10, id: \.self) { star in
                                Button(action: {
                                    viewModel.setRating(star)
                                }) {
                                    Image(systemName: "star.fill")
                                        .font(.system(size: 28))
                                        .foregroundColor(
                                            star <= (viewModel.hoverRating > 0 ? viewModel.hoverRating : viewModel.rating) ?
                                            AppColors.secondary :
                                            AppColors.secondaryBackground
                                        )
                                }
                                .onHover { hovering in
                                    if hovering {
                                        viewModel.setHoverRating(star)
                                    } else {
                                        viewModel.setHoverRating(0)
                                    }
                                }
                            }
                        }
                        
                        if viewModel.rating > 0 {
                            Text("\(viewModel.rating)/10")
                                .font(.system(size: 18, weight: .semibold))
                                .foregroundColor(AppColors.primary)
                                .transition(.opacity)
                        }
                    }
                    .padding(.horizontal, AppStyles.paddingLarge)
                    .padding(.top, AppStyles.paddingLarge)
                    
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Add tags (optional)")
                            .font(.system(size: 14))
                            .foregroundColor(AppColors.textPrimary)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        
                        FlowLayout(spacing: 8) {
                            ForEach(viewModel.availableTags, id: \.self) { tag in
                                Button(action: {
                                    viewModel.toggleTag(tag)
                                }) {
                                    Text(tag)
                                        .font(.system(size: 12))
                                        .foregroundColor(
                                            viewModel.selectedTags.contains(tag) ?
                                            AppColors.textPrimary :
                                            AppColors.textSecondary
                                        )
                                        .padding(.horizontal, 16)
                                        .padding(.vertical, 8)
                                        .background(
                                            viewModel.selectedTags.contains(tag) ?
                                            AppColors.primary :
                                            AppColors.secondaryBackground
                                        )
                                        .cornerRadius(20)
                                }
                            }
                        }
                    }
                    .padding(.horizontal, AppStyles.paddingLarge)
                    .padding(.top, AppStyles.paddingLarge)
                    
                    Button(action: {
                        Task {
                            if await viewModel.submitRating(for: item.id) {
                                onSubmit(viewModel.rating, Array(viewModel.selectedTags))
                                onClose()
                            }
                        }
                    }) {
                        Text("Submit Rating")
                            .font(.system(size: 16, weight: .semibold))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, AppStyles.paddingMedium)
                    }
                    .gradientButton(isEnabled: viewModel.rating > 0)
                    .padding(.horizontal, AppStyles.paddingLarge)
                    .padding(.top, AppStyles.paddingLarge)
                    
                    if viewModel.rating > 0 {
                        Text("Your rating will update the global score")
                            .font(.system(size: 12))
                            .foregroundColor(AppColors.textSecondary)
                            .padding(.top, 8)
                            .transition(.opacity)
                    }
                }
            }
            .background(AppColors.cardBackground)
            .cornerRadius(AppStyles.cornerRadiusLarge)
            .padding(.horizontal, AppStyles.paddingLarge)
            .shadow(color: .black.opacity(0.3), radius: 20, x: 0, y: 10)
        }
    }
}

struct FlowLayout: Layout {
    var spacing: CGFloat = 8
    
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = FlowResult(
            in: proposal.width ?? .infinity,
            subviews: subviews,
            spacing: spacing
        )
        return result.size
    }
    
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = FlowResult(
            in: bounds.width,
            subviews: subviews,
            spacing: spacing
        )
        for (index, subview) in subviews.enumerated() {
            subview.place(at: CGPoint(x: bounds.minX + result.frames[index].minX, y: bounds.minY + result.frames[index].minY), proposal: .unspecified)
        }
    }
    
    struct FlowResult {
        var size: CGSize = .zero
        var frames: [CGRect] = []
        
        init(in maxWidth: CGFloat, subviews: Subviews, spacing: CGFloat) {
            var currentX: CGFloat = 0
            var currentY: CGFloat = 0
            var lineHeight: CGFloat = 0
            
            for subview in subviews {
                let size = subview.sizeThatFits(.unspecified)
                
                if currentX + size.width > maxWidth && currentX > 0 {
                    currentX = 0
                    currentY += lineHeight + spacing
                    lineHeight = 0
                }
                
                frames.append(CGRect(x: currentX, y: currentY, width: size.width, height: size.height))
                lineHeight = max(lineHeight, size.height)
                currentX += size.width + spacing
            }
            
            self.size = CGSize(width: maxWidth, height: currentY + lineHeight)
        }
    }
}

#Preview {
    RatingModalView(
        viewModel: RatingViewModel(),
        item: MusicItem(
            id: "1",
            type: .album,
            title: "ASTROWORLD",
            artist: "Travis Scott",
            imageUrl: "https://i.scdn.co/image/placeholder",
            rating: 8.7,
            ratingCount: 234500,
            trending: true,
            trendingChange: 12,
            spotifyId: nil,
            appleMusicId: nil,
            metadata: nil
        ),
        onClose: {},
        onSubmit: { _, _ in }
    )
}
