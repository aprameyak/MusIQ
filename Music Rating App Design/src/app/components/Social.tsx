import { motion } from "motion/react";
import { Users, Share, Heart, Music } from "lucide-react";
import { toast } from "sonner";

const mockFriends = [
  {
    id: "1",
    name: "Sarah Wilson",
    username: "@sarahmusic",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    compatibility: 87,
    topGenre: "R&B",
    sharedArtists: 42,
  },
  {
    id: "2",
    name: "Mike Chen",
    username: "@mikebeats",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    compatibility: 73,
    topGenre: "Hip-Hop",
    sharedArtists: 28,
  },
  {
    id: "3",
    name: "Emma Davis",
    username: "@emmad",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    compatibility: 92,
    topGenre: "Pop",
    sharedArtists: 56,
  },
  {
    id: "4",
    name: "Alex Johnson",
    username: "@alexj",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    compatibility: 65,
    topGenre: "Rock",
    sharedArtists: 18,
  },
];

export function Social() {
  const handleShare = (friendName: string) => {
    toast.success(`Shared your taste profile with ${friendName}!`);
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return "#06d6a0";
    if (score >= 60) return "#fbbf24";
    return "#ff006e";
  };

  const getCompatibilityEmoji = (score: number) => {
    if (score >= 90) return "🔥";
    if (score >= 80) return "✨";
    if (score >= 70) return "👍";
    if (score >= 60) return "👌";
    return "🤔";
  };

  return (
    <div className="h-full bg-[#0a0118] overflow-y-auto pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-white text-3xl mb-2">Social</h1>
        <p className="text-[#9ca3af]">Compare taste with friends</p>
      </div>

      {/* Share button */}
      <div className="px-4 mb-6">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => toast("Share functionality coming soon!")}
          className="w-full bg-gradient-to-r from-[#7c3aed] to-[#06d6a0] text-white py-4 rounded-2xl flex items-center justify-center gap-2"
        >
          <Share className="w-5 h-5" />
          Share Your Taste Profile
        </motion.button>
      </div>

      {/* Friends list */}
      <div className="px-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-[#7c3aed]" />
          <h2 className="text-white text-lg">Your Friends</h2>
        </div>

        <div className="space-y-3">
          {mockFriends.map((friend, index) => (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1a0f2e] rounded-2xl p-4 border border-[#7c3aed]/10"
            >
              <div className="flex gap-4">
                {/* Avatar */}
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-16 h-16 rounded-full object-cover"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white truncate">{friend.name}</h3>
                  <p className="text-[#9ca3af] text-sm truncate">
                    {friend.username}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-xs">
                      <Music className="w-3 h-3 text-[#9ca3af]" />
                      <span className="text-[#9ca3af]">{friend.topGenre}</span>
                    </div>
                    <span className="text-[#9ca3af] text-xs">
                      {friend.sharedArtists} shared
                    </span>
                  </div>
                </div>

                {/* Compatibility score */}
                <div className="flex flex-col items-center justify-center min-w-[60px]">
                  <div
                    className="text-3xl mb-1"
                    style={{ color: getCompatibilityColor(friend.compatibility) }}
                  >
                    {getCompatibilityEmoji(friend.compatibility)}
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: getCompatibilityColor(friend.compatibility) }}
                  >
                    {friend.compatibility}%
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleShare(friend.name)}
                  className="flex-1 bg-[#2d1b4e] text-[#9ca3af] py-2 rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  <Share className="w-4 h-4" />
                  Compare
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="px-4 bg-[#2d1b4e] text-[#9ca3af] py-2 rounded-xl"
                >
                  <Heart className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Compatibility bar */}
              <div className="mt-4">
                <div className="h-1.5 bg-[#2d1b4e] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${friend.compatibility}%` }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(to right, ${getCompatibilityColor(
                        friend.compatibility
                      )}, #7c3aed)`,
                    }}
                  />
                </div>
                <p className="text-[#9ca3af] text-xs mt-1 text-center">
                  Taste Match
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add friends CTA */}
      <div className="px-4 mt-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-[#1a0f2e] rounded-2xl p-6 border border-[#7c3aed]/10 text-center"
        >
          <Users className="w-12 h-12 text-[#7c3aed] mx-auto mb-3" />
          <h3 className="text-white mb-2">Invite Friends</h3>
          <p className="text-[#9ca3af] text-sm mb-4">
            See how your taste compares with more friends
          </p>
          <button className="w-full bg-gradient-to-r from-[#7c3aed] to-[#06d6a0] text-white py-3 rounded-xl">
            Invite Friends
          </button>
        </motion.div>
      </div>
    </div>
  );
}
