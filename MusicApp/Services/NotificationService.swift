//
//  NotificationService.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import Foundation

class NotificationService {
    private let apiService = APIService.shared
    
    func getNotifications() async throws -> [AppNotification] {
        let response: APIResponse<[AppNotification]> = try await apiService.request(
            endpoint: "/notifications",
            method: .get
        )
        
        guard response.success, let data = response.data else {
            // Return mock data if API fails
            return getMockNotifications()
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
    
    // Mock data for development
    private func getMockNotifications() -> [AppNotification] {
        let formatter = ISO8601DateFormatter()
        let now = Date()
        
        return [
            AppNotification(
                id: "1",
                userId: "current-user",
                type: .impact,
                title: "Your Rating Made an Impact!",
                message: "Your 10/10 rating pushed \"ASTROWORLD\" up 12 spots in the charts",
                read: false,
                metadata: nil,
                createdAt: now.addingTimeInterval(-120) // 2 min ago
            ),
            AppNotification(
                id: "2",
                userId: "current-user",
                type: .badge,
                title: "New Badge Earned!",
                message: "You've unlocked 'Taste Maker' - 100 ratings milestone",
                read: false,
                metadata: nil,
                createdAt: now.addingTimeInterval(-3600) // 1 hour ago
            ),
            AppNotification(
                id: "3",
                userId: "current-user",
                type: .social,
                title: "Friend Match",
                message: "Sarah Wilson has 87% taste compatibility with you!",
                read: false,
                metadata: nil,
                createdAt: now.addingTimeInterval(-10800) // 3 hours ago
            )
        ]
    }
}

