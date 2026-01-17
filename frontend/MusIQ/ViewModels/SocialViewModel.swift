import Foundation
import Combine
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
            friends = []
        }
        
        isLoading = false
    }
    
    func getCompatibilityColor(_ score: Int) -> Color {
        if score >= 80 {
            return AppColors.primary
        } else if score >= 60 {
            return AppColors.secondary
        } else {
            return AppColors.accent
        }
    }
    
    func getCompatibilityEmoji(_ score: Int) -> String {
        return ""
    }
}
