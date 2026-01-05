//
//  TasteProfileView.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import SwiftUI
import Charts

struct TasteProfileView: View {
    @StateObject private var viewModel = TasteProfileViewModel()
    
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
                            Text("Your Taste DNA")
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(AppColors.textPrimary)
                            
                            Text("Discover your unique music profile")
                                .font(.system(size: 14))
                                .foregroundColor(AppColors.textSecondary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, AppStyles.paddingMedium)
                        .padding(.top, AppStyles.paddingLarge)
                        
                        // Stats cards
                        HStack(spacing: 12) {
                            StatCard(
                                icon: "sparkles",
                                value: "\(viewModel.tasteScore)",
                                label: "Taste Score",
                                gradient: LinearGradient(
                                    colors: [AppColors.primaryPurple, AppColors.primaryPurple.opacity(0.7)],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            
                            StatCard(
                                icon: "trophy.fill",
                                value: "\(viewModel.totalRatings)",
                                label: "Ratings",
                                gradient: LinearGradient(
                                    colors: [AppColors.primaryGreen, AppColors.primaryGreen.opacity(0.7)],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            
                            StatCard(
                                icon: "target",
                                value: "\(viewModel.influence.formatted())",
                                label: "Influence",
                                gradient: LinearGradient(
                                    colors: [AppColors.accentPink, AppColors.accentPink.opacity(0.7)],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                        }
                        .padding(.horizontal, AppStyles.paddingMedium)
                        
                        // Genre Affinity
                        VStack(alignment: .leading, spacing: 16) {
                            HStack(spacing: 8) {
                                Image(systemName: "music.note")
                                    .font(.system(size: 20))
                                    .foregroundColor(AppColors.primaryPurple)
                                
                                Text("Genre Affinity")
                                    .font(.system(size: 18, weight: .semibold))
                                    .foregroundColor(AppColors.textPrimary)
                            }
                            
                            Chart(viewModel.genreData) { item in
                                BarMark(
                                    x: .value("Value", item.value),
                                    y: .value("Genre", item.name)
                                )
                                .foregroundStyle(
                                    item.name == "Hip-Hop" || item.name == "Pop" || item.name == "Electronic" ?
                                    AppColors.primaryPurple :
                                    AppColors.primaryGreen
                                )
                                .cornerRadius(4)
                            }
                            .frame(height: 200)
                            .chartXAxis(.hidden)
                            .chartYAxis {
                                AxisMarks { _ in
                                    AxisValueLabel()
                                        .foregroundStyle(AppColors.textSecondary)
                                        .font(.system(size: 12))
                                }
                            }
                        }
                        .padding(AppStyles.paddingMedium)
                        .cardStyle()
                        .padding(.horizontal, AppStyles.paddingMedium)
                        
                        // Decade Preference
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Decade Preference")
                                .font(.system(size: 18, weight: .semibold))
                                .foregroundColor(AppColors.textPrimary)
                            
                            ForEach(viewModel.decadeData) { decade in
                                VStack(alignment: .leading, spacing: 4) {
                                    HStack {
                                        Text(decade.decade)
                                            .font(.system(size: 14))
                                            .foregroundColor(AppColors.textSecondary)
                                        
                                        Spacer()
                                        
                                        Text("\(decade.value)%")
                                            .font(.system(size: 14, weight: .medium))
                                            .foregroundColor(AppColors.textPrimary)
                                    }
                                    
                                    GeometryReader { geometry in
                                        ZStack(alignment: .leading) {
                                            Rectangle()
                                                .fill(AppColors.secondaryBackground)
                                                .frame(height: 8)
                                                .cornerRadius(4)
                                            
                                            Rectangle()
                                                .fill(AppGradients.primary)
                                                .frame(width: geometry.size.width * CGFloat(decade.value) / 100, height: 8)
                                                .cornerRadius(4)
                                        }
                                    }
                                    .frame(height: 8)
                                }
                            }
                        }
                        .padding(AppStyles.paddingMedium)
                        .cardStyle()
                        .padding(.horizontal, AppStyles.paddingMedium)
                        
                        // Music Attributes (Radar Chart placeholder - simplified as bar chart)
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Music Attributes")
                                .font(.system(size: 18, weight: .semibold))
                                .foregroundColor(AppColors.textPrimary)
                            
                            ForEach(viewModel.radarData) { item in
                                VStack(alignment: .leading, spacing: 4) {
                                    HStack {
                                        Text(item.category)
                                            .font(.system(size: 14))
                                            .foregroundColor(AppColors.textSecondary)
                                        
                                        Spacer()
                                        
                                        Text("\(item.value)")
                                            .font(.system(size: 14, weight: .medium))
                                            .foregroundColor(AppColors.textPrimary)
                                    }
                                    
                                    GeometryReader { geometry in
                                        ZStack(alignment: .leading) {
                                            Rectangle()
                                                .fill(AppColors.secondaryBackground)
                                                .frame(height: 6)
                                                .cornerRadius(3)
                                            
                                            Rectangle()
                                                .fill(AppColors.primaryPurple)
                                                .frame(width: geometry.size.width * CGFloat(item.value) / 100, height: 6)
                                                .cornerRadius(3)
                                        }
                                    }
                                    .frame(height: 6)
                                }
                            }
                        }
                        .padding(AppStyles.paddingMedium)
                        .cardStyle()
                        .padding(.horizontal, AppStyles.paddingMedium)
                        
                        // Controversy Affinity
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Controversy Affinity")
                                .font(.system(size: 18, weight: .semibold))
                                .foregroundColor(AppColors.textPrimary)
                            
                            ZStack {
                                Circle()
                                    .stroke(AppColors.secondaryBackground, lineWidth: 16)
                                    .frame(width: 192, height: 192)
                                
                                Circle()
                                    .trim(from: 0, to: CGFloat(viewModel.controversyAffinity) / 100)
                                    .stroke(
                                        LinearGradient(
                                            colors: [AppColors.accentPink, AppColors.primaryPurple],
                                            startPoint: .leading,
                                            endPoint: .trailing
                                        ),
                                        style: StrokeStyle(lineWidth: 16, lineCap: .round)
                                    )
                                    .frame(width: 192, height: 192)
                                    .rotationEffect(.degrees(-90))
                                
                                VStack(spacing: 4) {
                                    Text("\(viewModel.controversyAffinity)%")
                                        .font(.system(size: 36, weight: .bold))
                                        .foregroundColor(AppColors.textPrimary)
                                    
                                    Text("Bold")
                                        .font(.system(size: 14))
                                        .foregroundColor(AppColors.textSecondary)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            
                            HStack {
                                Text("Safe")
                                    .font(.system(size: 12))
                                    .foregroundColor(AppColors.textSecondary)
                                
                                Spacer()
                                
                                Text("Controversial")
                                    .font(.system(size: 12))
                                    .foregroundColor(AppColors.textSecondary)
                            }
                        }
                        .padding(AppStyles.paddingMedium)
                        .cardStyle()
                        .padding(.horizontal, AppStyles.paddingMedium)
                        .padding(.bottom, 100)
                    }
                }
            }
        }
        .task {
            await viewModel.loadProfile()
        }
    }
}

struct StatCard: View {
    let icon: String
    let value: String
    let label: String
    let gradient: LinearGradient
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundColor(.white.opacity(0.8))
            
            Text(value)
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(.white)
            
            Text(label)
                .font(.system(size: 10))
                .foregroundColor(.white.opacity(0.7))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(AppStyles.paddingMedium)
        .background(gradient)
        .cornerRadius(AppStyles.cornerRadiusMedium)
    }
}

#Preview {
    TasteProfileView()
}

