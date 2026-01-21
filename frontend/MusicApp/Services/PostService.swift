import Foundation

class PostService {
    private let apiService = APIService.shared
    
    func createPost(musicItemId: String, rating: Int, text: String?) async throws -> Post {
        let request = CreatePostRequest(
            musicItemId: musicItemId,
            rating: rating,
            text: text
        )
        
        let response: APIResponse<PostResponse> = try await apiService.request(
            endpoint: "/posts",
            method: .post,
            body: request,
            requiresAuth: true
        )
        
        guard response.success, let data = response.data else {
            throw NetworkError.unknown(NSError(domain: "PostService", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to create post"]))
        }
        
        return data.post
    }
    
    func createPostWithMusicItem(name: String, category: MusicItemType, rating: Int, text: String?) async throws -> Post {
        let request = CreatePostWithMusicItemRequest(
            name: name,
            category: category.rawValue,
            rating: rating,
            text: text
        )
        
        let response: APIResponse<PostResponse> = try await apiService.request(
            endpoint: "/posts/create",
            method: .post,
            body: request,
            requiresAuth: true
        )
        
        guard response.success, let data = response.data else {
            throw NetworkError.unknown(NSError(domain: "PostService", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to create post"]))
        }
        
        return data.post
    }
    
    func getFeed(page: Int = 1, limit: Int = 20) async throws -> (items: [Post], hasMore: Bool, nextPage: Int?) {
        let endpoint = "/posts/feed?page=\(page)&limit=\(limit)"
        let response: APIResponse<PostFeedResponse> = try await apiService.request(
            endpoint: endpoint,
            method: .get,
            requiresAuth: true
        )
        
        guard response.success, let data = response.data else {
            throw NetworkError.unknown(NSError(domain: "PostService", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to load feed"]))
        }
        
        return (
            items: data.data,
            hasMore: data.pagination?.hasMore ?? false,
            nextPage: data.pagination?.nextPage
        )
    }
}

struct PostResponse: Codable {
    let post: Post
}

struct PostFeedResponse: Codable {
    let data: [Post]
    let pagination: Pagination?
}
