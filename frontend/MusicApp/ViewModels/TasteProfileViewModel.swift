import Foundation
import Combine
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
    @Published var tasteScore: Int = 0
    @Published var totalRatings: Int = 0
    @Published var influence: Int = 0
    @Published var genreData: [GenreData] = []
    @Published var decadeData: [DecadeData] = []
    @Published var radarData: [RadarData] = []
    @Published var controversyAffinity: Int = 0
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
            
            genreData = profile.genreAffinity.map { GenreData(name: $0.key, value: $0.value) }
            
            decadeData = profile.decadePreference.map { DecadeData(decade: $0.key, value: $0.value) }
            
            radarData = profile.attributes.map { RadarData(category: $0.key, value: $0.value) }
            
            controversyAffinity = profile.controversyAffinity
        } catch {
            errorMessage = error.localizedDescription
            genreData = []
            decadeData = []
            radarData = []
        }
        
        isLoading = false
    }
}

struct TasteProfileResponse: Codable {
    let tasteScore: Int
    let totalRatings: Int
    let influence: Int
    let genreAffinity: [String: Int]
    let decadePreference: [String: Int]
    let attributes: [String: Int]
    let controversyAffinity: Int
}
