//
//  RatingViewModel.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import Foundation
import SwiftUI

@MainActor
class RatingViewModel: ObservableObject {
    @Published var rating: Int = 0
    @Published var hoverRating: Int = 0
    @Published var selectedTags: Set<String> = []
    @Published var isSubmitting: Bool = false
    @Published var errorMessage: String?
    
    let availableTags = ["Lyrics", "Production", "Replay", "Emotional", "Innovative", "Classic"]
    
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
    
    func toggleTag(_ tag: String) {
        if selectedTags.contains(tag) {
            selectedTags.remove(tag)
        } else {
            selectedTags.insert(tag)
        }
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
                tags: Array(selectedTags)
            )
            
            _ = try await ratingService.submitRating(request: request)
            
            // Reset form
            rating = 0
            hoverRating = 0
            selectedTags = []
            
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
        selectedTags = []
        errorMessage = nil
    }
}

