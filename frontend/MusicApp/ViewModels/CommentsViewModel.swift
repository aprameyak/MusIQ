import Foundation
import Combine

@MainActor
class CommentsViewModel: ObservableObject {
    @Published var comments: [Comment] = []
    @Published var newCommentText: String = ""
    @Published var isLoading: Bool = false
    @Published var isSubmitting: Bool = false
    @Published var errorMessage: String?
    
    private let postService: PostService
    let postId: String
    
    init(postId: String, postService: PostService = PostService()) {
        self.postId = postId
        self.postService = postService
    }
    
    func loadComments() async {
        isLoading = true
        errorMessage = nil
        
        do {
            self.comments = try await postService.getComments(postId: postId)
        } catch {
            self.errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func submitComment() async {
        guard !newCommentText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        
        isSubmitting = true
        errorMessage = nil
        
        do {
            let comment = try await postService.addComment(postId: postId, text: newCommentText)
            self.comments.append(comment)
            self.newCommentText = ""
        } catch {
            self.errorMessage = error.localizedDescription
        }
        
        isSubmitting = false
    }
}
