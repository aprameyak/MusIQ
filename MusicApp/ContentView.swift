import SwiftUI

struct ContentView: View {
    @StateObject private var appState = AppState.shared
    @State private var showSplash = true
    
    var body: some View {
        ZStack {
            if showSplash {
                SplashScreenView(onComplete: {
                    withAnimation {
                        showSplash = false
                    }
                })
                .transition(.opacity)
            } else {
                Group {
                    switch appState.currentScreen {
                    case .splash:
                        SplashScreenView(onComplete: {
                            appState.completeOnboarding()
                        })
                    case .onboarding:
                        OnboardingView(onComplete: {
                            appState.completeOnboarding()
                        })
                    case .authentication:
                        AuthenticationView(appState: appState)
                    case .main:
                        MainAppView(appState: appState)
                    }
                }
                .transition(.opacity)
            }
        }
        .animation(.easeInOut, value: appState.currentScreen)
        .animation(.easeInOut, value: showSplash)
    }
}

struct AuthenticationView: View {
    @ObservedObject var appState: AppState
    @State private var isLogin = true
    
    var body: some View {
        ZStack {
            AppColors.background
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                
                HStack(spacing: 0) {
                    Button(action: {
                        withAnimation {
                            isLogin = true
                        }
                    }) {
                        Text("Log In")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(isLogin ? AppColors.textPrimary : AppColors.textSecondary)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(
                                isLogin ?
                                AppColors.cardBackground :
                                Color.clear
                            )
                    }
                    
                    Button(action: {
                        withAnimation {
                            isLogin = false
                        }
                    }) {
                        Text("Sign Up")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(!isLogin ? AppColors.textPrimary : AppColors.textSecondary)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(
                                !isLogin ?
                                AppColors.cardBackground :
                                Color.clear
                            )
                    }
                }
                .background(AppColors.background)
                .overlay(
                    Rectangle()
                        .frame(height: 1)
                        .foregroundColor(AppColors.borderPurple),
                    alignment: .bottom
                )
                
                if isLogin {
                    LoginView(appState: appState)
                } else {
                    SignupView(appState: appState)
                }
            }
        }
    }
}

#Preview {
    ContentView()
}
