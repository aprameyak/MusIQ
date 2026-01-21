import Foundation

enum UserRole: String, Codable {
    case user
    case moderator
    case admin
}

enum OAuthProvider: String, Codable {
    case apple
    case google
}

struct User: Identifiable, Codable {
    let id: String
    let email: String
    let username: String
    let emailVerified: Bool
    let mfaEnabled: Bool
    let role: UserRole
    let oauthProvider: OAuthProvider?
    let oauthId: String?
    let firstName: String?
    let lastName: String?
    let lastLoginAt: Date?
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case email
        case username
        case emailVerified = "email_verified"
        case mfaEnabled = "mfa_enabled"
        case role
        case oauthProvider = "oauth_provider"
        case oauthId = "oauth_id"
        case firstName = "first_name"
        case lastName = "last_name"
        case lastLoginAt = "last_login_at"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        email = try container.decode(String.self, forKey: .email)
        username = try container.decode(String.self, forKey: .username)
        emailVerified = try container.decode(Bool.self, forKey: .emailVerified)
        mfaEnabled = try container.decode(Bool.self, forKey: .mfaEnabled)
        role = try container.decode(UserRole.self, forKey: .role)
        oauthProvider = try container.decodeIfPresent(OAuthProvider.self, forKey: .oauthProvider)
        oauthId = try container.decodeIfPresent(String.self, forKey: .oauthId)
        firstName = try container.decodeIfPresent(String.self, forKey: .firstName)
        lastName = try container.decodeIfPresent(String.self, forKey: .lastName)
        
        if let lastLoginString = try? container.decode(String.self, forKey: .lastLoginAt) {
            let formatter = ISO8601DateFormatter()
            formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            lastLoginAt = formatter.date(from: lastLoginString)
        } else {
            lastLoginAt = nil
        }
        
        let createdAtString = try container.decode(String.self, forKey: .createdAt)
        let updatedAtString = try container.decode(String.self, forKey: .updatedAt)
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        createdAt = formatter.date(from: createdAtString) ?? Date()
        updatedAt = formatter.date(from: updatedAtString) ?? Date()
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(email, forKey: .email)
        try container.encode(username, forKey: .username)
        try container.encode(emailVerified, forKey: .emailVerified)
        try container.encode(mfaEnabled, forKey: .mfaEnabled)
        try container.encode(role, forKey: .role)
        try container.encodeIfPresent(oauthProvider, forKey: .oauthProvider)
        try container.encodeIfPresent(oauthId, forKey: .oauthId)
        try container.encodeIfPresent(firstName, forKey: .firstName)
        try container.encodeIfPresent(lastName, forKey: .lastName)
        
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let lastLoginAt = lastLoginAt {
            try container.encode(formatter.string(from: lastLoginAt), forKey: .lastLoginAt)
        }
        try container.encode(formatter.string(from: createdAt), forKey: .createdAt)
        try container.encode(formatter.string(from: updatedAt), forKey: .updatedAt)
    }
}

struct UserProfile: Codable {
    let user: User
    let tasteScore: Int
    let totalRatings: Int
    let influence: Int
}
