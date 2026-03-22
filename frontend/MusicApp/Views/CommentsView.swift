import SwiftUI

struct CommentsView: View {
    let postId: String
    var onCommentAdded: (() -> Void)? = nil
    @State private var comments: [Comment] = []
    @State private var isLoading = false
    @State private var commentText = ""
    @State private var isSubmitting = false
    @Environment(\.dismiss) private var dismiss
    private let postService = PostService()

    var body: some View {
        NavigationView {
            ZStack {
                AppColors.background.ignoresSafeArea()

                VStack(spacing: 0) {
                    if isLoading {
                        Spacer()
                        ProgressView().tint(AppColors.primary)
                        Spacer()
                    } else if comments.isEmpty {
                        Spacer()
                        VStack(spacing: 12) {
                            Image(systemName: "bubble.left")
                                .font(.system(size: 40))
                                .foregroundColor(AppColors.textSecondary)
                            Text("No comments yet")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(AppColors.textSecondary)
                        }
                        Spacer()
                    } else {
                        ScrollView {
                            LazyVStack(alignment: .leading, spacing: 16) {
                                ForEach(comments) { comment in
                                    CommentRowView(comment: comment)
                                }
                            }
                            .padding(AppStyles.paddingMedium)
                        }
                    }

                    Divider()

                    HStack(spacing: 12) {
                        TextField("Add a comment...", text: $commentText)
                            .textFieldStyle(.plain)
                            .font(.system(size: 15))
                            .foregroundColor(AppColors.textPrimary)

                        Button(action: submitComment) {
                            if isSubmitting {
                                ProgressView().tint(AppColors.primary)
                            } else {
                                Image(systemName: "paperplane.fill")
                                    .foregroundColor(
                                        commentText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                                            ? AppColors.textSecondary
                                            : AppColors.primary
                                    )
                            }
                        }
                        .disabled(commentText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || isSubmitting)
                    }
                    .padding(.horizontal, AppStyles.paddingMedium)
                    .padding(.vertical, 12)
                    .background(AppColors.secondaryBackground)
                }
            }
            .navigationTitle("Comments")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                        .foregroundColor(AppColors.primary)
                }
            }
        }
        .task {
            await loadComments()
        }
    }

    private func loadComments() async {
        isLoading = true
        do {
            comments = try await postService.getComments(postId: postId)
        } catch {}
        isLoading = false
    }

    private func submitComment() {
        let text = commentText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        isSubmitting = true
        commentText = ""
        Task {
            do {
                try await postService.addComment(postId: postId, text: text)
                onCommentAdded?()
                await loadComments()
            } catch {
                commentText = text
            }
            isSubmitting = false
        }
    }
}

struct CommentRowView: View {
    let comment: Comment

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            if let profileUrl = comment.profilePictureUrl, let url = URL(string: profileUrl) {
                AsyncImage(url: url) { image in
                    image.resizable().aspectRatio(contentMode: .fill)
                } placeholder: {
                    ProgressView()
                }
                .frame(width: 32, height: 32)
                .clipShape(Circle())
            } else {
                Circle()
                    .fill(AppColors.primary.opacity(0.1))
                    .frame(width: 32, height: 32)
                    .overlay(
                        Text(comment.username.prefix(1).uppercased())
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(AppColors.primary)
                    )
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Text(comment.username)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(AppColors.textPrimary)
                    Text(comment.createdAt.formatted(date: .abbreviated, time: .shortened))
                        .font(.system(size: 11))
                        .foregroundColor(AppColors.textSecondary)
                }
                Text(comment.text)
                    .font(.system(size: 14))
                    .foregroundColor(AppColors.textPrimary)
            }

            Spacer()
        }
    }
}
