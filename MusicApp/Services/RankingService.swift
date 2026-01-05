//
//  RankingService.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import Foundation

class RankingService {
    private let apiService = APIService.shared
    
    func getRankings(type: String, timeframe: String = "all_time") async throws -> [RankingItem] {
        let endpoint = "/rankings/\(type)?timeframe=\(timeframe)"
        let response: APIResponse<[RankingItem]> = try await apiService.request(
            endpoint: endpoint,
            method: .get
        )
        
        guard response.success, let data = response.data else {
            // Return empty array if API fails
            return []
        }
        
        return data
    }
}

