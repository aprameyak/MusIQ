import { useState } from "react";
import { Music, Sparkles, Users, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Music,
    title: "Rate Your Music",
    description: "Share your honest opinions on albums, songs, and artists",
    color: "#7c3aed",
  },
  {
    icon: Sparkles,
    title: "Discover New Sounds",
    description: "Explore trending music and personalized recommendations",
    color: "#06d6a0",
  },
  {
    icon: Users,
    title: "Influence the Charts",
    description: "Your ratings shape the global music rankings",
    color: "#ff006e",
  },
  {
    icon: Trophy,
    title: "Build Your Profile",
    description: "Create your unique taste DNA and compare with friends",
    color: "#fbbf24",
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="h-full bg-[#0a0118] flex flex-col items-center justify-between px-6 py-12">
      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="self-end text-[#9ca3af] text-sm"
      >
        Skip
      </button>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="mb-8"
            >
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: `${slides[currentSlide].color}20`,
                }}
              >
                {(() => {
                  const Icon = slides[currentSlide].icon;
                  return (
                    <Icon
                      className="w-12 h-12"
                      style={{ color: slides[currentSlide].color }}
                    />
                  );
                })()}
              </div>
            </motion.div>

            {/* Title */}
            <h1 className="text-3xl mb-4 text-white">
              {slides[currentSlide].title}
            </h1>

            {/* Description */}
            <p className="text-[#9ca3af] text-lg leading-relaxed">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots indicator */}
      <div className="flex gap-2 mb-8">
        {slides.map((_, index) => (
          <div
            key={index}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: currentSlide === index ? "24px" : "8px",
              backgroundColor:
                currentSlide === index ? "#06d6a0" : "#2d1b4e",
            }}
          />
        ))}
      </div>

      {/* Next/Start button */}
      <button
        onClick={handleNext}
        className="w-full max-w-sm bg-gradient-to-r from-[#7c3aed] to-[#06d6a0] text-white py-4 rounded-2xl transition-transform active:scale-95"
      >
        {currentSlide === slides.length - 1 ? "Start Rating Now" : "Next"}
      </button>

      {/* Social login options */}
      {currentSlide === slides.length - 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 w-full max-w-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#2d1b4e]" />
            <span className="text-[#9ca3af] text-sm">or continue with</span>
            <div className="flex-1 h-px bg-[#2d1b4e]" />
          </div>
          <div className="flex gap-3">
            <button className="flex-1 bg-[#1a0f2e] text-white py-3 rounded-xl border border-[#7c3aed]/20">
              Spotify
            </button>
            <button className="flex-1 bg-[#1a0f2e] text-white py-3 rounded-xl border border-[#7c3aed]/20">
              Apple
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
