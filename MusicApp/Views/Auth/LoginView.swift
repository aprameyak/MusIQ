//
//  LoginView.swift
//  MusicApp
//
//  Created on 1/5/26.
//

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
                
                // Logo
                ZStack {
                    Circle()
                        .fill(AppGradients.primary)
                        .frame(width: 120, height: 120)
                    
                    Image(systemName: "music.note")
                        .font(.system(size: 60))
                        .foregroundColor(.white)
                }
                .padding(.bottom, 16)
                
                // Title
                Text("Welcome Back")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(AppColors.textPrimary)
                
                // Form
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
                                    .stroke(AppColors.borderPurple, lineWidth: 1)
                            )
                            .foregroundColor(AppColors.textPrimary)
                            .autocapitalization(.none)
                            .keyboardType(.emailAddress)
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
                                    .stroke(AppColors.borderPurple, lineWidth: 1)
                            )
                            .foregroundColor(AppColors.textPrimary)
                    }
                    
                    if let error = viewModel.errorMessage {
                        Text(error)
                            .font(.system(size: 14))
                            .foregroundColor(AppColors.accentPink)
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
                
                // Social login
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
            }
        }
    }
}

#Preview {
    LoginView(appState: AppState())
}

