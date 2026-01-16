import Foundation
import Combine
import SwiftUI

@MainActor
class HomeFeedViewModel: ObservableObject {
    @Published var feedItems: [MusicItem] = []
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
            feedItems = try await musicService.getFeed(filter: "forYou")
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func selectItemForRating(_ item: MusicItem) {
        selectedItem = item
        showRatingModal = true
    }
    
    func refreshFeed() async {
        await loadFeed()
    }
}
