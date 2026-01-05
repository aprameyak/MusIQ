//
//  SplashScreenView.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import SwiftUI

struct SplashScreenView: View {
    @State private var showContent = false
    @State private var logoScale: CGFloat = 0
    @State private var logoRotation: Double = -180
    @State private var glowScale: CGFloat = 1
    @State private var glowOpacity: Double = 0.5
    @State private var sparkle1Rotation: Double = 0
    @State private var sparkle2Rotation: Double = 0
    @State private var loadingDots: [Bool] = [false, false, false]
    
    let onComplete: () -> Void
    
    var body: some View {
        ZStack {
            AppGradients.background
                .ignoresSafeArea()
            
            VStack(spacing: 32) {
                // Logo animation
                ZStack {
                    // Outer glow ring
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [
                                    AppColors.primaryPurple.opacity(glowOpacity),
                                    AppColors.primaryGreen.opacity(glowOpacity)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 140, height: 140)
                        .blur(radius: 20)
                        .scaleEffect(glowScale)
                    
                    // Main logo circle
                    ZStack {
                        Circle()
                            .fill(AppGradients.primary)
                            .frame(width: 96, height: 96)
                        
                        Image(systemName: "music.note")
                            .font(.system(size: 48))
                            .foregroundColor(.white)
                    }
                    .scaleEffect(logoScale)
                    .rotationEffect(.degrees(logoRotation))
                    
                    // Sparkle decorations
                    Image(systemName: "sparkles")
                        .font(.system(size: 24))
                        .foregroundColor(AppColors.primaryGreen)
                        .offset(x: -48, y: -48)
                        .rotationEffect(.degrees(sparkle1Rotation))
                        .scaleEffect(glowScale)
                    
                    Image(systemName: "sparkles")
                        .font(.system(size: 20))
                        .foregroundColor(AppColors.accentPink)
                        .offset(x: 48, y: 48)
                        .rotationEffect(.degrees(sparkle2Rotation))
                        .scaleEffect(glowScale * 1.2)
                }
                .padding(.top, 100)
                
                // App name
                VStack(spacing: 8) {
                    Text("Pulse")
                        .font(.system(size: 48, weight: .bold))
                        .foregroundColor(AppColors.textPrimary)
                        .shadow(color: AppColors.primaryGreen.opacity(0.5), radius: 20)
                        .opacity(showContent ? 1 : 0)
                    
                    Text("Rate. Discover. Influence.")
                        .font(.system(size: 16))
                        .foregroundColor(AppColors.textSecondary)
                        .opacity(showContent ? 1 : 0)
                }
                .padding(.top, 32)
                
                // Loading indicator
                HStack(spacing: 8) {
                    ForEach(0..<3) { index in
                        Circle()
                            .fill(
                                loadingDots[index] ?
                                AppColors.primaryGreen :
                                AppColors.primaryPurple.opacity(0.5)
                            )
                            .frame(width: 8, height: 8)
                    }
                }
                .padding(.top, 48)
                .opacity(showContent ? 1 : 0)
            }
        }
        .onAppear {
            // Logo animation
            withAnimation(.spring(response: 0.8, dampingFraction: 0.6)) {
                logoScale = 1
                logoRotation = 0
            }
            
            // Content fade in
            withAnimation(.easeInOut(duration: 0.3).delay(0.3)) {
                showContent = true
            }
            
            // Glow pulse animation
            withAnimation(.easeInOut(duration: 2).repeatForever(autoreverses: true)) {
                glowScale = 1.2
                glowOpacity = 0.8
            }
            
            // Sparkle rotations
            withAnimation(.linear(duration: 3).repeatForever(autoreverses: false)) {
                sparkle1Rotation = 360
            }
            
            withAnimation(.linear(duration: 4).repeatForever(autoreverses: false)) {
                sparkle2Rotation = -360
            }
            
            // Loading dots animation
            for i in 0..<3 {
                withAnimation(
                    .easeInOut(duration: 1)
                    .repeatForever(autoreverses: true)
                    .delay(Double(i) * 0.2)
                ) {
                    loadingDots[i] = true
                }
            }
            
            // Auto-transition after 1.5 seconds
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                onComplete()
            }
        }
    }
}

#Preview {
    SplashScreenView(onComplete: {})
}

