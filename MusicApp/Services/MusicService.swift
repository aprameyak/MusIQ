//
//  MusicService.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import Foundation

class MusicService {
    private let apiService = APIService.shared
    
    func getFeed(filter: String, page: Int = 1, limit: Int = 20) async throws -> [MusicItem] {
        let endpoint = "/music/feed?filter=\(filter)&page=\(page)&limit=\(limit)"
        let response: APIResponse<[MusicItem]> = try await apiService.request(
            endpoint: endpoint,
            method: .get
        )
        
        guard response.success, let data = response.data else {
            // Return mock data if API fails
            return getMockFeedData()
        }
        
        return data
    }
    
    func getMusicItem(id: String) async throws -> MusicItem {
        let response: APIResponse<MusicItem> = try await apiService.request(
            endpoint: "/music/\(id)",
            method: .get
        )
        
        guard response.success, let data = response.data else {
            throw NetworkError.notFound
        }
        
        return data
    }
    
    func search(query: String) async throws -> [MusicItem] {
        let endpoint = "/music/search?q=\(query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")"
        let response: APIResponse<[MusicItem]> = try await apiService.request(
            endpoint: endpoint,
            method: .get
        )
        
        guard response.success, let data = response.data else {
            return []
        }
        
        return data
    }
    
    // Mock data for development
    private func getMockFeedData() -> [MusicItem] {
        return [
            MusicItem(
                id: "1",
                type: .album,
                title: "ASTROWORLD",
                artist: "Travis Scott",
                imageUrl: "https://images.unsplash.com/photo-1738667289162-9e55132e18a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=400&fit=crop",
                rating: 8.7,
                ratingCount: 234500,
                trending: true,
                trendingChange: 12,
                spotifyId: nil,
                appleMusicId: nil,
                metadata: nil
            ),
            MusicItem(
                id: "2",
                type: .song,
                title: "Blinding Lights",
                artist: "The Weeknd",
                imageUrl: "https://images.unsplash.com/photo-1616663395403-2e0052b8e595?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=400&fit=crop",
                rating: 9.2,
                ratingCount: 456000,
                trending: true,
                trendingChange: 8,
                spotifyId: nil,
                appleMusicId: nil,
                metadata: nil
            ),
            MusicItem(
                id: "3",
                type: .album,
                title: "Blonde",
                artist: "Frank Ocean",
                imageUrl: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=400&fit=crop",
                rating: 9.5,
                ratingCount: 567800,
                trending: false,
                trendingChange: nil,
                spotifyId: nil,
                appleMusicId: nil,
                metadata: nil
            )
        ]
    }
}

