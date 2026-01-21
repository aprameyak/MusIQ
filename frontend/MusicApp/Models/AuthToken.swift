import Foundation

struct AuthToken: Codable {
    let accessToken: String
    let refreshToken: String
    let expiresIn: Int
    let tokenType: String
    let emailVerified: Bool?
    
    enum CodingKeys: String, CodingKey {
        case accessToken
        case refreshToken
        case expiresIn
        case tokenType
        case emailVerified
    }
}

struct LoginRequest: Codable {
    let email: String
    let password: String
}

struct SignupRequest: Codable {
    let email: String
    let username: String
    let password: String
    let firstName: String
    let lastName: String
}

struct RefreshTokenRequest: Codable {
    let refreshToken: String
}