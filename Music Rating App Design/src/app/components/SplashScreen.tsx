import { motion } from "motion/react";
import { Music, Sparkles } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={() => {
        setTimeout(onComplete, 1500);
      }}
      className="h-full bg-gradient-to-br from-[#0a0118] via-[#1a0f2e] to-[#0a0118] flex flex-col items-center justify-center"
    >
      {/* Logo animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 15,
          duration: 0.8
        }}
        className="relative"
      >
        {/* Outer glow ring */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-gradient-to-r from-[#7c3aed] to-[#06d6a0] rounded-full blur-2xl"
          style={{ width: "140px", height: "140px", margin: "-20px" }}
        />
        
        {/* Main logo circle */}
        <div className="relative w-24 h-24 bg-gradient-to-br from-[#7c3aed] to-[#06d6a0] rounded-full flex items-center justify-center">
          <Music className="w-12 h-12 text-white" />
        </div>

        {/* Sparkle decorations */}
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="w-6 h-6 text-[#06d6a0]" />
        </motion.div>
        
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 1.3, 1],
          }}
          transition={{
            rotate: { duration: 4, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
          }}
          className="absolute -bottom-2 -left-2"
        >
          <Sparkles className="w-5 h-5 text-[#ff006e]" />
        </motion.div>
      </motion.div>

      {/* App name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center"
      >
        <motion.h1 
          className="text-4xl text-white mb-2"
          animate={{
            textShadow: [
              "0 0 20px rgba(6, 214, 160, 0.3)",
              "0 0 40px rgba(124, 58, 237, 0.5)",
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
        <p className="text-[#9ca3af]">Rate. Discover. Influence.</p>
      </motion.div>

      {/* Loading indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12"
      >
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                backgroundColor: [
                  "rgba(124, 58, 237, 0.5)",
                  "rgba(6, 214, 160, 0.8)",
                  "rgba(124, 58, 237, 0.5)",
                ],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-2 h-2 rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
