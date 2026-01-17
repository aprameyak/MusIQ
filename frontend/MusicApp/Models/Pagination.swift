import Foundation

struct PaginatedFeedResponse: Codable {
    let data: [MusicItem]
    let pagination: PaginationInfo?
}

struct PaginationInfo: Codable {
    let page: Int
    let limit: Int
    let total: Int
    let hasMore: Bool
    let nextPage: Int?
}
