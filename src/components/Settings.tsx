import React from "react";
import { motion } from "framer-motion";
import { Bell, Target, Clock, Info, ShieldCheck, ShieldAlert, ShieldQuestion, CalendarRange, RefreshCcw, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useHydration } from "../hooks/useHydration";

interface SettingsProps {
  hydration: ReturnType<typeof useHydration>;
}

const Settings: React.FC<SettingsProps> = ({ hydration }) => {
  const { 
    dailyGoal, 
    setDailyGoal, 
    settings, 
    updateSettings, 
    notificationPermission, 
    requestPermission 
  } = hydration;

  const handleToggle = (val: boolean) => {
    if ("vibrate" in navigator) navigator.vibrate(20);
    updateSettings({ remindersEnabled: val });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900">Personalize</h1>

      <div className="space-y-4">
        {/* Goal Card */}
        <div className="space-y-2">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Daily Target</p>
          <Card className="border-none shadow-none bg-white rounded-[2rem] overflow-hidden">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl">
                    <Target size={20} />
                  </div>
                  <span className="font-bold text-slate-900">Intake Goal</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-cyan-600">{dailyGoal}</span>
                  <span className="text-xs font-bold text-slate-400">ml</span>
                </div>
              </div>
              <Slider
                value={[dailyGoal]}
                onValueChange={(val) => setDailyGoal(val[0])}
                min={1000}
                max={5000}
                step={100}
                className="py-2"
              />
              <div className="flex justify-between gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[1500, 2000, 2500, 3000].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      if ("vibrate" in navigator) navigator.vibrate(10);
                      setDailyGoal(p);
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-black transition-all shrink-0 ${
                      dailyGoal === p ? "bg-cyan-600 text-white shadow-lg" : "bg-slate-50 text-slate-400"
                    }`}
                  >
                    {p}ml
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Group */}
        <div className="space-y-2">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Smart Alerts</p>
          <Card className="border-none shadow-none bg-white rounded-[2rem] overflow-hidden">
            <CardContent className="p-0 divide-y divide-slate-50">
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl">
                    <Bell size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Reminders</p>
                    <p className="text-[10px] font-bold text-slate-400">System alerts throughout the day</p>
                  </div>
                </div>
                <Switch checked={settings.remindersEnabled} onCheckedChange={handleToggle} />
              </div>

              {settings.remindersEnabled && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden">
                  <div className="p-5 space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Every</span>
                        <span className="text-cyan-600">{settings.reminderInterval} minutes</span>
                      </div>
                      <Slider
                        value={[settings.reminderInterval]}
                        onValueChange={(val) => updateSettings({ reminderInterval: val[0] })}
                        min={15}
                        max={180}
                        step={15}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <TimeInput label="From" value={settings.startTime} onChange={(v) => updateSettings({ startTime: v })} />
                      <TimeInput label="Until" value={settings.endTime} onChange={(v) => updateSettings({ endTime: v })} />
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-900">Auto-Redistribute</p>
                        <p className="text-[10px] text-slate-500">Adjust goal if you miss a sip</p>
                      </div>
                      <Switch checked={settings.redistributeEnabled} onCheckedChange={(v) => updateSettings({ redistributeEnabled: v })} />
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Permission Action */}
        {notificationPermission !== "granted" && (
          <Button 
            className="w-full h-14 rounded-2xl bg-white border-2 border-cyan-100 text-cyan-600 hover:bg-cyan-50 font-black tracking-tight"
            onClick={requestPermission}
          >
            Enable Device Notifications
          </Button>
        )}

        <div className="p-6 bg-cyan-50/50 rounded-[2rem] flex gap-4">
          <Info size={20} className="text-cyan-600 shrink-0" />
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Stay consistent! Water boosts your energy and keeps your skin glowing. Set realistic goals for best results.
          </p>
        </div>
      </div>
    </div>
  );
};

function TimeInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">{label}</Label>
      <Input 
        type="time" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="h-12 bg-slate-50 border-none rounded-xl font-bold text-slate-900"
      />
    </div>
  );
}

export default Settings;