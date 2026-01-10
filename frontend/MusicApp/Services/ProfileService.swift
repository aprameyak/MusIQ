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
            throw NetworkError.unauthorized
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
