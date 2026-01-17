import Foundation
import Combine
import SwiftUI

@MainActor
class HomeFeedViewModel: ObservableObject {
    @Published var feedItems: [MusicItem] = []
    @Published var isLoading: Bool = false
    @Published var isLoadingMore: Bool = false
    @Published var errorMessage: String?
    @Published var selectedItem: MusicItem?
    @Published var showRatingModal: Bool = false
    
    private let musicService: MusicService
    private var currentPage: Int = 1
    private var hasMore: Bool = true
    private var isLoadingPage: Bool = false
    
    init(musicService: MusicService = MusicService()) {
        self.musicService = musicService
    }
    
    func loadFeed() async {
        guard !isLoadingPage else { return }
        
        isLoading = true
        isLoadingPage = true
        errorMessage = nil
        currentPage = 1
        hasMore = true
        
        do {
            let result = try await musicService.getFeed(filter: "forYou", page: currentPage)
            feedItems = result.items
            hasMore = result.hasMore
            currentPage = result.nextPage ?? currentPage
        } catch {
            errorMessage = error.localizedDescription
            print("Feed load error: \(error.localizedDescription)")
        }
        
        isLoading = false
        isLoadingPage = false
    }
    
    func loadMoreIfNeeded(currentItem: MusicItem?) async {
        guard hasMore, !isLoadingPage, !isLoadingMore else { return }
        
        guard let currentItem = currentItem,
              let index = feedItems.firstIndex(where: { $0.id == currentItem.id }),
              index >= feedItems.count - 3 else {
            return
        }
        
        isLoadingMore = true
        isLoadingPage = true
        
        do {
            let result = try await musicService.getFeed(filter: "forYou", page: currentPage)
            feedItems.append(contentsOf: result.items)
            hasMore = result.hasMore
            currentPage = result.nextPage ?? currentPage
        } catch {
            print("Load more error: \(error.localizedDescription)")
        }
        
        isLoadingMore = false
        isLoadingPage = false
    }
    
    func selectItemForRating(_ item: MusicItem) {
        selectedItem = item
        showRatingModal = true
    }
    
    func refreshFeed() async {
        await loadFeed()
    }
}
