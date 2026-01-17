import Foundation
import Combine
import SwiftUI

@MainActor
class RatingViewModel: ObservableObject {
    @Published var rating: Int = 0
    @Published var hoverRating: Int = 0
    @Published var isSubmitting: Bool = false
    @Published var errorMessage: String?
    
    private let ratingService: RatingService
    
    init(ratingService: RatingService = RatingService()) {
        self.ratingService = ratingService
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
            let request = CreateRatingRequest(
                musicItemId: musicItemId,
                rating: rating,
                tags: nil
            )
            
            _ = try await ratingService.submitRating(request: request)
            
            rating = 0
            hoverRating = 0
            
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
        errorMessage = nil
    }
}
