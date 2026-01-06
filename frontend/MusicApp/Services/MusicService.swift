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
    
    private func getMockFeedData() -> [MusicItem] {
        return [
            MusicItem(
                id: "1",
                type: .album,
                title: "ASTROWORLD",
                artist: "Travis Scott",
                imageUrl: "https://i.scdn.co/image/placeholder",
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
                imageUrl: "https://i.scdn.co/image/placeholder",
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
                imageUrl: "https://i.scdn.co/image/placeholder",
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
