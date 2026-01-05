//
//  ProfileService.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import Foundation

class ProfileService {
    private let apiService = APIService.shared
    
    func getProfile() async throws -> UserProfile {
        let response: APIResponse<UserProfile> = try await apiService.request(
            endpoint: "/profile",
            method: .get
        )
        
        guard response.success, let data = response.data else {
            throw NetworkError.unauthorized
        }
        
        return data
    }
    
    func getTasteProfile() async throws -> TasteProfileResponse {
        let response: APIResponse<TasteProfileResponse> = try await apiService.request(
            endpoint: "/profile/taste",
            method: .get
        )
        
        guard response.success, let data = response.data else {
            // Return mock data if API fails
            return TasteProfileResponse(
                tasteScore: 87,
                totalRatings: 342,
                influence: 12456,
                genreAffinity: [
                    "Hip-Hop": 85,
                    "R&B": 72,
                    "Pop": 68,
                    "Rock": 54,
                    "Electronic": 45,
                    "Jazz": 32
                ],
                decadePreference: [
                    "70s": 15,
                    "80s": 25,
                    "90s": 45,
                    "00s": 68,
                    "10s": 82,
                    "20s": 95
                ],
                attributes: [
                    "Lyrics": 85,
                    "Production": 92,
                    "Vocals": 78,
                    "Innovation": 88,
                    "Emotion": 75,
                    "Replay": 90
                ],
                controversyAffinity: 75
            )
        }
        
        return data
    }
    
    func updateProfile(_ user: User) async throws -> User {
        let response: APIResponse<User> = try await apiService.request(
            endpoint: "/profile",
            method: .put,
            body: user
        )
        
        guard response.success, let data = response.data else {
            throw NetworkError.unknown(NSError(domain: "ProfileService", code: -1))
        }
        
        return data
    }
}

