import SwiftUI

struct MusicAsyncImage: View {
    let url: String
    let placeholder: String
    
    init(url: String, placeholder: String = "music.note") {
        self.url = url
        self.placeholder = placeholder
    }
    
    var body: some View {
        AsyncImage(url: URL(string: url)) { phase in
            switch phase {
            case .empty:
                ZStack {
                    Rectangle()
                        .fill(AppColors.secondaryBackground)
                    ProgressView()
                        .tint(AppColors.primaryGreen)
                }
            case .success(let image):
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            case .failure:
                ZStack {
                    Rectangle()
                        .fill(AppColors.secondaryBackground)
                    Image(systemName: placeholder)
                        .font(.system(size: 24))
                        .foregroundColor(AppColors.textSecondary)
                }
            @unknown default:
                EmptyView()
            }
        }
    }
}
