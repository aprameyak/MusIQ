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
                                        .stroke(viewModel.emailError != nil ? AppColors.accent : AppColors.border, lineWidth: 1)
                                )
                                .foregroundColor(AppColors.textPrimary)
                                .autocapitalization(.none)
                                .keyboardType(.emailAddress)
                            
                            if let emailError = viewModel.emailError {
                                Text(emailError)
                                    .font(.system(size: 11))
                                    .foregroundColor(AppColors.accent)
                            } else if !viewModel.email.isEmpty && viewModel.emailError == nil {
                                Text("Valid email")
                                    .font(.system(size: 11))
                                    .foregroundColor(.green)
                            }
                        }
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("First Name")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(AppColors.textSecondary)
                            
                            TextField("", text: $viewModel.firstName)
                                .textFieldStyle(PlainTextFieldStyle())
                                .padding()
                                .background(AppColors.cardBackground)
                                .cornerRadius(AppStyles.cornerRadiusMedium)
                                .overlay(
                                    RoundedRectangle(cornerRadius: AppStyles.cornerRadiusMedium)
                                        .stroke(viewModel.firstNameError != nil ? AppColors.accent : AppColors.border, lineWidth: 1)
                                )
                                .foregroundColor(AppColors.textPrimary)
                                .autocapitalization(.words)
                            
                            if let firstNameError = viewModel.firstNameError {
                                Text(firstNameError)
                                    .font(.system(size: 11))
                                    .foregroundColor(AppColors.accent)
                            } else if !viewModel.firstName.isEmpty && viewModel.firstNameError == nil {
                                Text("Valid")
                                    .font(.system(size: 11))
                                    .foregroundColor(.green)
                            }
                        }
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Last Name")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(AppColors.textSecondary)
                            
                            TextField("", text: $viewModel.lastName)
                                .textFieldStyle(PlainTextFieldStyle())
                                .padding()
                                .background(AppColors.cardBackground)
                                .cornerRadius(AppStyles.cornerRadiusMedium)
                                .overlay(
                                    RoundedRectangle(cornerRadius: AppStyles.cornerRadiusMedium)
                                        .stroke(viewModel.lastNameError != nil ? AppColors.accent : AppColors.border, lineWidth: 1)
                                )
                                .foregroundColor(AppColors.textPrimary)
                                .autocapitalization(.words)
                            
                            if let lastNameError = viewModel.lastNameError {
                                Text(lastNameError)
                                    .font(.system(size: 11))
                                    .foregroundColor(AppColors.accent)
                            } else if !viewModel.lastName.isEmpty && viewModel.lastNameError == nil {
                                Text("Valid")
                                    .font(.system(size: 11))
                                    .foregroundColor(.green)
                            }
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
                                        Text("- \(error)")
                                            .font(.system(size: 11))
                                            .foregroundColor(AppColors.accent)
                                    }
                                }
                            } else if !viewModel.password.isEmpty && viewModel.passwordErrors.isEmpty {
                                Text("Password meets all requirements")
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
                        }
                        
                                                if let errorMessage = viewModel.errorMessage {
                            Text(errorMessage)
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
                        .gradientButton(isEnabled: !viewModel.isLoading && viewModel.emailError == nil && viewModel.firstNameError == nil && viewModel.lastNameError == nil && viewModel.passwordErrors.isEmpty && viewModel.password == viewModel.confirmPassword)
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
