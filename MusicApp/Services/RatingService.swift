//
//  RatingService.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import Foundation

class RatingService {
    private let apiService = APIService.shared
    
    func submitRating(request: CreateRatingRequest) async throws -> RatingResponse {
        let response: APIResponse<RatingResponse> = try await apiService.request(
            endpoint: "/ratings",
            method: .post,
            body: request
        )
        
        guard response.success, let data = response.data else {
            throw NetworkError.unknown(NSError(domain: "RatingService", code: -1))
        }
        
        return data
    }
    
    func getRatings(for musicItemId: String) async throws -> [Rating] {
        let response: APIResponse<[Rating]> = try await apiService.request(
            endpoint: "/ratings/\(musicItemId)",
            method: .get
        )
        
        guard response.success, let data = response.data else {
            return []
        }
        
        return data
    }
    
    func getUserRatings(userId: String) async throws -> [Rating] {
        let response: APIResponse<[Rating]> = try await apiService.request(
            endpoint: "/ratings/user/\(userId)",
            method: .get
        )
        
        guard response.success, let data = response.data else {
            return []
        }
        
        return data
    }
}

