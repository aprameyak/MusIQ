import { motion } from "motion/react";
import { TrendingUp, Heart, Trophy, Bell, Users, Star } from "lucide-react";

const mockNotifications = [
  {
    id: "1",
    type: "impact",
    icon: TrendingUp,
    title: "Your Rating Made an Impact!",
    message: 'Your 10/10 rating pushed "ASTROWORLD" up 12 spots in the charts',
    time: "2 min ago",
    color: "#06d6a0",
  },
  {
    id: "2",
    type: "badge",
    icon: Trophy,
    title: "New Badge Earned!",
    message: "You've unlocked 'Taste Maker' - 100 ratings milestone",
    time: "1 hour ago",
    color: "#fbbf24",
  },
  {
    id: "3",
    type: "social",
    icon: Users,
    title: "Friend Match",
    message: "Sarah Wilson has 87% taste compatibility with you!",
    time: "3 hours ago",
    color: "#7c3aed",
  },
  {
    id: "4",
    type: "trending",
    icon: Star,
    title: "Trending Alert",
    message: 'The album you rated is now #3 on "This Week\'s Rising"',
    time: "5 hours ago",
    color: "#ff006e",
  },
  {
    id: "5",
    type: "impact",
    icon: TrendingUp,
    title: "Chart Movement",
    message: 'Your favorite artist just climbed to #1 in "Hip-Hop Charts"',
    time: "1 day ago",
    color: "#06d6a0",
  },
  {
    id: "6",
    type: "social",
    icon: Heart,
    title: "New Follower",
    message: "Mike Chen started following your taste profile",
    time: "2 days ago",
    color: "#ff006e",
  },
  {
    id: "7",
    type: "badge",
    icon: Trophy,
    title: "Achievement Unlocked",
    message: "Early Adopter - You rated this before it went viral!",
    time: "3 days ago",
    color: "#fbbf24",
  },
];

export function Notifications() {
  return (
    <div className="h-full bg-[#0a0118] overflow-y-auto pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-white text-3xl">Notifications</h1>
          <button className="text-[#7c3aed] text-sm">Mark all read</button>
        </div>
        <p className="text-[#9ca3af]">See your impact on the charts</p>
      </div>

      {/* Notifications list */}
      <div className="px-4 space-y-3">
        {mockNotifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-[#1a0f2e] rounded-2xl p-4 border border-[#7c3aed]/10 relative overflow-hidden"
          >
            {/* Accent line */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1"
              style={{ backgroundColor: notification.color }}
            />

            <div className="flex gap-4 ml-3">
              {/* Icon */}
              <div
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${notification.color}20` }}
              >
                {(() => {
                  const Icon = notification.icon;
                  return <Icon className="w-6 h-6" style={{ color: notification.color }} />;
                })()}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white mb-1">{notification.title}</h3>
                <p className="text-[#9ca3af] text-sm leading-relaxed mb-2">
                  {notification.message}
                </p>
                <p className="text-[#9ca3af] text-xs">{notification.time}</p>
              </div>
            </div>

            {/* Interactive element for impact notifications */}
            {notification.type === "impact" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="mt-3 ml-3 bg-gradient-to-r from-[#7c3aed]/10 to-[#06d6a0]/10 rounded-xl p-3 border border-[#06d6a0]/20"
              >
                <p className="text-[#06d6a0] text-sm">
                  🎉 You influenced {Math.floor(Math.random() * 5000 + 1000).toLocaleString()} listeners
                </p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Empty state for cleared notifications */}
      <div className="px-4 mt-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-[#1a0f2e] rounded-2xl p-8 border border-[#7c3aed]/10 text-center"
        >
          <Bell className="w-16 h-16 text-[#7c3aed] mx-auto mb-4 opacity-50" />
          <p className="text-[#9ca3af] text-sm">
            You're all caught up! Rate more music to see your impact.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
