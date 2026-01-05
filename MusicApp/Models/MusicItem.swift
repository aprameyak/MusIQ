//
//  MusicItem.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import Foundation

enum MusicItemType: String, Codable {
    case album
    case song
    case artist
}

struct MusicItem: Identifiable, Codable {
    let id: String
    let type: MusicItemType
    let title: String
    let artist: String
    let imageUrl: String
    let rating: Double
    let ratingCount: Int
    let trending: Bool?
    let trendingChange: Int?
    let spotifyId: String?
    let appleMusicId: String?
    let metadata: [String: AnyCodable]?
    
    enum CodingKeys: String, CodingKey {
        case id
        case type
        case title
        case artist
        case imageUrl
        case rating
        case ratingCount
        case trending
        case trendingChange
        case spotifyId
        case appleMusicId
        case metadata
    }
}

// Helper for encoding/decoding Any values
struct AnyCodable: Codable {
    let value: Any
    
    init(_ value: Any) {
        self.value = value
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        
        if let bool = try? container.decode(Bool.self) {
            value = bool
        } else if let int = try? container.decode(Int.self) {
            value = int
        } else if let double = try? container.decode(Double.self) {
            value = double
        } else if let string = try? container.decode(String.self) {
            value = string
        } else if let array = try? container.decode([AnyCodable].self) {
            value = array.map { $0.value }
        } else if let dictionary = try? container.decode([String: AnyCodable].self) {
            value = dictionary.mapValues { $0.value }
        } else {
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "AnyCodable value cannot be decoded")
        }
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        
        switch value {
        case let bool as Bool:
            try container.encode(bool)
        case let int as Int:
            try container.encode(int)
        case let double as Double:
            try container.encode(double)
        case let string as String:
            try container.encode(string)
        case let array as [Any]:
            try container.encode(array.map { AnyCodable($0) })
        case let dictionary as [String: Any]:
            try container.encode(dictionary.mapValues { AnyCodable($0) })
        default:
            throw EncodingError.invalidValue(value, EncodingError.Context(codingPath: container.codingPath, debugDescription: "AnyCodable value cannot be encoded"))
        }
    }
}

