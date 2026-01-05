//
//  Rating.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import Foundation

struct Rating: Identifiable, Codable {
    let id: String
    let userId: String
    let musicItemId: String
    let rating: Int // 1-10
    let tags: [String]
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId
        case musicItemId
        case rating
        case tags
        case createdAt
        case updatedAt
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        userId = try container.decode(String.self, forKey: .userId)
        musicItemId = try container.decode(String.self, forKey: .musicItemId)
        rating = try container.decode(Int.self, forKey: .rating)
        tags = try container.decode([String].self, forKey: .tags)
        
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
        try container.encode(musicItemId, forKey: .musicItemId)
        try container.encode(rating, forKey: .rating)
        try container.encode(tags, forKey: .tags)
        
        let formatter = ISO8601DateFormatter()
        try container.encode(formatter.string(from: createdAt), forKey: .createdAt)
        try container.encode(formatter.string(from: updatedAt), forKey: .updatedAt)
    }
}

struct CreateRatingRequest: Codable {
    let musicItemId: String
    let rating: Int
    let tags: [String]
}

struct RatingResponse: Codable {
    let rating: Rating
    let message: String
}

