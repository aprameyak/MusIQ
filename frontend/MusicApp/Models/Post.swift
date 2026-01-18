import Foundation

struct Post: Identifiable, Codable {
    let id: String
    let username: String
    let text: String?
    let rating: Int
    let musicItem: PostMusicItem
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case username
        case text
        case rating
        case musicItem
        case createdAt
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        username = try container.decode(String.self, forKey: .username)
        text = try container.decodeIfPresent(String.self, forKey: .text)
        rating = try container.decode(Int.self, forKey: .rating)
        musicItem = try container.decode(PostMusicItem.self, forKey: .musicItem)
        
        let formatter = ISO8601DateFormatter()
        let createdAtString = try container.decode(String.self, forKey: .createdAt)
        createdAt = formatter.date(from: createdAtString) ?? Date()
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(username, forKey: .username)
        try container.encodeIfPresent(text, forKey: .text)
        try container.encode(rating, forKey: .rating)
        try container.encode(musicItem, forKey: .musicItem)
        
        let formatter = ISO8601DateFormatter()
        try container.encode(formatter.string(from: createdAt), forKey: .createdAt)
    }
}

struct PostMusicItem: Codable {
    let id: String
    let type: MusicItemType
    let title: String
    let artist: String?
    let imageUrl: String?
    let spotifyId: String?
    let appleMusicId: String?
    let metadata: [String: AnyCodable]?
    
    enum CodingKeys: String, CodingKey {
        case id
        case type
        case title
        case artist
        case imageUrl
        case spotifyId
        case appleMusicId
        case metadata
    }
}

struct CreatePostRequest: Codable {
    let musicItemId: String
    let rating: Int
    let text: String?
}

struct CreatePostWithMusicItemRequest: Codable {
    let name: String
    let category: String
    let rating: Int
    let text: String?
}


struct Pagination: Codable {
    let page: Int
    let limit: Int
    let total: Int
    let hasMore: Bool
    let nextPage: Int?
}
