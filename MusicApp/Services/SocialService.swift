import Foundation

class SocialService {
    private let apiService = APIService.shared
    
    func getFriends() async throws -> [Friend] {
        let response: APIResponse<[Friend]> = try await apiService.request(
            endpoint: "/social/friends",
            method: .get
        )
        
        guard response.success, let data = response.data else {
            return []
        }
        
        return data
    }
    
    func follow(userId: String) async throws {
        _ = try await apiService.request(
            endpoint: "/social/follow/\(userId)",
            method: .post,
            body: EmptyBody(),
            requiresAuth: true
        ) as APIResponse<EmptyResponse>
    }
    
    func getCompatibility(userId: String) async throws -> Int {
        let response: APIResponse<CompatibilityResponse> = try await apiService.request(
            endpoint: "/social/compatibility/\(userId)",
            method: .get
        )
        
        guard response.success, let data = response.data else {
            return 0
        }
        
        return data.compatibility
    }
    
    func compareTaste(userId: String) async throws -> TasteComparison {
        let response: APIResponse<TasteComparison> = try await apiService.request(
            endpoint: "/social/compare/\(userId)",
            method: .get
        )
        
        guard response.success, let data = response.data else {
            throw NetworkError.unknown(NSError(domain: "SocialService", code: -1))
        }
        
        return data
    }
}

struct CompatibilityResponse: Codable {
    let compatibility: Int
}

struct TasteComparison: Codable {
    let compatibility: Int
    let sharedArtists: Int
    let sharedGenres: [String]
}
