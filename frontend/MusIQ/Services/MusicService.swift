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
            return []
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
}
