//
//  RankingViewModel.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import Foundation
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
    let change: Int // positive = up, negative = down, 0 = no change
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
            // Load mock data on error
            loadMockData()
        }
        
        isLoading = false
    }
    
    func setType(_ type: RankingType) {
        activeType = type
        Task {
            await loadRankings()
        }
    }
    
    private func loadMockData() {
        rankings = [
            RankingItem(
                id: "1",
                rank: 1,
                title: "To Pimp a Butterfly",
                artist: "Kendrick Lamar",
                imageUrl: "https://images.unsplash.com/photo-1616663395403-2e0052b8e595?w=400&h=400&fit=crop",
                rating: 9.7,
                ratingCount: 892000,
                isNew: false,
                change: 0
            ),
            RankingItem(
                id: "2",
                rank: 2,
                title: "My Beautiful Dark Twisted Fantasy",
                artist: "Kanye West",
                imageUrl: "https://images.unsplash.com/photo-1738667289162-9e55132e18a2?w=400&h=400&fit=crop",
                rating: 9.6,
                ratingCount: 856000,
                isNew: false,
                change: 0
            ),
            RankingItem(
                id: "3",
                rank: 3,
                title: "Blonde",
                artist: "Frank Ocean",
                imageUrl: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=400&h=400&fit=crop",
                rating: 9.5,
                ratingCount: 678000,
                isNew: false,
                change: 1
            )
        ]
    }
}

