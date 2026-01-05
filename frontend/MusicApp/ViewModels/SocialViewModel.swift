import Foundation
import SwiftUI

@MainActor
class SocialViewModel: ObservableObject {
    @Published var friends: [Friend] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let socialService: SocialService
    
    init(socialService: SocialService = SocialService()) {
        self.socialService = socialService
    }
    
    func loadFriends() async {
        isLoading = true
        errorMessage = nil
        
        do {
            friends = try await socialService.getFriends()
        } catch {
            errorMessage = error.localizedDescription
            
            loadMockData()
        }
        
        isLoading = false
    }
    
    func getCompatibilityColor(_ score: Int) -> Color {
        if score >= 80 {
            return AppColors.primaryGreen
        } else if score >= 60 {
            return AppColors.accentYellow
        } else {
            return AppColors.accentPink
        }
    }
    
    func getCompatibilityEmoji(_ score: Int) -> String {
        if score >= 90 { return "🔥" }
        if score >= 80 { return "✨" }
        if score >= 70 { return "👍" }
        if score >= 60 { return "👌" }
        return "🤔"
    }
    
    private func loadMockData() {
        friends = [
            Friend(
                id: "1",
                name: "Sarah Wilson",
                username: "@sarahmusic",
                avatar: "https:
                compatibility: 87,
                topGenre: "R&B",
                sharedArtists: 42,
                status: .accepted
            ),
            Friend(
                id: "2",
                name: "Mike Chen",
                username: "@mikebeats",
                avatar: "https:
                compatibility: 73,
                topGenre: "Hip-Hop",
                sharedArtists: 28,
                status: .accepted
            ),
            Friend(
                id: "3",
                name: "Emma Davis",
                username: "@emmad",
                avatar: "https:
                compatibility: 92,
                topGenre: "Pop",
                sharedArtists: 56,
                status: .accepted
            )
        ]
    }
}
