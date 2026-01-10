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
                            Text("Email")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(AppColors.textSecondary)
                            
                            TextField("", text: $viewModel.email)
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
                                .keyboardType(.emailAddress)
                        }
                        
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
                            AppleSignInButton(
                                onSuccess: { code, idToken in
                                    Task {
                                        await viewModel.loginWithApple(
                                            authorizationCode: code,
                                            identityToken: idToken
                                        )
                                    }
                                },
                                onError: { error in
                                    viewModel.errorMessage = error.localizedDescription
                                }
                            )
                            
                            GoogleSignInButton(
                                onSuccess: { code, idToken in
                                    Task {
                                        await viewModel.loginWithGoogle(
                                            authorizationCode: code,
                                            idToken: idToken
                                        )
                                    }
                                },
                                onError: { error in
                                    viewModel.errorMessage = error.localizedDescription
                                }
                            )
                        }
                        .padding(.horizontal, AppStyles.paddingLarge)
                    }
                    
                    Spacer()
                        .frame(height: 40)
                }
            }
        }
        .handleOAuthCallbacks(viewModel: viewModel)
    }
}

#Preview {
    SignupView(appState: AppState())
}
