import { Heart, Star, MessageCircle, TrendingUp, Play } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface FeedCardProps {
  id: string;
  type: "album" | "song" | "artist";
  title: string;
  artist: string;
  imageUrl: string;
  rating: number;
  ratingCount: number;
  trending?: boolean;
  trendingChange?: number;
  onRate: (id: string) => void;
  onFavorite: (id: string) => void;
  onComment: (id: string) => void;
}

export function FeedCard({
  id,
  type,
  title,
  artist,
  imageUrl,
  rating,
  ratingCount,
  trending,
  trendingChange,
  onRate,
  onFavorite,
  onComment,
}: FeedCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [localRating] = useState(rating);

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    onFavorite(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a0f2e] rounded-2xl p-4 mb-4 border border-[#7c3aed]/10"
    >
      <div className="flex gap-4">
        {/* Album artwork */}
        <div className="relative flex-shrink-0">
          <motion.img
            src={imageUrl}
            alt={title}
            className="w-24 h-24 rounded-xl object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          {type === "song" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl opacity-0 hover:opacity-100 transition-opacity">
              <Play className="w-8 h-8 text-white" fill="white" />
            </div>
          )}
          {trending && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#ff006e] to-[#7c3aed] rounded-full p-1.5">
              <TrendingUp className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white truncate mb-1">{title}</h3>
          <p className="text-[#9ca3af] text-sm truncate mb-2">{artist}</p>

          {/* Rating display */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-[#fbbf24]" fill="#fbbf24" />
              <span className="text-white">{localRating.toFixed(1)}</span>
            </div>
            <span className="text-[#9ca3af] text-sm">
              ({ratingCount.toLocaleString()})
            </span>
            {trending && trendingChange && (
              <div className="flex items-center gap-1 text-[#06d6a0] text-sm">
                <TrendingUp className="w-3 h-3" />
                <span>+{trendingChange}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleFavorite}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                isFavorited
                  ? "bg-[#ff006e]/20 text-[#ff006e]"
                  : "bg-[#2d1b4e] text-[#9ca3af]"
              }`}
            >
              <Heart
                className="w-4 h-4"
                fill={isFavorited ? "#ff006e" : "none"}
              />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onRate(id)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#06d6a0] text-white"
            >
              <Star className="w-4 h-4" />
              <span className="text-sm">Rate</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onComment(id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2d1b4e] text-[#9ca3af]"
            >
              <MessageCircle className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
