import Foundation

struct AuthToken: Codable {
    let accessToken: String
    let refreshToken: String
    let expiresIn: Int 
    let tokenType: String
    
    enum CodingKeys: String, CodingKey {
        case accessToken
        case refreshToken
        case expiresIn
        case tokenType
    }
}

struct LoginRequest: Codable {
    let username: String
    let password: String
}

struct SignupRequest: Codable {
    let username: String
    let password: String
    let confirmPassword: String
}

struct RefreshTokenRequest: Codable {
    let refreshToken: String
}

struct OAuthRequest: Codable {
    let provider: String 
    let token: String
    let idToken: String?
}
