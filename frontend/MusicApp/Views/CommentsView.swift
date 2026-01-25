import SwiftUI

struct CommentsView: View {
    @StateObject var viewModel: CommentsViewModel
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                if viewModel.isLoading {
                    Spacer()
                    ProgressView().tint(AppColors.primary)
                    Spacer()
                } else if viewModel.comments.isEmpty {
                    Spacer()
                    VStack(spacing: 12) {
                        Image(systemName: "bubble.left.and.bubble.right")
                            .font(.system(size: 40))
                            .foregroundColor(AppColors.textSecondary)
                        Text("No comments yet")
                            .foregroundColor(AppColors.textSecondary)
                        Text("Be the first to share your thoughts!")
                            .font(.system(size: 14))
                            .foregroundColor(AppColors.textSecondary)
                    }
                    Spacer()
                } else {
                    ScrollView {
                        LazyVStack(spacing: 16) {
                            ForEach(viewModel.comments) { comment in
                                CommentRow(comment: comment)
                            }
                        }
                        .padding(AppStyles.paddingMedium)
                    }
                }
                
                Divider()
                
                HStack(spacing: 12) {
                    TextField("Add a comment...", text: $viewModel.newCommentText)
                        .padding(12)
                        .background(AppColors.secondaryBackground)
                        .cornerRadius(20)
                        .foregroundColor(AppColors.textPrimary)
                    
                    Button(action: {
                        Task {
                            await viewModel.submitComment()
                        }
                    }) {
                        if viewModel.isSubmitting {
                            ProgressView().tint(AppColors.primary)
                        } else {
                            Image(systemName: "paperplane.fill")
                                .foregroundColor(viewModel.newCommentText.isEmpty ? AppColors.textSecondary : AppColors.primary)
                                .font(.system(size: 20))
                        }
                    }
                    .disabled(viewModel.newCommentText.isEmpty || viewModel.isSubmitting)
                }
                .padding(AppStyles.paddingMedium)
                .background(AppColors.background)
            }
            .navigationTitle("Comments")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .background(AppColors.background)
            .task {
                await viewModel.loadComments()
            }
        }
    }
}

struct CommentRow: View {
    let comment: Comment
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Circle()
                .fill(AppColors.primary.opacity(0.1))
                .frame(width: 36, height: 36)
                .overlay(
                    Text(comment.username.prefix(1).uppercased())
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(AppColors.primary)
                )
            
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(comment.username)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(AppColors.textPrimary)
                    
                    Spacer()
                    
                    Text(comment.createdAt.formatted(.dateTime.day().month().hour().minute()))
                        .font(.system(size: 10))
                        .foregroundColor(AppColors.textSecondary)
                }
                
                Text(comment.text)
                    .font(.system(size: 14))
                    .foregroundColor(AppColors.textPrimary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }
}
