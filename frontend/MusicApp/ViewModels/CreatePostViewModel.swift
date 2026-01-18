import Foundation
import SwiftUI
import Combine

@MainActor
class CreatePostViewModel: ObservableObject {
    @Published var musicItemName: String = ""
    @Published var category: MusicItemType = .song
    @Published var rating: Int = 0
    @Published var hoverRating: Int = 0
    @Published var description: String = ""
    @Published var isSubmitting: Bool = false
    @Published var errorMessage: String?
    
    private let postService: PostService
    
    init(postService: PostService = PostService()) {
        self.postService = postService
    }
    
    var canSubmit: Bool {
        !musicItemName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && rating > 0
    }
    
    func setRating(_ value: Int) {
        rating = value
    }
    
    func setHoverRating(_ value: Int) {
        hoverRating = value
    }
    
    func submitPost() async -> Bool {
        guard canSubmit else {
            errorMessage = "Please enter a music item name and select a rating"
            return false
        }
        
        isSubmitting = true
        errorMessage = nil
        
        do {
            let trimmedName = musicItemName.trimmingCharacters(in: .whitespacesAndNewlines)
            let trimmedDescription = description.trimmingCharacters(in: .whitespacesAndNewlines)
            let finalDescription = trimmedDescription.isEmpty ? nil : trimmedDescription
            
            _ = try await postService.createPostWithMusicItem(
                name: trimmedName,
                category: category,
                rating: rating,
                text: finalDescription
            )
            
            reset()
            isSubmitting = false
            return true
        } catch {
            errorMessage = error.localizedDescription
            isSubmitting = false
            return false
        }
    }
    
    func reset() {
        musicItemName = ""
        category = .song
        rating = 0
        hoverRating = 0
        description = ""
        errorMessage = nil
    }
}
