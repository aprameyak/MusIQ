//
//  AuthToken.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import Foundation

struct AuthToken: Codable {
    let accessToken: String
    let refreshToken: String
    let expiresIn: Int // seconds
    let tokenType: String
    
    enum CodingKeys: String, CodingKey {
        case accessToken
        case refreshToken
        case expiresIn
        case tokenType
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
}

struct RefreshTokenRequest: Codable {
    let refreshToken: String
}

struct OAuthRequest: Codable {
    let provider: String // "apple", "google", "spotify"
    let token: String
    let idToken: String?
}

