import Foundation
import Combine
import SwiftUI

@MainActor
class RatingViewModel: ObservableObject {
    @Published var rating: Int = 0
    @Published var hoverRating: Int = 0
    @Published var postText: String = ""
    @Published var isSubmitting: Bool = false
    @Published var errorMessage: String?
    
    private let postService: PostService
    
    init(postService: PostService = PostService()) {
        self.postService = postService
    }
    
    func setRating(_ value: Int) {
        rating = value
    }
    
    func setHoverRating(_ value: Int) {
        hoverRating = value
    }
    
    func submitRating(for musicItemId: String) async -> Bool {
        guard rating > 0 else {
            errorMessage = "Please select a rating"
            return false
        }
        
        isSubmitting = true
        errorMessage = nil
        
        do {
            let text = postText.trimmingCharacters(in: .whitespacesAndNewlines)
            let finalText = text.isEmpty ? nil : text
            
            _ = try await postService.createPost(
                musicItemId: musicItemId,
                rating: rating,
                text: finalText
            )
            
            rating = 0
            hoverRating = 0
            postText = ""
            
            isSubmitting = false
            return true
        } catch {
            errorMessage = error.localizedDescription
            isSubmitting = false
            return false
        }
    }
    
    func reset() {
        rating = 0
        hoverRating = 0
        postText = ""
        errorMessage = nil
    }
}
