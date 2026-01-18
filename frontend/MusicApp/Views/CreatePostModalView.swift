import SwiftUI

struct CreatePostModalView: View {
    @ObservedObject var viewModel: CreatePostViewModel
    let onClose: () -> Void
    let onSubmit: () -> Void
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                ScrollView {
                    VStack(spacing: 24) {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Music Item")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(AppColors.textPrimary)
                            
                            TextField("Enter artist, song, or album name", text: $viewModel.musicItemName)
                                .textFieldStyle(.plain)
                                .padding(AppStyles.paddingMedium)
                                .background(AppColors.secondaryBackground)
                                .cornerRadius(AppStyles.cornerRadiusSmall)
                        }
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Category")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(AppColors.textPrimary)
                            
                            Picker("Category", selection: $viewModel.category) {
                                Text("Album").tag(MusicItemType.album)
                                Text("Song").tag(MusicItemType.song)
                                Text("Artist").tag(MusicItemType.artist)
                            }
                            .pickerStyle(.segmented)
                        }
                        
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Rating")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(AppColors.textPrimary)
                            
                            HStack(spacing: 8) {
                                ForEach(1...10, id: \.self) { star in
                                    Button(action: {
                                        viewModel.setRating(star)
                                    }) {
                                        Image(systemName: "star.fill")
                                            .font(.system(size: 28))
                                            .foregroundColor(
                                                star <= (viewModel.hoverRating > 0 ? viewModel.hoverRating : viewModel.rating) ?
                                                    AppColors.secondary :
                                                    AppColors.secondaryBackground
                                            )
                                    }
                                    .onHover { hovering in
                                        if hovering {
                                            viewModel.setHoverRating(star)
                                        } else {
                                            viewModel.setHoverRating(0)
                                        }
                                    }
                                }
                            }
                            
                            if viewModel.rating > 0 {
                                Text("\(viewModel.rating)/10")
                                    .font(.system(size: 18, weight: .semibold))
                                    .foregroundColor(AppColors.primary)
                            }
                        }
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Description (optional)")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(AppColors.textPrimary)
                            
                            TextField("Share your thoughts...", text: $viewModel.description, axis: .vertical)
                                .textFieldStyle(.plain)
                                .padding(AppStyles.paddingMedium)
                                .background(AppColors.secondaryBackground)
                                .cornerRadius(AppStyles.cornerRadiusSmall)
                                .lineLimit(3...8)
                        }
                        
                        if let errorMessage = viewModel.errorMessage {
                            Text(errorMessage)
                                .font(.system(size: 14))
                                .foregroundColor(.red)
                                .padding(.horizontal, AppStyles.paddingMedium)
                        }
                    }
                    .padding(AppStyles.paddingLarge)
                }
                
                Button(action: {
                    Task {
                        if await viewModel.submitPost() {
                            onSubmit()
                            onClose()
                        }
                    }
                }) {
                    Text("Post")
                        .font(.system(size: 16, weight: .semibold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, AppStyles.paddingMedium)
                }
                .gradientButton(isEnabled: viewModel.canSubmit && !viewModel.isSubmitting)
                .padding(.horizontal, AppStyles.paddingLarge)
                .padding(.bottom, AppStyles.paddingLarge)
            }
            .background(AppColors.background)
            .navigationTitle("Create Post")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") {
                        onClose()
                    }
                }
            }
        }
    }
}
