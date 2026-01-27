import Foundation
import Supabase

class AuthService {
    private let supabase = SupabaseClient(supabaseURL: URL(string: "https:
    private let apiService = APIService.shared

    func signup(email: String, password: String, firstName: String, lastName: String, username: String) async throws {
        do {
            let response: APIResponse<EmptyResponse> = try await apiService.request(
                endpoint: "/auth/signup",
                method: .post,
                body: SignupRequest(email: email, username: username, password: password, firstName: firstName, lastName: lastName),
                requiresAuth: false
            )

            guard response.success else {
                if let error = response.error {
                    throw NetworkError.unknown(NSError(domain: "AuthService", code: Int(error.code) ?? 400, userInfo: [NSLocalizedDescriptionKey: error.message]))
                }
                throw NetworkError.unknown(NSError(domain: "AuthService", code: -1, userInfo: [NSLocalizedDescriptionKey: "Signup failed"]))
            }
        } catch let error as NetworkError {
            throw error
        } catch {
            throw NetworkError.unknown(error)
        }
    }

    func login(email: String, password: String) async throws -> AuthToken {
        do {
            let response: APIResponse<AuthToken> = try await apiService.request(
                endpoint: "/auth/login",
                method: .post,
                body: LoginRequest(email: email, password: password),
                requiresAuth: false
            )

            guard response.success, let data = response.data else {
                if let error = response.error {
                    throw NetworkError.unknown(NSError(domain: "AuthService", code: Int(error.code) ?? 401, userInfo: [NSLocalizedDescriptionKey: error.message]))
                }
                throw NetworkError.unauthorized
            }
            return data
        } catch let error as NetworkError {
            throw error
        } catch {
            throw NetworkError.unknown(error)
        }
    }

    func forgotPassword(email: String) async throws {
        do {
            try await supabase.auth.resetPasswordForEmail(email)
        } catch {
            throw NetworkError.unknown(error)
        }
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
        try await supabase.auth.signOut()
        KeychainHelper.clearAll()
    }
}

struct EmptyBody: Codable {}
struct EmptyResponse: Codable {}
