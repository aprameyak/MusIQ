import Foundation
import Combine
import SwiftUI

@MainActor
class HomeFeedViewModel: ObservableObject {
    @Published var feedItems: [Post] = []
    @Published var isLoading: Bool = false
    @Published var isLoadingMore: Bool = false
    @Published var errorMessage: String?
    @Published var selectedItem: MusicItem?
    @Published var showRatingModal: Bool = false
    @Published var showSearchView: Bool = false
    @Published var searchQuery: String = ""
    @Published var searchResults: [MusicItem] = []
    @Published var isSearching: Bool = false
    
    private let postService: PostService
    private let musicService: MusicService
    private var currentPage: Int = 1
    private var hasMore: Bool = true
    private var isLoadingPage: Bool = false
    private var searchTask: Task<Void, Never>?
    
    init(postService: PostService = PostService(), musicService: MusicService = MusicService()) {
        self.postService = postService
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
            let result = try await postService.getFeed(page: currentPage)
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
    
    func loadMoreIfNeeded(currentItem: Post?) async {
        guard hasMore, !isLoadingPage, !isLoadingMore else { return }
        
        guard let currentItem = currentItem,
              let index = feedItems.firstIndex(where: { $0.id == currentItem.id }),
              index >= feedItems.count - 3 else {
            return
        }
        
        isLoadingMore = true
        isLoadingPage = true
        
        do {
            let result = try await postService.getFeed(page: currentPage)
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
    
    func searchMusic(query: String) async {
        guard query.count >= 2 else {
            searchResults = []
            return
        }
        
        isSearching = true
        searchTask?.cancel()
        
        searchTask = Task {
            do {
                let results = try await musicService.search(query: query)
                if !Task.isCancelled {
                    await MainActor.run {
                        self.searchResults = results
                        self.isSearching = false
                    }
                }
            } catch {
                if !Task.isCancelled {
                    await MainActor.run {
                        self.searchResults = []
                        self.isSearching = false
                    }
                }
            }
        }
    }
    
    func selectMusicItemForPost(_ item: MusicItem) {
        selectedItem = item
        showSearchView = false
        showRatingModal = true
    }
    
    func likePost(_ post: Post) async {
        guard let index = feedItems.firstIndex(where: { $0.id == post.id }) else { return }
        
        let previouslyLiked = post.isLiked
        
        
        feedItems[index].isLiked.toggle()
        feedItems[index].likesCount += previouslyLiked ? -1 : 1
        
        do {
            if previouslyLiked {
                try await postService.unlikePost(postId: post.id)
            } else {
                try await postService.likePost(postId: post.id)
            }
        } catch {
            
            feedItems[index].isLiked = previouslyLiked
            feedItems[index].likesCount += previouslyLiked ? 1 : -1
            errorMessage = "Failed to update like: \(error.localizedDescription)"
        }
    }
    
    func addComment(to post: Post, text: String) async {
        guard !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        
        do {
            _ = try await postService.addComment(postId: post.id, text: text)
            if let index = feedItems.firstIndex(where: { $0.id == post.id }) {
                feedItems[index].commentsCount += 1
            }
        } catch {
            errorMessage = "Failed to add comment: \(error.localizedDescription)"
        }
    }
    
    func sharePost(_ post: Post, text: String?) async {
        do {
            try await postService.sharePost(postId: post.id, text: text)
            if let index = feedItems.firstIndex(where: { $0.id == post.id }) {
                feedItems[index].repostsCount += 1
            }
        } catch {
            errorMessage = "Failed to share post: \(error.localizedDescription)"
        }
    }
}
