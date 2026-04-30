import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Droplets, 
  ArrowLeft, 
  User, 
  Activity, 
  Info,
  ChevronRight,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface OnboardingPageProps {
  onComplete: (goal: number) => void;
}

type OnboardingStep = "welcome" | "profile" | "activity" | "recommendation";

const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [weight, setWeight] = useState<string>("70");
  const [age, setAge] = useState<string>("25");
  const [activity, setActivity] = useState<"sedentary" | "moderate" | "active">("moderate");
  const [customGoal, setCustomGoal] = useState<number>(0);

  const calculateGoal = () => {
    const w = parseFloat(weight) || 70;
    const base = w * 30; // 30ml per kg
    
    let multiplier = 1;
    if (activity === "moderate") multiplier = 1.15;
    if (activity === "active") multiplier = 1.3;

    const result = Math.round((base * multiplier) / 50) * 50;
    return Math.max(1000, Math.min(6000, result));
  };

  const handleNext = () => {
    if ("vibrate" in navigator) navigator.vibrate(10);
    if (step === "welcome") setStep("profile");
    else if (step === "profile") setStep("activity");
    else if (step === "activity") {
      setCustomGoal(calculateGoal());
      setStep("recommendation");
    }
    else if (step === "recommendation") {
      onComplete(customGoal);
    }
  };

  const handleBack = () => {
    if ("vibrate" in navigator) navigator.vibrate(5);
    if (step === "profile") setStep("welcome");
    else if (step === "activity") setStep("profile");
    else if (step === "recommendation") setStep("activity");
  };

  const steps: OnboardingStep[] = ["welcome", "profile", "activity", "recommendation"];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col items-center justify-center p-6 overflow-hidden select-none touch-none">
      {/* Background Decor */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 z-0"
        style={{ 
          backgroundImage: `url('https://storage.googleapis.com/dala-prod-public-storage/generated-images/fa0c5d8a-5cec-4b83-9f2d-6199e5a5510c/onboarding-bg-f8ddc310-1777575553878.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(40px)'
        }}
      />

      <div className="w-full max-w-md relative z-10 flex flex-col h-full justify-center">
        {/* Progress Bar */}
        <div className="flex justify-center gap-2 mb-12">
          {steps.map((s, idx) => (
            <div 
              key={s} 
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                idx <= currentStepIndex ? "w-8 bg-cyan-600" : "w-4 bg-slate-200"
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="text-center space-y-8"
            >
              <div className="inline-flex p-6 bg-cyan-600 text-white rounded-[2rem] shadow-xl shadow-cyan-100 mb-2">
                <Droplets size={64} />
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                  Stay <span className="text-cyan-600">Pure</span>
                </h1>
                <p className="text-slate-500 text-lg font-medium leading-relaxed px-4">
                  Smart hydration tracking designed for your active lifestyle.
                </p>
              </div>
              <Button 
                onClick={handleNext} 
                className="w-full h-16 text-xl font-black bg-cyan-600 hover:bg-cyan-700 shadow-xl shadow-cyan-100 rounded-3xl active:scale-95 transition-transform"
              >
                Get Started
                <ChevronRight className="ml-2" />
              </Button>
            </motion.div>
          )}

          {step === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                  <User size={32} className="text-cyan-600" />
                  Profile
                </h2>
                <p className="text-slate-500 font-medium">Personalize your water needs.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="weight" className="text-slate-900 font-bold ml-1">Weight</Label>
                  <div className="relative">
                    <Input 
                      id="weight"
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="h-16 pl-6 pr-16 text-2xl font-black border-none bg-white rounded-3xl shadow-sm focus:ring-2 focus:ring-cyan-500"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">kg</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="age" className="text-slate-900 font-bold ml-1">Age</Label>
                  <Input 
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="h-16 px-6 text-2xl font-black border-none bg-white rounded-3xl shadow-sm focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={handleBack} className="h-16 px-8 rounded-3xl border-none bg-white shadow-sm active:scale-95 transition-transform">
                  <ArrowLeft size={24} />
                </Button>
                <Button onClick={handleNext} className="flex-1 h-16 text-xl font-black bg-cyan-600 hover:bg-cyan-700 rounded-3xl shadow-xl shadow-cyan-100 active:scale-95 transition-transform">
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === "activity" && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                  <Activity size={32} className="text-cyan-600" />
                  Activity
                </h2>
                <p className="text-slate-500 font-medium">Your daily movement level.</p>
              </div>

              <RadioGroup value={activity} onValueChange={(val: any) => setActivity(val)} className="grid grid-cols-1 gap-4">
                {[
                  { id: "sedentary", label: "Sedentary", desc: "Mostly sitting" },
                  { id: "moderate", label: "Moderate", desc: "Daily walking" },
                  { id: "active", label: "Active", desc: "High movement" }
                ].map((item) => (
                  <Label
                    key={item.id}
                    htmlFor={item.id}
                    className={cn(
                      "flex items-center justify-between p-6 rounded-[2rem] cursor-pointer transition-all shadow-sm",
                      activity === item.id ? "bg-cyan-600 text-white shadow-xl shadow-cyan-100" : "bg-white text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    <div className="space-y-1">
                      <p className="font-black text-lg">{item.label}</p>
                      <p className={cn("text-xs font-bold uppercase tracking-widest", activity === item.id ? "text-cyan-100" : "text-slate-400")}>{item.desc}</p>
                    </div>
                    <RadioGroupItem value={item.id} id={item.id} className="sr-only" />
                    {activity === item.id && <Check size={24} className="text-white" />}
                  </Label>
                ))}
              </RadioGroup>

              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={handleBack} className="h-16 px-8 rounded-3xl border-none bg-white shadow-sm active:scale-95 transition-transform">
                  <ArrowLeft size={24} />
                </Button>
                <Button onClick={handleNext} className="flex-1 h-16 text-xl font-black bg-cyan-600 hover:bg-cyan-700 rounded-3xl shadow-xl shadow-cyan-100 active:scale-95 transition-transform">
                  Calculate
                </Button>
              </div>
            </motion.div>
          )}

          {step === "recommendation" && (
            <motion.div
              key="recommendation"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="space-y-10"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-slate-900">Recommended Goal</h2>
                <p className="text-slate-500 font-medium">To keep you at peak performance.</p>
              </div>

              <div className="bg-cyan-600 p-12 rounded-[3rem] shadow-2xl shadow-cyan-200 text-center relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-xs font-black text-cyan-200 uppercase tracking-[0.2em] mb-4">Daily Intake</p>
                  <div className="flex items-center justify-center">
                    <span className="text-7xl font-black text-white tracking-tighter">
                      {customGoal}
                    </span>
                    <span className="text-xl font-black text-cyan-200 ml-3 uppercase tracking-widest">ml</span>
                  </div>
                </div>
                <Droplets className="absolute -bottom-12 -right-12 w-48 h-48 opacity-10 rotate-12 text-white" />
              </div>

              <div className="space-y-6">
                <div className="p-5 bg-white rounded-[2rem] flex gap-4 text-xs font-bold text-slate-500 leading-relaxed shadow-sm">
                  <Info size={24} className="text-cyan-600 shrink-0" />
                  <p>Consistency is key. We'll send gentle reminders to help you reach this goal safely.</p>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleBack} className="h-16 px-8 rounded-3xl border-none bg-white shadow-sm active:scale-95 transition-transform">
                    <ArrowLeft size={24} />
                  </Button>
                  <Button onClick={handleNext} className="flex-1 h-16 text-xl font-black bg-cyan-600 hover:bg-cyan-700 shadow-2xl shadow-cyan-200 rounded-3xl active:scale-95 transition-transform">
                    Let's Go!
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingPage;