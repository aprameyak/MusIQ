import Foundation
import SwiftUI

@MainActor
class NotificationViewModel: ObservableObject {
    @Published var notifications: [AppNotification] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let notificationService: NotificationService
    
    init(notificationService: NotificationService = NotificationService()) {
        self.notificationService = notificationService
    }
    
    func loadNotifications() async {
        isLoading = true
        errorMessage = nil
        
        do {
            notifications = try await notificationService.getNotifications()
        } catch {
            errorMessage = error.localizedDescription
            
            loadMockData()
        }
        
        isLoading = false
    }
    
    func markAsRead(_ notificationId: String) async {
        do {
            try await notificationService.markAsRead(notificationId: notificationId)
            if let index = notifications.firstIndex(where: { $0.id == notificationId }) {
                notifications[index] = AppNotification(
                    id: notifications[index].id,
                    userId: notifications[index].userId,
                    type: notifications[index].type,
                    title: notifications[index].title,
                    message: notifications[index].message,
                    read: true,
                    metadata: notifications[index].metadata,
                    createdAt: notifications[index].createdAt
                )
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func markAllAsRead() async {
        do {
            try await notificationService.markAllAsRead()
            notifications = notifications.map { notification in
                AppNotification(
                    id: notification.id,
                    userId: notification.userId,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    read: true,
                    metadata: notification.metadata,
                    createdAt: notification.createdAt
                )
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func getNotificationColor(_ type: NotificationType) -> Color {
        switch type {
        case .impact:
            return AppColors.notificationImpact
        case .badge:
            return AppColors.notificationBadge
        case .social:
            return AppColors.notificationSocial
        case .trending:
            return AppColors.notificationTrending
        }
    }
    
    private func loadMockData() {
        
        notifications = []
    }
}
