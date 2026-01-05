//
//  SocialView.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import SwiftUI

struct SocialView: View {
    @StateObject private var viewModel = SocialViewModel()
    
    var body: some View {
        ZStack {
            AppColors.background
                .ignoresSafeArea()
            
            if viewModel.isLoading {
                ProgressView()
                    .tint(AppColors.primaryGreen)
            } else {
                ScrollView {
                    VStack(spacing: 24) {
                        // Header
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Social")
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(AppColors.textPrimary)
                            
                            Text("Compare taste with friends")
                                .font(.system(size: 14))
                                .foregroundColor(AppColors.textSecondary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, AppStyles.paddingMedium)
                        .padding(.top, AppStyles.paddingLarge)
                        
                        // Share button
                        Button(action: {}) {
                            HStack {
                                Image(systemName: "square.and.arrow.up")
                                    .font(.system(size: 18))
                                
                                Text("Share Your Taste Profile")
                                    .font(.system(size: 16, weight: .semibold))
                            }
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, AppStyles.paddingMedium)
                            .background(AppGradients.primary)
                            .cornerRadius(AppStyles.cornerRadiusMedium)
                        }
                        .padding(.horizontal, AppStyles.paddingMedium)
                        
                        // Friends list
                        VStack(alignment: .leading, spacing: 16) {
                            HStack(spacing: 8) {
                                Image(systemName: "person.2.fill")
                                    .font(.system(size: 20))
                                    .foregroundColor(AppColors.primaryPurple)
                                
                                Text("Your Friends")
                                    .font(.system(size: 18, weight: .semibold))
                                    .foregroundColor(AppColors.textPrimary)
                            }
                            
                            ForEach(viewModel.friends) { friend in
                                FriendCardView(
                                    friend: friend,
                                    compatibilityColor: viewModel.getCompatibilityColor(friend.compatibility),
                                    compatibilityEmoji: viewModel.getCompatibilityEmoji(friend.compatibility)
                                )
                            }
                        }
                        .padding(AppStyles.paddingMedium)
                        .cardStyle()
                        .padding(.horizontal, AppStyles.paddingMedium)
                        
                        // Invite friends CTA
                        VStack(spacing: 16) {
                            Image(systemName: "person.2.fill")
                                .font(.system(size: 48))
                                .foregroundColor(AppColors.primaryPurple.opacity(0.5))
                            
                            Text("Invite Friends")
                                .font(.system(size: 18, weight: .semibold))
                                .foregroundColor(AppColors.textPrimary)
                            
                            Text("See how your taste compares with more friends")
                                .font(.system(size: 14))
                                .foregroundColor(AppColors.textSecondary)
                                .multilineTextAlignment(.center)
                            
                            Button(action: {}) {
                                Text("Invite Friends")
                                    .font(.system(size: 16, weight: .semibold))
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 12)
                                    .background(AppGradients.primary)
                                    .cornerRadius(AppStyles.cornerRadiusMedium)
                            }
                        }
                        .padding(AppStyles.paddingLarge)
                        .cardStyle()
                        .padding(.horizontal, AppStyles.paddingMedium)
                        .padding(.bottom, 100)
                    }
                }
            }
        }
        .task {
            await viewModel.loadFriends()
        }
    }
}

struct FriendCardView: View {
    let friend: Friend
    let compatibilityColor: Color
    let compatibilityEmoji: String
    
    var body: some View {
        VStack(spacing: 16) {
            HStack(spacing: 16) {
                // Avatar
                AsyncImage(url: URL(string: friend.avatar)) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Circle()
                        .fill(AppColors.secondaryBackground)
                }
                .frame(width: 64, height: 64)
                .clipShape(Circle())
                
                // Info
                VStack(alignment: .leading, spacing: 4) {
                    Text(friend.name)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(AppColors.textPrimary)
                        .lineLimit(1)
                    
                    Text(friend.username)
                        .font(.system(size: 14))
                        .foregroundColor(AppColors.textSecondary)
                        .lineLimit(1)
                    
                    HStack(spacing: 12) {
                        HStack(spacing: 4) {
                            Image(systemName: "music.note")
                                .font(.system(size: 12))
                                .foregroundColor(AppColors.textSecondary)
                            
                            Text(friend.topGenre)
                                .font(.system(size: 12))
                                .foregroundColor(AppColors.textSecondary)
                        }
                        
                        Text("\(friend.sharedArtists) shared")
                            .font(.system(size: 12))
                            .foregroundColor(AppColors.textSecondary)
                    }
                }
                
                Spacer()
                
                // Compatibility score
                VStack(spacing: 4) {
                    Text(compatibilityEmoji)
                        .font(.system(size: 32))
                    
                    Text("\(friend.compatibility)%")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(compatibilityColor)
                }
            }
            
            // Actions
            HStack(spacing: 8) {
                Button(action: {}) {
                    HStack {
                        Image(systemName: "square.and.arrow.up")
                            .font(.system(size: 14))
                        
                        Text("Compare")
                            .font(.system(size: 14))
                    }
                    .foregroundColor(AppColors.textSecondary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(AppColors.secondaryBackground)
                    .cornerRadius(AppStyles.cornerRadiusMedium)
                }
                
                Button(action: {}) {
                    Image(systemName: "heart")
                        .font(.system(size: 16))
                        .foregroundColor(AppColors.textSecondary)
                        .frame(width: 44, height: 44)
                        .background(AppColors.secondaryBackground)
                        .cornerRadius(AppStyles.cornerRadiusMedium)
                }
            }
            
            // Compatibility bar
            VStack(spacing: 4) {
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        Rectangle()
                            .fill(AppColors.secondaryBackground)
                            .frame(height: 6)
                            .cornerRadius(3)
                        
                        Rectangle()
                            .fill(
                                LinearGradient(
                                    colors: [compatibilityColor, AppColors.primaryPurple],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .frame(width: geometry.size.width * CGFloat(friend.compatibility) / 100, height: 6)
                            .cornerRadius(3)
                    }
                }
                .frame(height: 6)
                
                Text("Taste Match")
                    .font(.system(size: 10))
                    .foregroundColor(AppColors.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .center)
            }
        }
        .padding(AppStyles.paddingMedium)
        .background(AppColors.background)
        .cornerRadius(AppStyles.cornerRadiusMedium)
    }
}

#Preview {
    SocialView()
}

