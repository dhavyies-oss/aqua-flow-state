import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Calendar, Droplets, BarChart3, List, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHydration } from "../hooks/useHydration";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

interface HistoryProps {
  hydration: ReturnType<typeof useHydration>;
}

type TimeRange = "daily" | "weekly" | "monthly" | "yearly";

const History: React.FC<HistoryProps> = ({ hydration }) => {
  const [view, setView] = useState<"logs" | "stats">("logs");
  const [timeRange, setTimeRange] = useState<TimeRange>("weekly");

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRelativeDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString();
  };

  const currentStats = hydration.stats[timeRange];

  const chartConfig = {
    amount: { label: "Intake (ml)", color: "#06b6d4" },
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">Journey</h1>
        <div className="flex bg-slate-100 p-1 rounded-full">
          <button
            onClick={() => setView("logs")}
            className={cn(
              "p-2 rounded-full transition-all",
              view === "logs" ? "bg-white text-cyan-600 shadow-sm" : "text-slate-400"
            )}
          >
            <List size={20} />
          </button>
          <button
            onClick={() => setView("stats")}
            className={cn(
              "p-2 rounded-full transition-all",
              view === "stats" ? "bg-white text-cyan-600 shadow-sm" : "text-slate-400"
            )}
          >
            <BarChart3 size={20} />
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {view === "logs" ? (
          <motion.div
            key="logs-view"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            {hydration.logs.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                  <Droplets size={40} className="text-slate-300" />
                </div>
                <p className="font-bold text-slate-400">Your log is empty</p>
                <Button variant="outline" className="rounded-full border-cyan-200 text-cyan-600" onClick={() => { if ("vibrate" in navigator) navigator.vibrate(10); }}>
                  Start Logging
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {hydration.logs.map((log) => (
                  <Card key={log.id} className="border-none shadow-none bg-white rounded-2xl active:bg-slate-50 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl">
                          <Droplets size={18} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{log.amount} ml</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {getRelativeDate(log.timestamp)} • {formatDate(log.timestamp)}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-300 active:text-red-500 rounded-full"
                        onClick={() => {
                          if ("vibrate" in navigator) navigator.vibrate([20, 10, 20]);
                          hydration.removeLog(log.id);
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="stats-view"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            <Card className="border-none shadow-none bg-white rounded-[2rem] p-4">
              <div className="flex justify-center mb-6">
                <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)} className="w-full">
                  <TabsList className="grid grid-cols-4 bg-slate-50 p-1 rounded-full h-10">
                    <TabsTrigger value="daily" className="text-[10px] font-black uppercase rounded-full">Day</TabsTrigger>
                    <TabsTrigger value="weekly" className="text-[10px] font-black uppercase rounded-full">Week</TabsTrigger>
                    <TabsTrigger value="monthly" className="text-[10px] font-black uppercase rounded-full">Month</TabsTrigger>
                    <TabsTrigger value="yearly" className="text-[10px] font-black uppercase rounded-full">Year</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="h-[250px] w-full">
                <BarChart data={currentStats} width={300} height={250} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="label" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                  />
                  <Tooltip cursor={{ fill: '#f8fafc', radius: 4 }} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {currentStats.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.amount >= entry.goal ? "#06b6d4" : "#cbd5e1"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Avg Intake" value={`${Math.round(currentStats.reduce((a, b) => a + b.amount, 0) / currentStats.length)}ml`} />
              <StatCard label="Best Day" value={`${Math.max(...currentStats.map(s => s.amount))}ml`} />
              <StatCard label="Goal Streaks" value={`${currentStats.filter(s => s.amount >= s.goal).length} days`} />
              <StatCard label="Total Vol" value={`${(currentStats.reduce((a, b) => a + b.amount, 0) / 1000).toFixed(1)}L`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-4 rounded-2xl border-none shadow-none">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-black text-slate-900">{value}</p>
    </div>
  );
}

export default History;