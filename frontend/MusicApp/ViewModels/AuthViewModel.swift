import Foundation
import SwiftUI
import Combine

class AuthViewModel: ObservableObject {
    @Published var email: String = ""
    @Published var firstName: String = ""
    @Published var lastName: String = ""
    @Published var username: String = ""
    @Published var password: String = ""
    @Published var confirmPassword: String = ""
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var isAuthenticated: Bool = false
    @Published var passwordErrors: [String] = []
    @Published var emailError: String?
    @Published var firstNameError: String?
    @Published var lastNameError: String?
    
    private let authService: AuthService
    
    init(authService: AuthService = AuthService()) {
        self.authService = authService
        
        $email
            .debounce(for: .milliseconds(500), scheduler: RunLoop.main)
            .map { email in
                if email.isEmpty {
                    return nil
                }
                let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
                let emailPredicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)
                return emailPredicate.evaluate(with: email) ? nil : "Invalid email format"
            }
            .assign(to: &$emailError)
        
        $firstName
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .map { firstName in
                if firstName.isEmpty {
                    return nil
                }
                if firstName.count < 1 || firstName.count > 50 {
                    return "First name must be between 1 and 50 characters"
                }
                return nil
            }
            .assign(to: &$firstNameError)
        
        $lastName
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .map { lastName in
                if lastName.isEmpty {
                    return nil
                }
                if lastName.count < 1 || lastName.count > 50 {
                    return "Last name must be between 1 and 50 characters"
                }
                return nil
            }
            .assign(to: &$lastNameError)
    }
    
    func validatePassword(_ password: String) -> [String] {
        var errors: [String] = []
        
        if password.count < 8 || password.count > 128 {
            errors.append("Password must be between 8 and 128 characters")
        }
        if !password.contains(where: { $0.isLowercase }) {
            errors.append("Password must contain at least one lowercase letter")
        }
        if !password.contains(where: { $0.isUppercase }) {
            errors.append("Password must contain at least one uppercase letter")
        }
        if !password.contains(where: { $0.isNumber }) {
            errors.append("Password must contain at least one number")
        }
        let specialChars = CharacterSet(charactersIn: "@$!%*?&")
        if !password.unicodeScalars.contains(where: { specialChars.contains($0) }) {
            errors.append("Password must contain at least one special character (@$!%*?&)")
        }
        
        return errors
    }
    
    func login() async {
        isLoading = true
        errorMessage = nil
        
        guard !email.isEmpty, !password.isEmpty else {
            errorMessage = "Email and password are required"
            isLoading = false
            return
        }
        
        do {
            let token = try await authService.login(email: email, password: password)
            
            KeychainHelper.store(token: token.accessToken, forKey: "accessToken")
            KeychainHelper.store(token: token.refreshToken, forKey: "refreshToken")
            
            let user = try await authService.getCurrentUser()
            isAuthenticated = true
            
            getAppState().authenticate(user: user)
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func signup() async {
        isLoading = true
        errorMessage = nil
        passwordErrors = []
        emailError = nil
        firstNameError = nil
        lastNameError = nil
        
        if email.isEmpty {
            emailError = "Email is required"
            errorMessage = "Please fill in all required fields"
            isLoading = false
            return
        }
        
        if emailError != nil {
            errorMessage = "Please fix email validation errors"
            isLoading = false
            return
        }
        
        if firstName.isEmpty {
            firstNameError = "First name is required"
            errorMessage = "Please fill in all required fields"
            isLoading = false
            return
        }
        
        if firstNameError != nil {
            errorMessage = "Please fix first name validation errors"
            isLoading = false
            return
        }
        
        if lastName.isEmpty {
            lastNameError = "Last name is required"
            errorMessage = "Please fill in all required fields"
            isLoading = false
            return
        }
        
        if lastNameError != nil {
            errorMessage = "Please fix last name validation errors"
            isLoading = false
            return
        }
        
        if username.count < 3 || username.count > 30 {
            errorMessage = "Username must be between 3 and 30 characters"
            isLoading = false
            return
        }
        
        if !username.allSatisfy({ $0.isLetter || $0.isNumber || $0 == "_" }) {
            errorMessage = "Username can only contain letters, numbers, and underscores"
            isLoading = false
            return
        }
        
        let pwdErrors = validatePassword(password)
        if !pwdErrors.isEmpty {
            passwordErrors = pwdErrors
            errorMessage = "Please fix password requirements"
            isLoading = false
            return
        }
        
        guard password == confirmPassword else {
            errorMessage = "Passwords do not match."
            isLoading = false
            return
        }

        do {
            try await authService.signup(email: email.trimmingCharacters(in: .whitespacesAndNewlines).lowercased(),
                                         password: password,
                                         firstName: firstName.trimmingCharacters(in: .whitespacesAndNewlines),
                                         lastName: lastName.trimmingCharacters(in: .whitespacesAndNewlines),
                                         username: username)
            
            errorMessage = "Signup successful. You can now log in."
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func forgotPassword() async {
        isLoading = true
        errorMessage = nil

        guard !email.isEmpty else {
            errorMessage = "Email is required."
            isLoading = false
            return
        }

        do {
            try await authService.forgotPassword(email: email)
            errorMessage = "If an account with that email exists, a password reset link has been sent."
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }
    
    // Helper to get shared AppState
    private func getAppState() -> AppState {
        return AppState.shared
    }
}
