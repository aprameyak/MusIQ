import { useState } from "react";
import { FeedCard } from "./FeedCard";
import { RatingModal } from "./RatingModal";
import { Filter, TrendingUp, Sparkles, Users } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

const mockFeedData = [
  {
    id: "1",
    type: "album" as const,
    title: "ASTROWORLD",
    artist: "Travis Scott",
    imageUrl: "https://images.unsplash.com/photo-1738667289162-9e55132e18a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=400&fit=crop",
    rating: 8.7,
    ratingCount: 234500,
    trending: true,
    trendingChange: 12,
  },
  {
    id: "2",
    type: "song" as const,
    title: "Blinding Lights",
    artist: "The Weeknd",
    imageUrl: "https://images.unsplash.com/photo-1616663395403-2e0052b8e595?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=400&fit=crop",
    rating: 9.2,
    ratingCount: 456000,
    trending: true,
    trendingChange: 8,
  },
  {
    id: "3",
    type: "album" as const,
    title: "Blonde",
    artist: "Frank Ocean",
    imageUrl: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=400&fit=crop",
    rating: 9.5,
    ratingCount: 567800,
    trending: false,
  },
  {
    id: "4",
    type: "artist" as const,
    title: "Kendrick Lamar",
    artist: "Artist Profile",
    imageUrl: "https://images.unsplash.com/photo-1575426220089-9e2ef7b0c9f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=400&fit=crop",
    rating: 9.3,
    ratingCount: 789000,
    trending: true,
    trendingChange: 15,
  },
  {
    id: "5",
    type: "album" as const,
    title: "folklore",
    artist: "Taylor Swift",
    imageUrl: "https://images.unsplash.com/photo-1649956736509-f359d191bbcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=400&fit=crop",
    rating: 8.9,
    ratingCount: 345600,
    trending: false,
  },
  {
    id: "6",
    type: "song" as const,
    title: "As It Was",
    artist: "Harry Styles",
    imageUrl: "https://images.unsplash.com/photo-1544616326-a041e9e3b348?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=400&fit=crop",
    rating: 8.4,
    ratingCount: 289000,
    trending: true,
    trendingChange: 6,
  },
];

type FilterType = "trending" | "forYou" | "following";

export function HomeFeed() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("trending");
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof mockFeedData[0] | null>(null);

  const handleRate = (id: string) => {
    const item = mockFeedData.find((i) => i.id === id);
    if (item) {
      setSelectedItem(item);
      setRatingModalOpen(true);
    }
  };

  const handleFavorite = (id: string) => {
    toast.success("Added to favorites!");
  };

  const handleComment = (id: string) => {
    toast("Comments coming soon!");
  };

  const handleSubmitRating = (rating: number, tags: string[]) => {
    toast.success(`Rated ${rating}/10! Your impact is being calculated...`, {
      duration: 3000,
    });
  };

  const filters = [
    { id: "trending" as FilterType, label: "Trending", icon: TrendingUp },
    { id: "forYou" as FilterType, label: "For You", icon: Sparkles },
    { id: "following" as FilterType, label: "Following", icon: Users },
  ];

  return (
    <div className="h-full bg-[#0a0118] flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <motion.h1 
            className="text-white text-3xl"
            animate={{ 
              textShadow: [
                "0 0 20px rgba(6, 214, 160, 0.3)",
                "0 0 30px rgba(6, 214, 160, 0.5)",
                "0 0 20px rgba(6, 214, 160, 0.3)",
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Pulse
          </motion.h1>
          <button className="p-2 bg-[#1a0f2e] rounded-xl border border-[#7c3aed]/20">
            <Filter className="w-5 h-5 text-[#9ca3af]" />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                activeFilter === filter.id
                  ? "bg-gradient-to-r from-[#7c3aed] to-[#06d6a0] text-white"
                  : "bg-[#1a0f2e] text-[#9ca3af] border border-[#7c3aed]/10"
              }`}
            >
              <filter.icon className="w-4 h-4" />
              {filter.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {mockFeedData.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <FeedCard
              {...item}
              onRate={handleRate}
              onFavorite={handleFavorite}
              onComment={handleComment}
            />
          </motion.div>
        ))}
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        item={
          selectedItem
            ? {
                id: selectedItem.id,
                title: selectedItem.title,
                artist: selectedItem.artist,
                imageUrl: selectedItem.imageUrl,
                currentRating: selectedItem.rating,
              }
            : null
        }
        onSubmit={handleSubmitRating}
      />
    </div>
  );
}