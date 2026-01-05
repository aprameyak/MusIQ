//
//  Friend.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import Foundation

enum FriendshipStatus: String, Codable {
    case pending
    case accepted
    case blocked
}

struct Friend: Identifiable, Codable {
    let id: String
    let name: String
    let username: String
    let avatar: String
    let compatibility: Int // 0-100
    let topGenre: String
    let sharedArtists: Int
    let status: FriendshipStatus?
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case username
        case avatar
        case compatibility
        case topGenre
        case sharedArtists
        case status
    }
}

struct Friendship: Identifiable, Codable {
    let id: String
    let userId: String
    let friendId: String
    let status: FriendshipStatus
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId
        case friendId
        case status
        case createdAt
        case updatedAt
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        userId = try container.decode(String.self, forKey: .userId)
        friendId = try container.decode(String.self, forKey: .friendId)
        status = try container.decode(FriendshipStatus.self, forKey: .status)
        
        let formatter = ISO8601DateFormatter()
        let createdAtString = try container.decode(String.self, forKey: .createdAt)
        let updatedAtString = try container.decode(String.self, forKey: .updatedAt)
        createdAt = formatter.date(from: createdAtString) ?? Date()
        updatedAt = formatter.date(from: updatedAtString) ?? Date()
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(userId, forKey: .userId)
        try container.encode(friendId, forKey: .friendId)
        try container.encode(status, forKey: .status)
        
        let formatter = ISO8601DateFormatter()
        try container.encode(formatter.string(from: createdAt), forKey: .createdAt)
        try container.encode(formatter.string(from: updatedAt), forKey: .updatedAt)
    }
}

