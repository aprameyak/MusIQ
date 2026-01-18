import SwiftUI

struct MusicSearchView: View {
    @ObservedObject var viewModel: HomeFeedViewModel
    @FocusState private var isSearchFocused: Bool
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                HStack {
                    TextField("Search for music...", text: $viewModel.searchQuery)
                        .textFieldStyle(.plain)
                        .padding(AppStyles.paddingMedium)
                        .background(AppColors.secondaryBackground)
                        .cornerRadius(AppStyles.cornerRadiusMedium)
                        .focused($isSearchFocused)
                        .onChange(of: viewModel.searchQuery) { _, newValue in
                            Task {
                                await viewModel.searchMusic(query: newValue)
                            }
                        }
                    
                    if !viewModel.searchQuery.isEmpty {
                        Button(action: {
                            viewModel.searchQuery = ""
                            viewModel.searchResults = []
                        }) {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(AppColors.textSecondary)
                        }
                    }
                }
                .padding(AppStyles.paddingMedium)
                
                if viewModel.isSearching {
                    Spacer()
                    ProgressView()
                        .tint(AppColors.primary)
                    Spacer()
                } else if viewModel.searchResults.isEmpty && !viewModel.searchQuery.isEmpty {
                    Spacer()
                    VStack(spacing: 16) {
                        Image(systemName: "magnifyingglass")
                            .font(.system(size: 48))
                            .foregroundColor(AppColors.textSecondary)
                        
                        Text("No results found")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(AppColors.textSecondary)
                        
                        Text("Try searching for an artist, song, or album")
                            .font(.system(size: 14))
                            .foregroundColor(AppColors.textSecondary)
                    }
                    Spacer()
                } else if viewModel.searchQuery.isEmpty {
                    Spacer()
                    VStack(spacing: 16) {
                        Image(systemName: "music.note.list")
                            .font(.system(size: 48))
                            .foregroundColor(AppColors.textSecondary)
                        
                        Text("Search for music")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(AppColors.textPrimary)
                        
                        Text("Find artists, songs, or albums to rate")
                            .font(.system(size: 14))
                            .foregroundColor(AppColors.textSecondary)
                    }
                    Spacer()
                } else {
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            ForEach(viewModel.searchResults) { item in
                                MusicSearchResultCard(item: item) {
                                    viewModel.selectMusicItemForPost(item)
                                }
                                .padding(.horizontal, AppStyles.paddingMedium)
                            }
                        }
                        .padding(.top, 8)
                        .padding(.bottom, 20)
                    }
                }
            }
            .background(AppColors.background)
            .navigationTitle("Create Post")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") {
                        viewModel.showSearchView = false
                        viewModel.searchQuery = ""
                        viewModel.searchResults = []
                    }
                }
            }
        }
        .onAppear {
            isSearchFocused = true
        }
    }
}

struct MusicSearchResultCard: View {
    let item: MusicItem
    let onSelect: () -> Void
    
    private var iconName: String {
        switch item.type {
        case .album:
            return "opticaldisc.fill"
        case .song:
            return "music.note"
        case .artist:
            return "person.fill"
        }
    }
    
    private var iconColor: Color {
        switch item.type {
        case .album:
            return AppColors.primary
        case .song:
            return AppColors.secondary
        case .artist:
            return AppColors.accent
        }
    }
    
    var body: some View {
        Button(action: onSelect) {
            HStack(spacing: 12) {
                RoundedRectangle(cornerRadius: AppStyles.cornerRadiusSmall)
                    .fill(AppColors.secondaryBackground)
                    .frame(width: 56, height: 56)
                    .overlay(
                        Image(systemName: iconName)
                            .font(.system(size: 24))
                            .foregroundColor(iconColor)
                    )
                
                VStack(alignment: .leading, spacing: 6) {
                    HStack(spacing: 6) {
                        Image(systemName: iconName)
                            .font(.system(size: 10))
                            .foregroundColor(iconColor)
                        
                        Text(item.type.rawValue.capitalized)
                            .font(.system(size: 10, weight: .semibold))
                            .foregroundColor(iconColor)
                    }
                    .padding(.horizontal, 6)
                    .padding(.vertical, 3)
                    .background(iconColor.opacity(0.15))
                    .cornerRadius(8)
                    
                    Text(item.title)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(AppColors.textPrimary)
                        .lineLimit(1)
                    
                    if let artist = item.artist {
                        Text(artist)
                            .font(.system(size: 14))
                            .foregroundColor(AppColors.textSecondary)
                            .lineLimit(1)
                    }
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.system(size: 14))
                    .foregroundColor(AppColors.textSecondary)
            }
            .padding(AppStyles.paddingMedium)
            .background(AppColors.cardBackground)
            .cornerRadius(AppStyles.cornerRadiusMedium)
        }
        .buttonStyle(.plain)
    }
}
