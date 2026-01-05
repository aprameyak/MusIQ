//
//  TasteProfileViewModel.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import Foundation
import SwiftUI

struct GenreData: Identifiable {
    let id = UUID()
    let name: String
    let value: Int
}

struct DecadeData: Identifiable {
    let id = UUID()
    let decade: String
    let value: Int
}

struct RadarData: Identifiable {
    let id = UUID()
    let category: String
    let value: Int
}

@MainActor
class TasteProfileViewModel: ObservableObject {
    @Published var tasteScore: Int = 87
    @Published var totalRatings: Int = 342
    @Published var influence: Int = 12456
    @Published var genreData: [GenreData] = []
    @Published var decadeData: [DecadeData] = []
    @Published var radarData: [RadarData] = []
    @Published var controversyAffinity: Int = 75
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let profileService: ProfileService
    
    init(profileService: ProfileService = ProfileService()) {
        self.profileService = profileService
    }
    
    func loadProfile() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let profile = try await profileService.getTasteProfile()
            
            tasteScore = profile.tasteScore
            totalRatings = profile.totalRatings
            influence = profile.influence
            
            // Load genre data
            genreData = profile.genreAffinity.map { GenreData(name: $0.key, value: $0.value) }
            
            // Load decade data
            decadeData = profile.decadePreference.map { DecadeData(decade: $0.key, value: $0.value) }
            
            // Load radar data
            radarData = profile.attributes.map { RadarData(category: $0.key, value: $0.value) }
            
            controversyAffinity = profile.controversyAffinity
        } catch {
            errorMessage = error.localizedDescription
            // Load mock data on error
            loadMockData()
        }
        
        isLoading = false
    }
    
    private func loadMockData() {
        genreData = [
            GenreData(name: "Hip-Hop", value: 85),
            GenreData(name: "R&B", value: 72),
            GenreData(name: "Pop", value: 68),
            GenreData(name: "Rock", value: 54),
            GenreData(name: "Electronic", value: 45),
            GenreData(name: "Jazz", value: 32)
        ]
        
        decadeData = [
            DecadeData(decade: "70s", value: 15),
            DecadeData(decade: "80s", value: 25),
            DecadeData(decade: "90s", value: 45),
            DecadeData(decade: "00s", value: 68),
            DecadeData(decade: "10s", value: 82),
            DecadeData(decade: "20s", value: 95)
        ]
        
        radarData = [
            RadarData(category: "Lyrics", value: 85),
            RadarData(category: "Production", value: 92),
            RadarData(category: "Vocals", value: 78),
            RadarData(category: "Innovation", value: 88),
            RadarData(category: "Emotion", value: 75),
            RadarData(category: "Replay", value: 90)
        ]
    }
}

// Temporary struct for API response (will be replaced with actual API)
struct TasteProfileResponse: Codable {
    let tasteScore: Int
    let totalRatings: Int
    let influence: Int
    let genreAffinity: [String: Int]
    let decadePreference: [String: Int]
    let attributes: [String: Int]
    let controversyAffinity: Int
}

