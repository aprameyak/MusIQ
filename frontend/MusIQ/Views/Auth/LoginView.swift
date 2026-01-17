import SwiftUI

struct LoginView: View {
    @StateObject private var viewModel = AuthViewModel()
    @ObservedObject var appState: AppState
    
    var body: some View {
        ZStack {
            AppColors.background
                .ignoresSafeArea()
            
            VStack(spacing: 32) {
                Spacer()
                
                ZStack {
                    Circle()
                        .fill(AppColors.primary)
                        .frame(width: 120, height: 120)
                    
                    Image(systemName: "music.note")
                        .font(.system(size: 60))
                        .foregroundColor(.white)
                }
                .padding(.bottom, 16)
                
                Text("Welcome Back")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(AppColors.textPrimary)
                
                VStack(spacing: 20) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Username")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(AppColors.textSecondary)
                        
                        TextField("", text: $viewModel.username)
                            .textFieldStyle(PlainTextFieldStyle())
                            .padding()
                            .background(AppColors.cardBackground)
                            .cornerRadius(AppStyles.cornerRadiusMedium)
                            .overlay(
                                RoundedRectangle(cornerRadius: AppStyles.cornerRadiusMedium)
                                    .stroke(AppColors.border, lineWidth: 1)
                            )
                            .foregroundColor(AppColors.textPrimary)
                            .autocapitalization(.none)
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Password")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(AppColors.textSecondary)
                        
                        SecureField("", text: $viewModel.password)
                            .textFieldStyle(PlainTextFieldStyle())
                            .padding()
                            .background(AppColors.cardBackground)
                            .cornerRadius(AppStyles.cornerRadiusMedium)
                            .overlay(
                                RoundedRectangle(cornerRadius: AppStyles.cornerRadiusMedium)
                                    .stroke(AppColors.border, lineWidth: 1)
                            )
                            .foregroundColor(AppColors.textPrimary)
                    }
                    
                    if let error = viewModel.errorMessage {
                        Text(error)
                            .font(.system(size: 14))
                            .foregroundColor(AppColors.accent)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    
                    Button(action: {
                        Task {
                            await viewModel.login()
                        }
                    }) {
                        if viewModel.isLoading {
                            ProgressView()
                                .tint(.white)
                        } else {
                            Text("Log In")
                                .font(.system(size: 16, weight: .semibold))
                        }
                    }
                    .gradientButton(isEnabled: !viewModel.isLoading)
                    .disabled(viewModel.isLoading)
                }
                .padding(.horizontal, AppStyles.paddingLarge)
                
                
                Spacer()
            }
        }
    }
}

#Preview {
    LoginView(appState: AppState())
}
