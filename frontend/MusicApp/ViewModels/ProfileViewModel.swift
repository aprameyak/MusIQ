import Foundation
import SwiftUI
import Combine

@MainActor
class ProfileViewModel: ObservableObject {
    @Published var user: User?
    @Published var posts: [Post] = []
    @Published var tasteProfile: TasteProfileResponse?
    @Published var following: [SocialUser] = []
    @Published var followers: [SocialUser] = []
    @Published var isLoading: Bool = false
    @Published var isLoadingPosts: Bool = false
    @Published var errorMessage: String?
    
    private let profileService: ProfileService
    private let ratingService: RatingService
    private let postService: PostService
    private let socialService: SocialService
    
    var userId: String?
    
    init(
        userId: String? = nil,
        profileService: ProfileService = ProfileService(),
        ratingService: RatingService = RatingService(),
        postService: PostService = PostService(),
        socialService: SocialService = SocialService()
    ) {
        self.userId = userId
        self.profileService = profileService
        self.ratingService = ratingService
        self.postService = postService
        self.socialService = socialService
    }
    
    func loadFullProfile() async {
        isLoading = true
        errorMessage = nil
        
        do {
            if let targetId = userId {
                
                async let userTask = profileService.getUserProfile(userId: targetId)
                async let followingTask = socialService.getFollowing() 
                async let postsTask = postService.getUserPosts(userId: targetId)
                
                self.user = try await userTask
                let myFollowing = try await followingTask
                self.posts = try await postsTask.items
                
                
            } else {
                
                async let profileTask = profileService.getProfile()
                async let followingTask = socialService.getFollowing()
                async let followersTask = socialService.getFollowers()
                
                let profile = try await profileTask
                self.following = try await followingTask
                self.followers = try await followersTask
                
                self.user = profile.user
                
                let postsResult = try await postService.getUserPosts(userId: profile.user.id)
                self.posts = postsResult.items
            }
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func follow() async {
        guard let userId = user?.id else { return }
        do {
            try await socialService.follow(userId: userId)
            if var currentUser = user {
                currentUser.isFollowing = true
                currentUser.followersCount = (currentUser.followersCount ?? 0) + 1
                self.user = currentUser
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func unfollow() async {
        guard let userId = user?.id else { return }
        do {
            try await socialService.unfollow(userId: userId)
            if var currentUser = user {
                currentUser.isFollowing = false
                currentUser.followersCount = max(0, (currentUser.followersCount ?? 0) - 1)
                self.user = currentUser
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func unfollowUser(targetUserId: String) async {
        do {
            try await socialService.unfollow(userId: targetUserId)
            self.following.removeAll(where: { $0.id == targetUserId })
            if var currentUser = user {
                currentUser.followingCount = max(0, (currentUser.followingCount ?? 0) - 1)
                self.user = currentUser
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func refreshProfile() async {
        await loadFullProfile()
    }
}
