import Foundation
import AuthenticationServices
#if canImport(AppAuth)
import AppAuth
#endif

enum OAuthProviderType {
    case apple
    case google
    
    var rawValue: String {
        switch self {
        case .apple: return "apple"
        case .google: return "google"
        }
    }
}

class OAuthService {
    private let authService: AuthService
    
    init(authService: AuthService = AuthService()) {
        self.authService = authService
    }
    
    func signInWithGoogle() async throws -> AuthToken {
        throw NetworkError.unauthorized
    }
    
    func handleOAuthCallback(authorizationCode: String, provider: OAuthProviderType, idToken: String? = nil, email: String? = nil, name: String? = nil, userIdentifier: String? = nil) async throws -> AuthToken {
        
        var requestBody: [String: Any] = [
            "token": authorizationCode
        ]
        
        if let idToken = idToken {
            requestBody["idToken"] = idToken
        }
        
        if let email = email {
            requestBody["email"] = email
        }
        
        if let name = name {
            requestBody["name"] = name
        }
        
        if let userIdentifier = userIdentifier {
            requestBody["userIdentifier"] = userIdentifier
        }
        
        struct OAuthRequestBody: Codable {
            let token: String
            let idToken: String?
            let email: String?
            let name: String?
            let userIdentifier: String?
        }
        
        let request = OAuthRequestBody(
            token: authorizationCode,
            idToken: idToken,
            email: email,
            name: name,
            userIdentifier: userIdentifier
        )
        
        let response: APIResponse<AuthToken> = try await APIService.shared.request(
            endpoint: "/auth/oauth/\(provider.rawValue)",
            method: .post,
            body: request,
            requiresAuth: false
        )
        
        guard response.success, let data = response.data else {
            throw NetworkError.unauthorized
        }
        
        return data
    }
}
