import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Toaster } from "sonner";
import { SplashScreen } from "./components/SplashScreen";
import { Onboarding } from "./components/Onboarding";
import { HomeFeed } from "./components/HomeFeed";
import { TasteProfile } from "./components/TasteProfile";
import { GlobalRankings } from "./components/GlobalRankings";
import { Social } from "./components/Social";
import { Notifications } from "./components/Notifications";
import { BottomNav } from "./components/BottomNav";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState("pulse");

  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case "pulse":
        return <HomeFeed />;
      case "charts":
        return <GlobalRankings />;
      case "profile":
        return <TasteProfile />;
      case "social":
        return <Social />;
      case "notifications":
        return <Notifications />;
      default:
        return <HomeFeed />;
    }
  };

  if (showSplash) {
    return (
      <>
        <SplashScreen onComplete={handleSplashComplete} />
        <Toaster theme="dark" position="top-center" />
      </>
    );
  }

  if (!hasCompletedOnboarding) {
    return (
      <>
        <Onboarding onComplete={handleOnboardingComplete} />
        <Toaster theme="dark" position="top-center" />
      </>
    );
  }

  return (
    <div className="h-screen w-full bg-[#0a0118] overflow-hidden max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      <Toaster theme="dark" position="top-center" />
    </div>
  );
}