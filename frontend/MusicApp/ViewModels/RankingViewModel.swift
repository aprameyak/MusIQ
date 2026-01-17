import Foundation
import Combine
import SwiftUI

enum RankingType: String, CaseIterable {
    case albums = "albums"
    case artists = "artists"
    case songs = "songs"
    
    var displayName: String {
        switch self {
        case .albums: return "Albums"
        case .artists: return "Artists"
        case .songs: return "Songs"
        }
    }
}

struct RankingItem: Identifiable, Codable {
    let id: String
    let rank: Int
    let title: String
    let artist: String
    let imageUrl: String
    let rating: Double
    let ratingCount: Int
    let isNew: Bool
    let change: Int 
}

@MainActor
class RankingViewModel: ObservableObject {
    @Published var activeType: RankingType = .albums
    @Published var rankings: [RankingItem] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let rankingService: RankingService
    
    init(rankingService: RankingService = RankingService()) {
        self.rankingService = rankingService
    }
    
    func loadRankings() async {
        isLoading = true
        errorMessage = nil
        
        do {
            rankings = try await rankingService.getRankings(type: activeType.rawValue)
        } catch {
            errorMessage = error.localizedDescription
            rankings = []
        }
        
        isLoading = false
    }
    
    func setType(_ type: RankingType) {
        activeType = type
        Task {
            await loadRankings()
        }
    }
}
