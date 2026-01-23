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

    func likePost(postId: String) async throws {
        _ = try await apiService.request(
            endpoint: "/posts/\(postId)/like",
            method: .post,
            requiresAuth: true
        ) as APIResponse<EmptyResponse>
    }

    func unlikePost(postId: String) async throws {
        _ = try await apiService.request(
            endpoint: "/posts/\(postId)/like",
            method: .delete,
            requiresAuth: true
        ) as APIResponse<EmptyResponse>
    }

    func getComments(postId: String) async throws -> [Comment] {
        let response: APIResponse<[Comment]> = try await apiService.request(
            endpoint: "/posts/\(postId)/comments",
            method: .get,
            requiresAuth: true
        )
        return response.data ?? []
    }

    func addComment(postId: String, text: String) async throws -> Comment {
        let request = CommentRequest(text: text)
        let response: APIResponse<Comment> = try await apiService.request(
            endpoint: "/posts/\(postId)/comment",
            method: .post,
            body: request,
            requiresAuth: true
        )
        
        guard let data = response.data else {
            throw NetworkError.unknown(NSError(domain: "PostService", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to add comment"]))
        }
        return data
    }

    func sharePost(postId: String, text: String?) async throws {
        let request = ShareRequest(text: text)
        _ = try await apiService.request(
            endpoint: "/posts/\(postId)/share",
            method: .post,
            body: request,
            requiresAuth: true
        ) as APIResponse<EmptyResponse>
    }
}

struct CommentRequest: Codable {
    let text: String
}

struct ShareRequest: Codable {
    let text: String?
}

struct Comment: Codable, Identifiable {
    let id: String
    let userId: String
    let username: String
    let text: String
    let createdAt: String
}

struct PostResponse: Codable {
    let post: Post
}

struct PostFeedResponse: Codable {
    let data: [Post]
    let pagination: Pagination?
}
