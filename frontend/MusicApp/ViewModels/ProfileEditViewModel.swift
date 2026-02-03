import Foundation
import SwiftUI
import Combine

@MainActor
class ProfileEditViewModel: ObservableObject {
    @Published var email: String = ""
    @Published var firstName: String = ""
    @Published var lastName: String = ""
    @Published var username: String = ""
    @Published var isUpdating: Bool = false
    @Published var updateError: String?
    @Published var emailError: String?
    @Published var firstNameError: String?
    @Published var lastNameError: String?
    @Published var selectedImage: UIImage?
    @Published var profilePictureUrl: String?
    @Published var isUploadingImage: Bool = false
    
    private let authService: AuthService
    private let apiService = APIService.shared
    private var originalEmail: String = ""
    
    init(authService: AuthService = AuthService()) {
        self.authService = authService
        
        $email
            .debounce(for: .milliseconds(500), scheduler: RunLoop.main)
            .map { email in
                if email.isEmpty {
                    return "Email is required"
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
                    return "First name is required"
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
                    return "Last name is required"
                }
                if lastName.count < 1 || lastName.count > 50 {
                    return "Last name must be between 1 and 50 characters"
                }
                return nil
            }
            .assign(to: &$lastNameError)
    }
    
    func loadProfile(user: User) {
        email = user.email
        originalEmail = user.email
        firstName = user.firstName ?? ""
        lastName = user.lastName ?? ""
        username = user.username
        profilePictureUrl = user.profilePictureUrl
    }
    
    var hasChanges: Bool {
        email != originalEmail || !firstName.isEmpty || !lastName.isEmpty
    }
    
    var canSave: Bool {
        emailError == nil && firstNameError == nil && lastNameError == nil && hasChanges && !isUpdating
    }
    
    func updateProfile() async -> Bool {
        guard canSave else {
            updateError = "Please fix validation errors"
            return false
        }
        
        isUpdating = true
        updateError = nil
        
        do {
            struct UpdateProfileRequest: Codable {
                let email: String?
                let firstName: String?
                let lastName: String?
            }
            
            let request = UpdateProfileRequest(
                email: email.trimmingCharacters(in: .whitespacesAndNewlines).lowercased() != originalEmail.lowercased() ? email.trimmingCharacters(in: .whitespacesAndNewlines).lowercased() : nil,
                firstName: firstName.trimmingCharacters(in: .whitespacesAndNewlines),
                lastName: lastName.trimmingCharacters(in: .whitespacesAndNewlines)
            )
            
            struct ProfileUpdateResponse: Codable {
                let success: Bool
                let data: User?
                let message: String?
                let error: APIError?
            }
            
            let response: ProfileUpdateResponse = try await apiService.request(
                endpoint: "/profile",
                method: .put,
                body: request,
                requiresAuth: true
            )
            
            guard response.success, let updatedUser = response.data else {
                if let error = response.error {
                    updateError = error.message
                } else {
                    updateError = "Failed to update profile"
                }
                isUpdating = false
                return false
            }
            
            originalEmail = updatedUser.email
            isUpdating = false
            return true
        } catch {
            updateError = error.localizedDescription
            isUpdating = false
            return false
        }
    func uploadProfilePicture() async -> Bool {
        guard let image = selectedImage else { return false }
        guard let imageData = image.jpegData(compressionQuality: 0.7) else { return false }
        
        isUploadingImage = true
        updateError = nil
        
        do {
            struct ProfilePictureResponse: Codable {
                let success: Bool
                let data: PictureData?
                let message: String?
                
                struct PictureData: Codable {
                    let profile_picture_url: String
                }
            }
            
            let response: ProfilePictureResponse = try await apiService.upload(
                endpoint: "/profile/picture",
                fileData: imageData,
                fileName: "profile.jpg",
                mimeType: "image/jpeg"
            )
            
            if response.success, let pictureData = response.data {
                profilePictureUrl = pictureData.profile_picture_url
                selectedImage = nil
                isUploadingImage = false
                return true
            } else {
                updateError = response.message ?? "Failed to upload image"
                isUploadingImage = false
                return false
            }
        } catch {
            updateError = error.localizedDescription
            isUploadingImage = false
            return false
        }
    func removeProfilePicture() async -> Bool {
        isUploadingImage = true
        updateError = nil
        
        do {
            struct ProfileRemovalResponse: Codable {
                let success: Bool
                let message: String?
            }
            
            let response: ProfileRemovalResponse = try await apiService.request(
                endpoint: "/profile/picture",
                method: .delete,
                requiresAuth: true
            )
            
            if response.success {
                profilePictureUrl = nil
                isUploadingImage = false
                return true
            } else {
                updateError = response.message ?? "Failed to remove image"
                isUploadingImage = false
                return false
            }
        } catch {
            updateError = error.localizedDescription
            isUploadingImage = false
            return false
        }
    }
}
