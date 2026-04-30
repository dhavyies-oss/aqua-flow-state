import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import History from "./components/History";
import Settings from "./components/Settings";
import OnboardingPage from "./components/OnboardingPage";
import { Toaster } from "@/components/ui/sonner";
import { useHydration } from "./hooks/useHydration";
import { Droplets, History as HistoryIcon, Settings as SettingsIcon, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { isWithinInterval, setHours, setMinutes } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "history" | "settings">("dashboard");
  const hydration = useHydration();

  // Handle system-level reminders
  useEffect(() => {
    if (hydration.settings.remindersEnabled && hydration.hasCompletedOnboarding) {
      const intervalTime = hydration.settings.reminderInterval * 60 * 1000;
      
      const sendNotification = () => {
        const now = new Date();
        const [startHour, startMin] = hydration.settings.startTime.split(":").map(Number);
        const [endHour, endMin] = hydration.settings.endTime.split(":").map(Number);
        
        const startTime = setHours(setMinutes(new Date(), startMin), startHour);
        const endTime = setHours(setMinutes(new Date(), endMin), endHour);

        if (!isWithinInterval(now, { start: startTime, end: endTime })) return;
        if (hydration.totalToday >= hydration.dailyGoal) return;

        const suggestedAmount = hydration.suggestedIntake;
        const title = "Time to Hydrate! 💧";
        const body = `Drink ${suggestedAmount}ml now to stay on track.`;

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(title, { body, icon: "/favicon.ico" });
        }

        toast.info(title, {
          description: body,
          action: {
            label: "Drank it!",
            onClick: () => {
              if ("vibrate" in navigator) navigator.vibrate(50);
              hydration.addLog(suggestedAmount);
            },
          },
        });
        hydration.setLastReminderTime(Date.now());
      };

      const interval = setInterval(sendNotification, intervalTime);
      return () => clearInterval(interval);
    }
  }, [hydration]);

  if (!hydration.hasCompletedOnboarding) {
    return (
      <div className="safe-top safe-bottom h-screen overflow-hidden bg-slate-50">
        <Toaster position="top-center" richColors />
        <OnboardingPage onComplete={hydration.completeOnboarding} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 text-slate-900 font-sans flex flex-col overflow-hidden select-none">
      <Toaster position="top-center" richColors closeButton />
      
      {/* App Header */}
      <header className="pt-12 pb-4 px-6 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-600 rounded-xl text-white shadow-lg shadow-cyan-200">
            <Droplets size={20} />
          </div>
          <span className="font-black text-xl tracking-tight text-slate-900">HYDRATE</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
          <span className="text-xs font-bold text-slate-500">{Math.round(hydration.progress)}%</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative pb-24 touch-pan-y">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="p-6"
          >
            {activeTab === "dashboard" && <Dashboard hydration={hydration} />}
            {activeTab === "history" && <History hydration={hydration} />}
            {activeTab === "settings" && <Settings hydration={hydration} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Tab Bar (Bottom Nav) */}
      <nav className="fixed bottom-0 left-0 right-0 pb-8 pt-3 bg-white/90 backdrop-blur-2xl border-t border-slate-100 flex items-center justify-around z-50 px-4">
        <NavButton 
          active={activeTab === "dashboard"} 
          onClick={() => {
            if ("vibrate" in navigator) navigator.vibrate(10);
            setActiveTab("dashboard");
          }} 
          icon={<Home size={22} />} 
          label="Home" 
        />
        <NavButton 
          active={activeTab === "history"} 
          onClick={() => {
            if ("vibrate" in navigator) navigator.vibrate(10);
            setActiveTab("history");
          }} 
          icon={<HistoryIcon size={22} />} 
          label="History" 
        />
        <NavButton 
          active={activeTab === "settings"} 
          onClick={() => {
            if ("vibrate" in navigator) navigator.vibrate(10);
            setActiveTab("settings");
          }} 
          icon={<SettingsIcon size={22} />} 
          label="Setup" 
        />
      </nav>
    </div>
  );
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function NavButton({ active, onClick, icon, label }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 transition-all flex-1 py-1 relative",
        active ? "text-cyan-600" : "text-slate-400"
      )}
    >
      <motion.div
        animate={active ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
        className={cn(
          "p-2 rounded-xl transition-colors",
          active ? "bg-cyan-50" : "bg-transparent"
        )}
      >
        {icon}
      </motion.div>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-dot"
          className="absolute -bottom-1 w-1 h-1 bg-cyan-600 rounded-full"
        />
      )}
    </button>
  );
}

export default App;