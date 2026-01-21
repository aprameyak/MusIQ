import SwiftUI

struct ProfileView: View {
    @ObservedObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    @StateObject private var viewModel = ProfileEditViewModel()
    @State private var isLoggingOut = false
    @State private var showSuccessMessage = false
    
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
                
                ScrollView {
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
                    
                        VStack(spacing: 20) {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Email")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(AppColors.textSecondary)
                                
                                HStack {
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
                                        .keyboardType(.emailAddress)
                                        .autocapitalization(.none)
                                        .disabled(viewModel.isUpdating)
                                    
                                    if let emailError = viewModel.emailError {
                                        Text(emailError)
                                            .font(.system(size: 11))
                                            .foregroundColor(AppColors.accent)
                                    }
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
                                    .disabled(viewModel.isUpdating)
                                
                                if let firstNameError = viewModel.firstNameError {
                                    Text(firstNameError)
                                        .font(.system(size: 11))
                                        .foregroundColor(AppColors.accent)
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
                                    .disabled(viewModel.isUpdating)
                                
                                if let lastNameError = viewModel.lastNameError {
                                    Text(lastNameError)
                                        .font(.system(size: 11))
                                        .foregroundColor(AppColors.accent)
                                }
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Username")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(AppColors.textSecondary)
                                
                                TextField("", text: .constant(viewModel.username))
                                    .textFieldStyle(PlainTextFieldStyle())
                                    .padding()
                                    .background(AppColors.secondaryBackground)
                                    .cornerRadius(AppStyles.cornerRadiusMedium)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: AppStyles.cornerRadiusMedium)
                                            .stroke(AppColors.border, lineWidth: 1)
                                    )
                                    .foregroundColor(AppColors.textSecondary)
                                    .disabled(true)
                            }
                            
                            if let error = viewModel.updateError {
                                Text(error)
                                    .font(.system(size: 14))
                                    .foregroundColor(AppColors.accent)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }
                            
                            if showSuccessMessage {
                                Text("Profile updated successfully")
                                    .font(.system(size: 14))
                                    .foregroundColor(.green)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }
                            
                            Button(action: {
                                Task {
                                    if await viewModel.updateProfile() {
                                        showSuccessMessage = true
                                        let authService = AuthService()
                                        do {
                                            let updatedUser = try await authService.getCurrentUser()
                                            appState.currentUser = updatedUser
                                        } catch {
                                            
                                        }
                                        
                                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                            showSuccessMessage = false
                                        }
                                    }
                                }
                            }) {
                                if viewModel.isUpdating {
                                    ProgressView()
                                        .tint(.white)
                                } else {
                                    Text("Save")
                                        .font(.system(size: 16, weight: .semibold))
                                }
                            }
                            .gradientButton(isEnabled: viewModel.canSave)
                            .disabled(!viewModel.canSave)
                    
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
                        }
                    .padding(.horizontal, AppStyles.paddingLarge)
                    .padding(.bottom, 40)
                    }
                }
                .onAppear {
                    if let user = appState.currentUser {
                        viewModel.loadProfile(user: user)
                    }
                }
            }
        }
    }
}

#Preview {
    ProfileView(appState: AppState.shared)
}
