import SwiftUI

struct SignupView: View {
    @StateObject private var viewModel = AuthViewModel()
    @ObservedObject var appState: AppState
    
    var body: some View {
        ZStack {
            AppColors.background
                .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 32) {
                    
                    ZStack {
                        Circle()
                            .fill(AppColors.primary)
                            .frame(width: 120, height: 120)
                        
                        Image(systemName: "music.note")
                            .font(.system(size: 60))
                            .foregroundColor(.white)
                    }
                    .padding(.top, 40)
                    
                    Text("Create Account")
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
                            
                            Text("3-30 characters, letters, numbers, and underscores only")
                                .font(.system(size: 11))
                                .foregroundColor(AppColors.textSecondary)
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
                                .onChange(of: viewModel.password) { newValue in
                                    viewModel.passwordErrors = viewModel.validatePassword(newValue)
                                }
                            
                            if !viewModel.passwordErrors.isEmpty {
                                VStack(alignment: .leading, spacing: 4) {
                                    ForEach(viewModel.passwordErrors, id: \.self) { error in
                                        Text("• \(error)")
                                            .font(.system(size: 11))
                                            .foregroundColor(AppColors.accent)
                                    }
                                }
                            } else if !viewModel.password.isEmpty {
                                Text("✓ Password meets all requirements")
                                    .font(.system(size: 11))
                                    .foregroundColor(.green)
                            }
                        }
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Confirm Password")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(AppColors.textSecondary)
                            
                            SecureField("", text: $viewModel.confirmPassword)
                                .textFieldStyle(PlainTextFieldStyle())
                                .padding()
                                .background(AppColors.cardBackground)
                                .cornerRadius(AppStyles.cornerRadiusMedium)
                                .overlay(
                                    RoundedRectangle(cornerRadius: AppStyles.cornerRadiusMedium)
                                        .stroke(AppColors.border, lineWidth: 1)
                                )
                                .foregroundColor(AppColors.textPrimary)
                            
                            if !viewModel.confirmPassword.isEmpty {
                                if viewModel.password == viewModel.confirmPassword {
                                    Text("✓ Passwords match")
                                        .font(.system(size: 11))
                                        .foregroundColor(.green)
                                } else {
                                    Text("Passwords do not match")
                                        .font(.system(size: 11))
                                        .foregroundColor(AppColors.accent)
                                }
                            }
                        }
                        
                        if let error = viewModel.errorMessage {
                            Text(error)
                                .font(.system(size: 14))
                                .foregroundColor(AppColors.accent)
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }
                        
                        Button(action: {
                            Task {
                                await viewModel.signup()
                            }
                        }) {
                            if viewModel.isLoading {
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Text("Sign Up")
                                    .font(.system(size: 16, weight: .semibold))
                            }
                        }
                        .gradientButton(isEnabled: !viewModel.isLoading)
                        .disabled(viewModel.isLoading)
                    }
                    .padding(.horizontal, AppStyles.paddingLarge)
                    
                    Spacer()
                        .frame(height: 40)
                }
            }
        }
    }
}

#Preview {
    SignupView(appState: AppState())
}
