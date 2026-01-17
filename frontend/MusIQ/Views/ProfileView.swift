import SwiftUI

struct ProfileView: View {
    @ObservedObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    @State private var isLoggingOut = false
    
    var body: some View {
        ZStack {
            AppColors.background
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                HStack {
                    Button(action: {
                        dismiss()
                    }) {
                        Image(systemName: "xmark")
                            .font(.system(size: 18))
                            .foregroundColor(AppColors.textSecondary)
                            .frame(width: 40, height: 40)
                            .background(AppColors.cardBackground)
                            .cornerRadius(AppStyles.cornerRadiusMedium)
                            .overlay(
                                RoundedRectangle(cornerRadius: AppStyles.cornerRadiusMedium)
                                    .stroke(AppColors.border, lineWidth: 1)
                            )
                    }
                    
                    Spacer()
                    
                    Text("Profile")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundColor(AppColors.textPrimary)
                    
                    Spacer()
                    
                    Color.clear
                        .frame(width: 40, height: 40)
                }
                .padding(.horizontal, AppStyles.paddingMedium)
                .padding(.top, AppStyles.paddingLarge)
                .padding(.bottom, AppStyles.paddingLarge)
                
                VStack(spacing: 24) {
                    VStack(spacing: 16) {
                        ZStack {
                            Circle()
                                .fill(AppColors.primary)
                                .frame(width: 80, height: 80)
                            
                            Text(appState.currentUser?.username.prefix(1).uppercased() ?? "U")
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(.white)
                        }
                        
                        Text(appState.currentUser?.username ?? "User")
                            .font(.system(size: 24, weight: .semibold))
                            .foregroundColor(AppColors.textPrimary)
                    }
                    .padding(.top, 40)
                    
                    Spacer()
                    
                    Button(action: {
                        Task {
                            isLoggingOut = true
                            do {
                                let authService = AuthService()
                                try await authService.logout()
                            } catch {
                                
                            }
                            appState.logout()
                            isLoggingOut = false
                        }
                    }) {
                        HStack {
                            if isLoggingOut {
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Image(systemName: "arrow.right.square")
                                    .font(.system(size: 16))
                                Text("Log Out")
                                    .font(.system(size: 16, weight: .semibold))
                            }
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, AppStyles.paddingMedium)
                        .background(AppColors.accent)
                        .cornerRadius(AppStyles.cornerRadiusMedium)
                    }
                    .disabled(isLoggingOut)
                    .padding(.horizontal, AppStyles.paddingLarge)
                    .padding(.bottom, 40)
                }
            }
        }
    }
}

#Preview {
    ProfileView(appState: AppState.shared)
}
