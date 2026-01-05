import { motion } from "motion/react";
import { Flame, Trophy, Users, Bell, User } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "pulse", icon: Flame, label: "Pulse" },
  { id: "charts", icon: Trophy, label: "Charts" },
  { id: "profile", icon: User, label: "Profile" },
  { id: "social", icon: Users, label: "Social" },
  { id: "notifications", icon: Bell, label: "Alerts" },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1a0f2e] border-t border-[#7c3aed]/20 safe-area-bottom z-30">
      <div className="flex justify-around items-center px-2 py-2 max-w-2xl mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center py-2 px-3 rounded-xl relative min-w-[60px]"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-[#7c3aed]/20 to-[#06d6a0]/20 rounded-xl"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon
                className={`w-6 h-6 relative z-10 transition-colors ${
                  isActive ? "text-[#06d6a0]" : "text-[#9ca3af]"
                }`}
              />
              <span
                className={`text-xs mt-1 relative z-10 transition-colors ${
                  isActive ? "text-[#06d6a0]" : "text-[#9ca3af]"
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="indicator"
                  className="absolute -bottom-0.5 w-8 h-1 bg-gradient-to-r from-[#7c3aed] to-[#06d6a0] rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
