import Foundation

class NotificationService {
    private let apiService = APIService.shared
    
    func getNotifications() async throws -> [AppNotification] {
        let response: APIResponse<[AppNotification]> = try await apiService.request(
            endpoint: "/notifications",
            method: .get
        )
        
        guard response.success, let data = response.data else {
            return []
        }
        
        return data
    }
    
    func markAsRead(notificationId: String) async throws {
        _ = try await apiService.request(
            endpoint: "/notifications/\(notificationId)/read",
            method: .put,
            body: EmptyBody(),
            requiresAuth: true
        ) as APIResponse<EmptyResponse>
    }
    
    func markAllAsRead() async throws {
        _ = try await apiService.request(
            endpoint: "/notifications/read-all",
            method: .put,
            body: EmptyBody(),
            requiresAuth: true
        ) as APIResponse<EmptyResponse>
    }
}
