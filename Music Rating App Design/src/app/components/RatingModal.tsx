import { useState } from "react";
import { X, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    artist: string;
    imageUrl: string;
    currentRating: number;
  } | null;
  onSubmit: (rating: number, tags: string[]) => void;
}

const tags = ["Lyrics", "Production", "Replay", "Emotional", "Innovative", "Classic"];

export function RatingModal({ isOpen, onClose, item, onSubmit }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  if (!item) return null;

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, selectedTags);
      // Reset
      setRating(0);
      setHoverRating(0);
      setSelectedTags([]);
      onClose();
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-[#1a0f2e] rounded-3xl p-6 z-50 max-w-md mx-auto border border-[#7c3aed]/20"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h2 className="text-white text-xl mb-1">Rate this music</h2>
                <p className="text-[#9ca3af] text-sm">Share your honest opinion</p>
              </div>
              <button
                onClick={onClose}
                className="text-[#9ca3af] hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Album info */}
            <div className="flex gap-4 mb-6 p-4 bg-[#0a0118] rounded-2xl">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-white truncate">{item.title}</h3>
                <p className="text-[#9ca3af] text-sm truncate">{item.artist}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-4 h-4 text-[#fbbf24]" fill="#fbbf24" />
                  <span className="text-white text-sm">
                    {item.currentRating.toFixed(1)}
                  </span>
                  <span className="text-[#9ca3af] text-sm">current</span>
                </div>
              </div>
            </div>

            {/* Star rating */}
            <div className="mb-6">
              <p className="text-white text-sm mb-3">Your rating</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1"
                  >
                    <Star
                      className="w-7 h-7 transition-colors"
                      fill={
                        star <= (hoverRating || rating) ? "#fbbf24" : "none"
                      }
                      style={{
                        color: star <= (hoverRating || rating) ? "#fbbf24" : "#2d1b4e",
                      }}
                    />
                  </motion.button>
                ))}
              </div>
              {rating > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-[#06d6a0] mt-2"
                >
                  {rating}/10
                </motion.p>
              )}
            </div>

            {/* Tags */}
            <div className="mb-6">
              <p className="text-white text-sm mb-3">Add tags (optional)</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <motion.button
                    key={tag}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? "bg-[#7c3aed] text-white"
                        : "bg-[#2d1b4e] text-[#9ca3af]"
                    }`}
                  >
                    {tag}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Submit button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={rating === 0}
              className={`w-full py-4 rounded-2xl transition-all ${
                rating > 0
                  ? "bg-gradient-to-r from-[#7c3aed] to-[#06d6a0] text-white"
                  : "bg-[#2d1b4e] text-[#9ca3af] cursor-not-allowed"
              }`}
            >
              Submit Rating
            </motion.button>

            {/* Animation on submit */}
            {rating > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-[#9ca3af] text-sm mt-3"
              >
                Your rating will update the global score
              </motion.p>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
