import Foundation

enum NotificationType: String, Codable {
    case impact
    case badge
    case social
    case trending
}

struct AppNotification: Identifiable, Codable {
    let id: String
    let userId: String
    let type: NotificationType
    let title: String
    let message: String
    let read: Bool
    let metadata: [String: AnyCodable]?
    let createdAt: Date
    
    init(
        id: String,
        userId: String,
        type: NotificationType,
        title: String,
        message: String,
        read: Bool,
        metadata: [String: AnyCodable]? = nil,
        createdAt: Date
    ) {
        self.id = id
        self.userId = userId
        self.type = type
        self.title = title
        self.message = message
        self.read = read
        self.metadata = metadata
        self.createdAt = createdAt
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId
        case type
        case title
        case message
        case read
        case metadata
        case createdAt
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        userId = try container.decode(String.self, forKey: .userId)
        type = try container.decode(NotificationType.self, forKey: .type)
        title = try container.decode(String.self, forKey: .title)
        message = try container.decode(String.self, forKey: .message)
        read = try container.decode(Bool.self, forKey: .read)
        metadata = try container.decodeIfPresent([String: AnyCodable].self, forKey: .metadata)
        
        let formatter = ISO8601DateFormatter()
        let createdAtString = try container.decode(String.self, forKey: .createdAt)
        createdAt = formatter.date(from: createdAtString) ?? Date()
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(userId, forKey: .userId)
        try container.encode(type, forKey: .type)
        try container.encode(title, forKey: .title)
        try container.encode(message, forKey: .message)
        try container.encode(read, forKey: .read)
        try container.encodeIfPresent(metadata, forKey: .metadata)
        
        let formatter = ISO8601DateFormatter()
        try container.encode(formatter.string(from: createdAt), forKey: .createdAt)
    }
}

extension AppNotification {
    var timeAgo: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: createdAt, relativeTo: Date())
    }
}
