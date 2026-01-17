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
            color: AppColors.primary
        ),
        OnboardingSlide(
            icon: "sparkles",
            title: "Discover New Sounds",
            description: "Explore trending music and personalized recommendations",
            color: AppColors.secondary
        ),
        OnboardingSlide(
            icon: "person.2.fill",
            title: "Influence the Charts",
            description: "Your ratings shape the global music rankings",
            color: AppColors.accent
        ),
        OnboardingSlide(
            icon: "trophy.fill",
            title: "Build Your Profile",
            description: "Create your unique taste DNA and compare with friends",
            color: AppColors.secondary
        )
    ]
    
    let onComplete: () -> Void
    
    var body: some View {
        ZStack {
            AppColors.background
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                
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
                
                TabView(selection: $currentSlide) {
                    ForEach(0..<slides.count, id: \.self) { index in
                        OnboardingSlideView(slide: slides[index])
                            .tag(index)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .frame(height: 400)
                
                Spacer()
                
                HStack(spacing: 8) {
                    ForEach(0..<slides.count, id: \.self) { index in
                        Capsule()
                            .fill(
                                currentSlide == index ?
                                AppColors.primary :
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
                        
                        VStack(spacing: 12) {
                            AppleSignInButton(
                                onSuccess: { code, idToken in },
                                onError: { _ in }
                            )
                            
                            GoogleSignInButton(
                                onSuccess: { code, idToken in },
                                onError: { _ in }
                            )
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
            
            ZStack {
                Circle()
                    .fill(slide.color.opacity(0.2))
                    .frame(width: 96, height: 96)
                
                Image(systemName: slide.icon)
                    .font(.system(size: 48))
                    .foregroundColor(slide.color)
            }
            .scaleEffect(iconScale)
            
            Text(slide.title)
                .font(.system(size: 32, weight: .bold))
                .foregroundColor(AppColors.textPrimary)
            
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
