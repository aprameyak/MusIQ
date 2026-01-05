//
//  OnboardingView.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import SwiftUI

struct OnboardingSlide {
    let icon: String
    let title: String
    let description: String
    let color: Color
}

struct OnboardingView: View {
    @State private var currentSlide = 0
    @State private var slideOffset: CGFloat = 0
    
    let slides: [OnboardingSlide] = [
        OnboardingSlide(
            icon: "music.note",
            title: "Rate Your Music",
            description: "Share your honest opinions on albums, songs, and artists",
            color: AppColors.primaryPurple
        ),
        OnboardingSlide(
            icon: "sparkles",
            title: "Discover New Sounds",
            description: "Explore trending music and personalized recommendations",
            color: AppColors.primaryGreen
        ),
        OnboardingSlide(
            icon: "person.2.fill",
            title: "Influence the Charts",
            description: "Your ratings shape the global music rankings",
            color: AppColors.accentPink
        ),
        OnboardingSlide(
            icon: "trophy.fill",
            title: "Build Your Profile",
            description: "Create your unique taste DNA and compare with friends",
            color: AppColors.accentYellow
        )
    ]
    
    let onComplete: () -> Void
    
    var body: some View {
        ZStack {
            AppColors.background
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Skip button
                HStack {
                    Spacer()
                    Button("Skip") {
                        onComplete()
                    }
                    .foregroundColor(AppColors.textSecondary)
                    .font(.system(size: 14))
                    .padding(.trailing, AppStyles.paddingMedium)
                    .padding(.top, AppStyles.paddingMedium)
                }
                
                Spacer()
                
                // Slide content
                TabView(selection: $currentSlide) {
                    ForEach(0..<slides.count, id: \.self) { index in
                        OnboardingSlideView(slide: slides[index])
                            .tag(index)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .frame(height: 400)
                
                Spacer()
                
                // Dots indicator
                HStack(spacing: 8) {
                    ForEach(0..<slides.count, id: \.self) { index in
                        Capsule()
                            .fill(
                                currentSlide == index ?
                                AppColors.primaryGreen :
                                AppColors.secondaryBackground
                            )
                            .frame(
                                width: currentSlide == index ? 24 : 8,
                                height: 8
                            )
                            .animation(.spring(response: 0.3), value: currentSlide)
                    }
                }
                .padding(.bottom, 32)
                
                // Next/Start button
                Button(action: {
                    if currentSlide < slides.count - 1 {
                        withAnimation {
                            currentSlide += 1
                        }
                    } else {
                        onComplete()
                    }
                }) {
                    Text(currentSlide == slides.count - 1 ? "Start Rating Now" : "Next")
                        .font(.system(size: 16, weight: .semibold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, AppStyles.paddingMedium)
                }
                .gradientButton()
                .padding(.horizontal, AppStyles.paddingLarge)
                .padding(.bottom, 32)
                
                // Social login options (only on last slide)
                if currentSlide == slides.count - 1 {
                    VStack(spacing: 16) {
                        HStack {
                            Rectangle()
                                .fill(AppColors.secondaryBackground)
                                .frame(height: 1)
                            
                            Text("or continue with")
                                .font(.system(size: 12))
                                .foregroundColor(AppColors.textSecondary)
                            
                            Rectangle()
                                .fill(AppColors.secondaryBackground)
                                .frame(height: 1)
                        }
                        .padding(.horizontal, AppStyles.paddingLarge)
                        
                        HStack(spacing: 12) {
                            Button(action: {}) {
                                Text("Spotify")
                                    .font(.system(size: 14, weight: .medium))
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 12)
                            }
                            .cardStyle()
                            
                            Button(action: {}) {
                                Text("Apple")
                                    .font(.system(size: 14, weight: .medium))
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 12)
                            }
                            .cardStyle()
                        }
                        .padding(.horizontal, AppStyles.paddingLarge)
                        .padding(.bottom, 32)
                    }
                    .transition(.opacity)
                }
            }
        }
    }
}

struct OnboardingSlideView: View {
    let slide: OnboardingSlide
    @State private var iconScale: CGFloat = 0
    
    var body: some View {
        VStack(spacing: 32) {
            // Icon
            ZStack {
                Circle()
                    .fill(slide.color.opacity(0.2))
                    .frame(width: 96, height: 96)
                
                Image(systemName: slide.icon)
                    .font(.system(size: 48))
                    .foregroundColor(slide.color)
            }
            .scaleEffect(iconScale)
            
            // Title
            Text(slide.title)
                .font(.system(size: 32, weight: .bold))
                .foregroundColor(AppColors.textPrimary)
            
            // Description
            Text(slide.description)
                .font(.system(size: 18))
                .foregroundColor(AppColors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, AppStyles.paddingLarge)
        }
        .onAppear {
            withAnimation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.1)) {
                iconScale = 1
            }
        }
    }
}

#Preview {
    OnboardingView(onComplete: {})
}

