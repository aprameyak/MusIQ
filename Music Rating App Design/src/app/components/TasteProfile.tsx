import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell } from "recharts";
import { Sparkles, Award, Target, Music } from "lucide-react";

const genreData = [
  { name: "Hip-Hop", value: 85 },
  { name: "R&B", value: 72 },
  { name: "Pop", value: 68 },
  { name: "Rock", value: 54 },
  { name: "Electronic", value: 45 },
  { name: "Jazz", value: 32 },
];

const radarData = [
  { category: "Lyrics", value: 85 },
  { category: "Production", value: 92 },
  { category: "Vocals", value: 78 },
  { category: "Innovation", value: 88 },
  { category: "Emotion", value: 75 },
  { category: "Replay", value: 90 },
];

const decadeData = [
  { decade: "70s", value: 15 },
  { decade: "80s", value: 25 },
  { decade: "90s", value: 45 },
  { decade: "00s", value: 68 },
  { decade: "10s", value: 82 },
  { decade: "20s", value: 95 },
];

export function TasteProfile() {
  const tasteScore = 87;
  const totalRatings = 342;
  const influence = 12456;

  return (
    <div className="h-full bg-[#0a0118] overflow-y-auto pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-white text-3xl mb-2">Your Taste DNA</h1>
        <p className="text-[#9ca3af]">Discover your unique music profile</p>
      </div>

      {/* Stats cards */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] rounded-2xl p-4"
          >
            <Sparkles className="w-5 h-5 text-white/80 mb-2" />
            <p className="text-2xl text-white">{tasteScore}</p>
            <p className="text-white/70 text-xs">Taste Score</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#06d6a0] to-[#059669] rounded-2xl p-4"
          >
            <Award className="w-5 h-5 text-white/80 mb-2" />
            <p className="text-2xl text-white">{totalRatings}</p>
            <p className="text-white/70 text-xs">Ratings</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-[#ff006e] to-[#c9184a] rounded-2xl p-4"
          >
            <Target className="w-5 h-5 text-white/80 mb-2" />
            <p className="text-2xl text-white">{influence.toLocaleString()}</p>
            <p className="text-white/70 text-xs">Influence</p>
          </motion.div>
        </div>
      </div>

      {/* Genre Affinity */}
      <div className="px-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1a0f2e] rounded-2xl p-5 border border-[#7c3aed]/10"
        >
          <div className="flex items-center gap-2 mb-4">
            <Music className="w-5 h-5 text-[#7c3aed]" />
            <h2 className="text-white text-lg">Genre Affinity</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={genreData} layout="horizontal">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" tick={{ fill: "#9ca3af", fontSize: 12 }} width={80} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {genreData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#7c3aed" : "#06d6a0"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Decade Preference */}
      <div className="px-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1a0f2e] rounded-2xl p-5 border border-[#7c3aed]/10"
        >
          <h2 className="text-white text-lg mb-4">Decade Preference</h2>
          <div className="space-y-3">
            {decadeData.map((decade, index) => (
              <div key={decade.decade}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#9ca3af]">{decade.decade}</span>
                  <span className="text-white">{decade.value}%</span>
                </div>
                <div className="h-2 bg-[#2d1b4e] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${decade.value}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-[#7c3aed] to-[#06d6a0]"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Radar Chart - Music Attributes */}
      <div className="px-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#1a0f2e] rounded-2xl p-5 border border-[#7c3aed]/10"
        >
          <h2 className="text-white text-lg mb-4">Music Attributes</h2>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2d1b4e" />
              <PolarAngleAxis dataKey="category" tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <Radar
                name="Attributes"
                dataKey="value"
                stroke="#7c3aed"
                fill="#7c3aed"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Controversy Affinity */}
      <div className="px-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#1a0f2e] rounded-2xl p-5 border border-[#7c3aed]/10"
        >
          <h2 className="text-white text-lg mb-4">Controversy Affinity</h2>
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              {/* Gauge background */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="#2d1b4e"
                  strokeWidth="16"
                  fill="none"
                />
                <motion.circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="url(#gradient)"
                  strokeWidth="16"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 502" }}
                  animate={{ strokeDasharray: "377 502" }} // 75% of circle
                  transition={{ delay: 0.7, duration: 1 }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ff006e" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-4xl text-white">75%</p>
                <p className="text-[#9ca3af] text-sm">Bold</p>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-4 text-sm">
            <span className="text-[#9ca3af]">Safe</span>
            <span className="text-[#9ca3af]">Controversial</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
