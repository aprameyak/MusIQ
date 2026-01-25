import Foundation

struct Comment: Identifiable, Codable {
    let id: String
    let userId: String?
    let username: String
    let text: String
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "userId"
        case username
        case text
        case createdAt = "createdAt"
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        userId = try container.decodeIfPresent(String.self, forKey: .userId)
        username = try container.decode(String.self, forKey: .username)
        text = try container.decode(String.self, forKey: .text)
        
        let createdAtString = try container.decode(String.self, forKey: .createdAt)
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = formatter.date(from: createdAtString) {
            createdAt = date
        } else {
            let simpleFormatter = ISO8601DateFormatter()
            createdAt = simpleFormatter.date(from: createdAtString) ?? Date()
        }
    }
}
