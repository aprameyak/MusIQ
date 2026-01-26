import SwiftUI

struct NotificationsView: View {
    @StateObject private var viewModel = NotificationViewModel()
    @ObservedObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        ZStack {
            AppColors.background
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                HStack {
                    Button(action: { dismiss() }) {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(AppColors.textPrimary)
                    }
                    .padding(.trailing, 8)

                    Text("Notifications")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundColor(AppColors.textPrimary)
                    
                    Spacer()
                    
                    if !viewModel.notifications.isEmpty {
                        Button(action: {
                            Task {
                                await viewModel.markAllAsRead()
                            }
                        }) {
                            Text("Mark all read")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(AppColors.primary)
                        }
                    }
                }
                .padding(.horizontal, AppStyles.paddingMedium)
                .padding(.top, AppStyles.paddingMedium)
                .padding(.bottom, AppStyles.paddingMedium)
                
                if viewModel.isLoading {
                    Spacer()
                    ProgressView()
                        .tint(AppColors.primary)
                    Spacer()
                } else if viewModel.notifications.isEmpty {
                    Spacer()
                    VStack(spacing: 16) {
                        Image(systemName: "bell.slash")
                            .font(.system(size: 48))
                            .foregroundColor(AppColors.textSecondary)
                        
                        Text("No recent activity")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(AppColors.textSecondary)
                        
                        Text("New followers and interactions will appear here")
                            .font(.system(size: 14))
                            .foregroundColor(AppColors.textSecondary)
                    }
                    Spacer()
                } else {
                    ScrollView {
                        LazyVStack(spacing: 1) {
                            ForEach(viewModel.notifications) { notification in
                                NotificationRow(notification: notification) {
                                    Task {
                                        await viewModel.markAsRead(notification.id)
                                    }
                                }
                            }
                        }
                    }
                    .refreshable {
                        await viewModel.loadNotifications()
                    }
                }
            }
        }
        .task {
            await viewModel.loadNotifications()
        }
    }
}

struct NotificationRow: View {
    let notification: AppNotification
    let onRead: () -> Void
    
    var body: some View {
        Button(action: {
            if !notification.read {
                onRead()
            }
        }) {
            HStack(spacing: 12) {
                // Type Icon
                ZStack {
                    Circle()
                        .fill(notificationColor.opacity(0.15))
                        .frame(width: 48, height: 48)
                    
                    Image(systemName: notificationIcon)
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(notificationColor)
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(notification.title)
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(AppColors.textPrimary)
                        
                        Spacer()
                        
                        Text(notification.timeAgo)
                            .font(.system(size: 12))
                            .foregroundColor(AppColors.textSecondary)
                        
                        if !notification.read {
                            Circle()
                                .fill(AppColors.primary)
                                .frame(width: 8, height: 8)
                        }
                    }
                    
                    Text(notification.message)
                        .font(.system(size: 14))
                        .foregroundColor(AppColors.textSecondary)
                        .lineLimit(2)
                }
            }
            .padding(.horizontal, AppStyles.paddingMedium)
            .padding(.vertical, 16)
            .background(notification.read ? AppColors.background : AppColors.cardBackground)
        }
        .buttonStyle(.plain)
    }
    
    private var notificationIcon: String {
        switch notification.type {
        case .impact: return "bolt.fill"
        case .badge: return "star.circle.fill"
        case .social: return "person.2.fill"
        case .trending: return "chart.line.uptrend.xyaxis"
        }
    }
    
    private var notificationColor: Color {
        switch notification.type {
        case .impact: return AppColors.notificationImpact
        case .badge: return AppColors.notificationBadge
        case .social: return AppColors.notificationSocial
        case .trending: return AppColors.notificationTrending
        }
    }
}
