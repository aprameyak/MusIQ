import Foundation

class AuthService {
    private let apiService = APIService.shared
    
    func login(request: LoginRequest) async throws -> AuthToken {
        do {
            let response: APIResponse<AuthToken> = try await apiService.request(
                endpoint: "/auth/login",
                method: .post,
                body: request,
                requiresAuth: false
            )
            
            guard response.success, let data = response.data else {
                if let error = response.error {
                    print("❌ Login Error: \(error.code) - \(error.message)")
                    throw NetworkError.unknown(NSError(domain: "AuthService", code: Int(error.code) ?? 401, userInfo: [NSLocalizedDescriptionKey: error.message]))
                }
                throw NetworkError.unauthorized
            }
            
            return data
        } catch let error as NetworkError {
            throw error
        } catch {
            print("❌ Login Unexpected Error: \(error)")
            throw NetworkError.unknown(error)
        }
    }
    
    func signup(request: SignupRequest) async throws -> AuthToken {
        do {
            let response: APIResponse<AuthToken> = try await apiService.request(
                endpoint: "/auth/signup",
                method: .post,
                body: request,
                requiresAuth: false
            )
            
            guard response.success, let data = response.data else {
                if let error = response.error {
                    print("❌ Signup Error: \(error.code) - \(error.message)")
                    throw NetworkError.unknown(NSError(domain: "AuthService", code: Int(error.code) ?? 400, userInfo: [NSLocalizedDescriptionKey: error.message]))
                }
                throw NetworkError.unknown(NSError(domain: "AuthService", code: -1, userInfo: [NSLocalizedDescriptionKey: "Signup failed"]))
            }
            
            return data
        } catch let error as NetworkError {
            throw error
        } catch {
            print("❌ Signup Unexpected Error: \(error)")
            throw NetworkError.unknown(error)
        }
    }
    
    func refreshToken(request: RefreshTokenRequest) async throws -> AuthToken {
        let response: APIResponse<AuthToken> = try await apiService.request(
            endpoint: "/auth/refresh",
            method: .post,
            body: request,
            requiresAuth: false
        )
        
        guard response.success, let data = response.data else {
            throw NetworkError.unauthorized
        }
        
        return data
    }
    
    func getCurrentUser() async throws -> User {
        let response: APIResponse<User> = try await apiService.request(
            endpoint: "/profile",
            method: .get
        )
        
        guard response.success, let data = response.data else {
            throw NetworkError.unauthorized
        }
        
        return data
    }
    
    func logout() async throws {
        _ = try await apiService.request(
            endpoint: "/auth/logout",
            method: .post,
            body: EmptyBody(),
            requiresAuth: true
        ) as APIResponse<EmptyResponse>
        
        KeychainHelper.clearAll()
    }
}

struct EmptyBody: Codable {}
struct EmptyResponse: Codable {}
