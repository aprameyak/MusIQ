import Foundation

struct APIResponse<T: Codable>: Codable {
    let success: Bool
    let data: T?
    let message: String?
    let error: APIError?
}

struct APIError: Codable {
    let code: String
    let message: String
    let details: [String: AnyCodable]?
    let stack: String?
    
    enum CodingKeys: String, CodingKey {
        case code
        case message
        case details
        case stack
    }
}

struct PaginatedResponse<T: Codable>: Codable {
    let data: [T]
    let page: Int
    let limit: Int
    let total: Int
    let hasMore: Bool
}
