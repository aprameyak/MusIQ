//
//  ImageLoader.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import SwiftUI

// AsyncImage is already built into SwiftUI, so this is a helper extension
extension AsyncImage {
    static func musicImage(url: String, placeholder: String = "music.note") -> some View {
        AsyncImage(url: URL(string: url)) { phase in
            switch phase {
            case .empty:
                ZStack {
                    Rectangle()
                        .fill(AppColors.secondaryBackground)
                    ProgressView()
                        .tint(AppColors.primaryGreen)
                }
            case .success(let image):
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            case .failure:
                ZStack {
                    Rectangle()
                        .fill(AppColors.secondaryBackground)
                    Image(systemName: placeholder)
                        .font(.system(size: 24))
                        .foregroundColor(AppColors.textSecondary)
                }
            @unknown default:
                EmptyView()
            }
        }
    }
}

