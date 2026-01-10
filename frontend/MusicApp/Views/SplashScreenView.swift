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
                
                ZStack {
                    
                    Circle()
                        .fill(AppColors.primary.opacity(glowOpacity * 0.3))
                        .frame(width: 140, height: 140)
                        .blur(radius: 20)
                        .scaleEffect(glowScale)
                    
                    ZStack {
                        Circle()
                            .fill(AppColors.primary)
                            .frame(width: 96, height: 96)
                        
                        Image(systemName: "music.note")
                            .font(.system(size: 48))
                            .foregroundColor(.white)
                    }
                    .scaleEffect(logoScale)
                    .rotationEffect(.degrees(logoRotation))
                    
                    Image(systemName: "sparkles")
                        .font(.system(size: 24))
                        .foregroundColor(AppColors.primary)
                        .offset(x: -48, y: -48)
                        .rotationEffect(.degrees(sparkle1Rotation))
                        .scaleEffect(glowScale)
                    
                    Image(systemName: "sparkles")
                        .font(.system(size: 20))
                        .foregroundColor(AppColors.secondary)
                        .offset(x: 48, y: 48)
                        .rotationEffect(.degrees(sparkle2Rotation))
                        .scaleEffect(glowScale * 1.2)
                }
                .padding(.top, 100)
                
                VStack(spacing: 8) {
                    Text("MusIQ")
                        .font(.system(size: 48, weight: .bold))
                        .foregroundColor(AppColors.textPrimary)
                        .shadow(color: AppColors.primary.opacity(0.2), radius: 20)
                        .opacity(showContent ? 1 : 0)
                    
                    Text("Rate. Discover. Influence.")
                        .font(.system(size: 16))
                        .foregroundColor(AppColors.textSecondary)
                        .opacity(showContent ? 1 : 0)
                }
                .padding(.top, 32)
                
                HStack(spacing: 8) {
                    ForEach(0..<3) { index in
                        Circle()
                            .fill(
                                loadingDots[index] ?
                                AppColors.primary :
                                AppColors.secondary.opacity(0.5)
                            )
                            .frame(width: 8, height: 8)
                    }
                }
                .padding(.top, 48)
                .opacity(showContent ? 1 : 0)
            }
        }
        .onAppear {
            
            withAnimation(.spring(response: 0.8, dampingFraction: 0.6)) {
                logoScale = 1
                logoRotation = 0
            }
            
            withAnimation(.easeInOut(duration: 0.3).delay(0.3)) {
                showContent = true
            }
            
            withAnimation(.easeInOut(duration: 2).repeatForever(autoreverses: true)) {
                glowScale = 1.2
                glowOpacity = 0.8
            }
            
            withAnimation(.linear(duration: 3).repeatForever(autoreverses: false)) {
                sparkle1Rotation = 360
            }
            
            withAnimation(.linear(duration: 4).repeatForever(autoreverses: false)) {
                sparkle2Rotation = -360
            }
            
            for i in 0..<3 {
                withAnimation(
                    .easeInOut(duration: 1)
                    .repeatForever(autoreverses: true)
                    .delay(Double(i) * 0.2)
                ) {
                    loadingDots[i] = true
                }
            }
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                onComplete()
            }
        }
    }
}

#Preview {
    SplashScreenView(onComplete: {})
}
