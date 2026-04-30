import React from "react";
import { motion } from "framer-motion";
import { Plus, Coffee, GlassWater, Droplets as Drop } from "lucide-react";
import BottleVisual from "./BottleVisual";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useHydration } from "../hooks/useHydration";

interface DashboardProps {
  hydration: ReturnType<typeof useHydration>;
}

const Dashboard: React.FC<DashboardProps> = ({ hydration }) => {
  const commonAmounts = [
    { label: "250ml", amount: 250, icon: <GlassWater size={20} /> },
    { label: "500ml", amount: 500, icon: <Drop size={20} /> },
    { label: "Coffee", amount: 150, icon: <Coffee size={20} /> },
  ];

  const handleLog = (amount: number) => {
    if ("vibrate" in navigator) navigator.vibrate(40);
    hydration.addLog(amount);
  };

  const { progress, totalToday, dailyGoal } = hydration;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 leading-tight">Hydration Today</h1>
        <p className="text-slate-500 text-sm font-medium">Keep it up! Your body will thank you.</p>
      </div>

      {/* Bottle Visual Section - Larger for mobile focus */}
      <div className="flex justify-center py-4">
        <BottleVisual progress={progress} total={totalToday} goal={dailyGoal} />
      </div>

      {/* Stats Summary */}
      <div className="bg-cyan-600 rounded-[2rem] p-6 text-white shadow-xl shadow-cyan-200 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Current Goal Status</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black">{totalToday}</span>
            <span className="text-xl font-bold opacity-60">/ {dailyGoal} ml</span>
          </div>
          <p className="mt-4 text-xs font-bold bg-white/20 inline-block px-3 py-1.5 rounded-full backdrop-blur-md">
            {progress >= 100 ? "🎉 Daily Goal Achieved!" : `💧 ${Math.round(Math.max(0, dailyGoal - totalToday))}ml more to go`}
          </p>
        </div>
        <Drop className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 rotate-12" />
      </div>

      {/* Quick Log Section - Thumb friendly grid */}
      <Card className="border-none shadow-none bg-slate-100/50 rounded-[2rem]">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {commonAmounts.map((item) => (
              <Button
                key={item.label}
                variant="outline"
                className="h-20 flex flex-col gap-1 rounded-2xl bg-white border-none shadow-sm active:scale-95 transition-transform"
                onClick={() => handleLog(item.amount)}
              >
                {item.icon}
                <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">{item.label}</span>
              </Button>
            ))}
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-1 rounded-2xl bg-white border-none shadow-sm active:scale-95 transition-transform"
              onClick={() => {
                const custom = prompt("Enter amount in ml:");
                if (custom && !isNaN(Number(custom))) {
                  handleLog(Number(custom));
                }
              }}
            >
              <Plus size={20} />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">Custom</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;