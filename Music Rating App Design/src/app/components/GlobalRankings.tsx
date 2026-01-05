import { useState } from "react";
import { motion } from "motion/react";
import { Star, TrendingUp, Flame } from "lucide-react";

type TabType = "albums" | "artists" | "songs";

const mockRankings = {
  albums: [
    {
      rank: 1,
      title: "To Pimp a Butterfly",
      artist: "Kendrick Lamar",
      imageUrl: "https://images.unsplash.com/photo-1616663395403-2e0052b8e595?w=400&h=400&fit=crop",
      rating: 9.7,
      ratingCount: 892000,
      isNew: false,
      change: 0,
    },
    {
      rank: 2,
      title: "My Beautiful Dark Twisted Fantasy",
      artist: "Kanye West",
      imageUrl: "https://images.unsplash.com/photo-1738667289162-9e55132e18a2?w=400&h=400&fit=crop",
      rating: 9.6,
      ratingCount: 856000,
      isNew: false,
      change: 0,
    },
    {
      rank: 3,
      title: "Blonde",
      artist: "Frank Ocean",
      imageUrl: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=400&h=400&fit=crop",
      rating: 9.5,
      ratingCount: 678000,
      isNew: false,
      change: 1,
    },
    {
      rank: 4,
      title: "good kid, m.A.A.d city",
      artist: "Kendrick Lamar",
      imageUrl: "https://images.unsplash.com/photo-1575426220089-9e2ef7b0c9f4?w=400&h=400&fit=crop",
      rating: 9.4,
      ratingCount: 734000,
      isNew: false,
      change: -1,
    },
    {
      rank: 5,
      title: "The Miseducation of Lauryn Hill",
      artist: "Lauryn Hill",
      imageUrl: "https://images.unsplash.com/photo-1649956736509-f359d191bbcb?w=400&h=400&fit=crop",
      rating: 9.4,
      ratingCount: 567000,
      isNew: false,
      change: 0,
    },
    {
      rank: 6,
      title: "ASTROWORLD",
      artist: "Travis Scott",
      imageUrl: "https://images.unsplash.com/photo-1544616326-a041e9e3b348?w=400&h=400&fit=crop",
      rating: 8.9,
      ratingCount: 445000,
      isNew: true,
      change: 12,
    },
  ],
  artists: [],
  songs: [],
};

export function GlobalRankings() {
  const [activeTab, setActiveTab] = useState<TabType>("albums");

  const tabs = [
    { id: "albums" as TabType, label: "Albums" },
    { id: "artists" as TabType, label: "Artists" },
    { id: "songs" as TabType, label: "Songs" },
  ];

  return (
    <div className="h-full bg-[#0a0118] flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-white text-3xl mb-2">Global Charts</h1>
        <p className="text-[#9ca3af]">Powered by your ratings</p>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 bg-[#1a0f2e] p-1 rounded-2xl border border-[#7c3aed]/10">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-xl text-sm transition-colors ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#7c3aed] to-[#06d6a0] text-white"
                  : "text-[#9ca3af]"
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Rankings list */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {mockRankings[activeTab].length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-[#9ca3af]">Coming soon...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockRankings[activeTab].map((item, index) => (
              <motion.div
                key={item.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#1a0f2e] rounded-2xl p-4 border border-[#7c3aed]/10"
              >
                <div className="flex gap-4 items-center">
                  {/* Rank */}
                  <div className="flex flex-col items-center min-w-[40px]">
                    <span
                      className={`text-2xl ${
                        item.rank <= 3 ? "text-[#fbbf24]" : "text-white"
                      }`}
                    >
                      {item.rank}
                    </span>
                    {item.change !== 0 && (
                      <div
                        className={`flex items-center text-xs ${
                          item.change > 0 ? "text-[#06d6a0]" : "text-[#ff006e]"
                        }`}
                      >
                        <TrendingUp
                          className={`w-3 h-3 ${
                            item.change < 0 ? "rotate-180" : ""
                          }`}
                        />
                        <span>{Math.abs(item.change)}</span>
                      </div>
                    )}
                  </div>

                  {/* Album art */}
                  <div className="relative">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    {item.isNew && (
                      <div className="absolute -top-1 -right-1 bg-[#ff006e] rounded-full p-1">
                        <Flame className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white truncate">{item.title}</h3>
                    <p className="text-[#9ca3af] text-sm truncate">
                      {item.artist}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-[#fbbf24]" fill="#fbbf24" />
                        <span className="text-white text-sm">{item.rating}</span>
                      </div>
                      <span className="text-[#9ca3af] text-xs">
                        ({item.ratingCount.toLocaleString()})
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}