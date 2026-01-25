import Foundation
import SwiftUI
import Combine

@MainActor
class UserSearchViewModel: ObservableObject {
    @Published var searchQuery: String = ""
    @Published var users: [UserSummary] = []
    @Published var isSearching: Bool = false
    @Published var errorMessage: String?
    
    private let profileService: ProfileService
    private let socialService: SocialService
    private var searchTask: Task<Void, Never>?
    
    init(profileService: ProfileService = ProfileService(), socialService: SocialService = SocialService()) {
        self.profileService = profileService
        self.socialService = socialService
    }
    
    func search() {
        guard searchQuery.count >= 2 else {
            users = []
            return
        }
        
        isSearching = true
        searchTask?.cancel()
        
        searchTask = Task {
            do {
                let results = try await profileService.searchUsers(query: searchQuery)
                if !Task.isCancelled {
                    self.users = results
                    self.isSearching = false
                }
            } catch {
                if !Task.isCancelled {
                    self.errorMessage = error.localizedDescription
                    self.isSearching = false
                }
            }
        }
    }
    
    func followUser(userId: String) async {
        do {
            try await socialService.follow(userId: userId)
            // Show success or update status
        } catch {
            self.errorMessage = error.localizedDescription
        }
    }
}
