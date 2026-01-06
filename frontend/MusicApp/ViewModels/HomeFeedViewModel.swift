import Foundation
import Combine
import SwiftUI

enum FeedFilter: String, CaseIterable {
    case trending = "trending"
    case forYou = "forYou"
    case following = "following"
    
    var displayName: String {
        switch self {
        case .trending: return "Trending"
        case .forYou: return "For You"
        case .following: return "Following"
        }
    }
}

@MainActor
class HomeFeedViewModel: ObservableObject {
    @Published var feedItems: [MusicItem] = []
    @Published var activeFilter: FeedFilter = .trending
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var selectedItem: MusicItem?
    @Published var showRatingModal: Bool = false
    
    private let musicService: MusicService
    
    init(musicService: MusicService = MusicService()) {
        self.musicService = musicService
    }
    
    func loadFeed() async {
        isLoading = true
        errorMessage = nil
        
        do {
            feedItems = try await musicService.getFeed(filter: activeFilter.rawValue)
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func setFilter(_ filter: FeedFilter) {
        activeFilter = filter
        Task {
            await loadFeed()
        }
    }
    
    func selectItemForRating(_ item: MusicItem) {
        selectedItem = item
        showRatingModal = true
    }
    
    func refreshFeed() async {
        await loadFeed()
    }
}
