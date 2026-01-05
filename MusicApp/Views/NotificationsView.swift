import SwiftUI

struct NotificationsView: View {
    @StateObject private var viewModel = NotificationViewModel()
    
    var body: some View {
        ZStack {
            AppColors.background
                .ignoresSafeArea()
            
            if viewModel.isLoading {
                ProgressView()
                    .tint(AppColors.primaryGreen)
            } else {
                VStack(spacing: 0) {
                    
                    HStack {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Notifications")
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(AppColors.textPrimary)
                            
                            Text("See your impact on the charts")
                                .font(.system(size: 14))
                                .foregroundColor(AppColors.textSecondary)
                        }
                        
                        Spacer()
                        
                        Button("Mark all read") {
                            Task {
                                await viewModel.markAllAsRead()
                            }
                        }
                        .font(.system(size: 14))
                        .foregroundColor(AppColors.primaryPurple)
                    }
                    .padding(.horizontal, AppStyles.paddingMedium)
                    .padding(.top, AppStyles.paddingLarge)
                    .padding(.bottom, AppStyles.paddingMedium)
                    
                    if viewModel.notifications.isEmpty {
                        Spacer()
                        VStack(spacing: 16) {
                            Image(systemName: "bell")
                                .font(.system(size: 64))
                                .foregroundColor(AppColors.primaryPurple.opacity(0.5))
                            
                            Text("You're all caught up!")
                                .font(.system(size: 18, weight: .medium))
                                .foregroundColor(AppColors.textSecondary)
                            
                            Text("Rate more music to see your impact.")
                                .font(.system(size: 14))
                                .foregroundColor(AppColors.textSecondary)
                        }
                        Spacer()
                    } else {
                        ScrollView {
                            LazyVStack(spacing: 12) {
                                ForEach(viewModel.notifications) { notification in
                                    NotificationCardView(
                                        notification: notification,
                                        color: viewModel.getNotificationColor(notification.type),
                                        onTap: {
                                            Task {
                                                await viewModel.markAsRead(notification.id)
                                            }
                                        }
                                    )
                                    .padding(.horizontal, AppStyles.paddingMedium)
                                }
                            }
                            .padding(.top, 8)
                            .padding(.bottom, 100)
                        }
                    }
                }
            }
        }
        .task {
            await viewModel.loadNotifications()
        }
    }
}

struct NotificationCardView: View {
    let notification: AppNotification
    let color: Color
    let onTap: () -> Void
    
    var body: some View {
        HStack(spacing: 0) {
            
            Rectangle()
                .fill(color)
                .frame(width: 4)
            
            HStack(spacing: 16) {
                
                ZStack {
                    Circle()
                        .fill(color.opacity(0.2))
                        .frame(width: 48, height: 48)
                    
                    Image(systemName: iconName(for: notification.type))
                        .font(.system(size: 24))
                        .foregroundColor(color)
                }
                
                VStack(alignment: .leading, spacing: 8) {
                    Text(notification.title)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(AppColors.textPrimary)
                    
                    Text(notification.message)
                        .font(.system(size: 14))
                        .foregroundColor(AppColors.textSecondary)
                        .lineSpacing(4)
                    
                    Text(notification.timeAgo)
                        .font(.system(size: 12))
                        .foregroundColor(AppColors.textSecondary)
                }
                
                Spacer()
            }
            .padding(AppStyles.paddingMedium)
        }
        .cardStyle()
        .onTapGesture {
            onTap()
        }
        
        if notification.type == .impact {
            VStack(spacing: 0) {
                Rectangle()
                    .fill(
                        LinearGradient(
                            colors: [
                                AppColors.primaryPurple.opacity(0.1),
                                AppColors.primaryGreen.opacity(0.1)
                            ],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .frame(height: 1)
                
                HStack {
                    Text("🎉 You influenced \(Int.random(in: 1000...5000).formatted()) listeners")
                        .font(.system(size: 14))
                        .foregroundColor(AppColors.primaryGreen)
                        .padding(AppStyles.paddingSmall)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(
                    LinearGradient(
                        colors: [
                            AppColors.primaryPurple.opacity(0.1),
                            AppColors.primaryGreen.opacity(0.1)
                        ],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .cornerRadius(AppStyles.cornerRadiusSmall)
                .padding(.horizontal, AppStyles.paddingMedium)
                .padding(.top, 8)
            }
            .padding(.leading, 4)
        }
    }
    
    private func iconName(for type: NotificationType) -> String {
        switch type {
        case .impact: return "arrow.up"
        case .badge: return "trophy.fill"
        case .social: return "person.2.fill"
        case .trending: return "star.fill"
        }
    }
}

#Preview {
    NotificationsView()
}
