//
//  AuthService.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import Foundation

class AuthService {
    private let apiService = APIService.shared
    
    func login(request: LoginRequest) async throws -> AuthToken {
        let response: APIResponse<AuthToken> = try await apiService.request(
            endpoint: "/auth/login",
            method: .post,
            body: request,
            requiresAuth: false
        )
        
        guard response.success, let data = response.data else {
            throw NetworkError.unauthorized
        }
        
        return data
    }
    
    func signup(request: SignupRequest) async throws -> AuthToken {
        let response: APIResponse<AuthToken> = try await apiService.request(
            endpoint: "/auth/signup",
            method: .post,
            body: request,
            requiresAuth: false
        )
        
        guard response.success, let data = response.data else {
            throw NetworkError.unknown(NSError(domain: "AuthService", code: -1))
        }
        
        return data
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

struct EmptyBody: Encodable {}
struct EmptyResponse: Decodable {}

