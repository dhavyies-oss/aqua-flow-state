import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { 
  isSameDay, 
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  subDays, 
  subWeeks, 
  subYears, 
  isSameMonth, 
  isSameYear,
  setHours,
  setMinutes,
  differenceInMinutes,
  isAfter,
  isBefore
} from "date-fns";

export interface LogEntry {
  id: string;
  amount: number;
  timestamp: number;
}

export interface HydrationSettings {
  reminderInterval: number; // minutes
  remindersEnabled: boolean;
  redistributeEnabled: boolean;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

export interface StatsData {
  label: string;
  amount: number;
  goal: number;
}

export const useHydration = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [dailyGoal, setDailyGoal] = useState<number>(2000);
  const [lastReminderTime, setLastReminderTime] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem("hydration_last_reminder");
    return saved ? Number(saved) : null;
  });

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem("hydration_onboarding_complete");
    return saved === "true";
  });
  
  const [settings, setSettings] = useState<HydrationSettings>(() => {
    if (typeof window === 'undefined') return { 
      reminderInterval: 60, 
      remindersEnabled: true,
      redistributeEnabled: false,
      startTime: "08:00",
      endTime: "22:00"
    };
    const saved = localStorage.getItem("hydration_settings");
    return saved ? JSON.parse(saved) : {
      reminderInterval: 60,
      remindersEnabled: true,
      redistributeEnabled: false,
      startTime: "08:00",
      endTime: "22:00"
    };
  });
  
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  // Load remaining data (logs and goal)
  useEffect(() => {
    const savedLogs = localStorage.getItem("hydration_logs");
    const savedGoal = localStorage.getItem("hydration_goal");

    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedGoal) setDailyGoal(Number(savedGoal));
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem("hydration_logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("hydration_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("hydration_goal", dailyGoal.toString());
  }, [dailyGoal]);

  useEffect(() => {
    if (lastReminderTime) {
      localStorage.setItem("hydration_last_reminder", lastReminderTime.toString());
    }
  }, [lastReminderTime]);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      toast.error("This browser does not support desktop notifications");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === "granted") {
        toast.success("Notifications enabled!", {
          description: "You will now receive hydration reminders."
        });
      } else if (permission === "denied") {
        toast.error("Notifications blocked", {
          description: "Please enable notifications in your browser settings to receive reminders."
        });
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  }, []);

  const addLog = (amount: number) => {
    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      amount,
      timestamp: Date.now(),
    };
    setLogs((prev) => [newLog, ...prev]);
    toast.success(`Logged ${amount}ml of water!`, {
      description: "Keep it up!",
      icon: "💧",
    });
  };

  const removeLog = (id: string) => {
    setLogs((prev) => prev.filter((log) => log.id !== id));
  };

  const updateSettings = (newSettings: Partial<HydrationSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const completeOnboarding = (goal: number) => {
    setDailyGoal(goal);
    setHasCompletedOnboarding(true);
    localStorage.setItem("hydration_onboarding_complete", "true");
    localStorage.setItem("hydration_goal", goal.toString());
  };

  const todayLogs = useMemo(() => logs.filter((log) => {
    return isSameDay(new Date(log.timestamp), new Date());
  }), [logs]);

  const totalToday = useMemo(() => todayLogs.reduce((acc, log) => acc + log.amount, 0), [todayLogs]);
  const progress = useMemo(() => Math.min((totalToday / dailyGoal) * 100, 100), [totalToday, dailyGoal]);

  // Suggested Intake Calculation
  const suggestedIntake = useMemo(() => {
    if (!settings.redistributeEnabled) {
      // Basic calculation: Goal divided by roughly 8 intervals if no redistribution
      return Math.round(dailyGoal / 8);
    }

    const now = new Date();
    const [startHour, startMin] = settings.startTime.split(":").map(Number);
    const [endHour, endMin] = settings.endTime.split(":").map(Number);
    
    let endTime = setHours(setMinutes(new Date(), endMin), endHour);
    let startTime = setHours(setMinutes(new Date(), startMin), startHour);

    // If current time is after end time, or goal met, suggested is 0
    if (isAfter(now, endTime) || totalToday >= dailyGoal) return 0;
    
    // If before start time, start calculation from start time
    const activeStart = isBefore(now, startTime) ? startTime : now;
    
    const remainingMinutes = differenceInMinutes(endTime, activeStart);
    const remainingIntervals = Math.max(1, Math.ceil(remainingMinutes / settings.reminderInterval));
    const remainingGoal = dailyGoal - totalToday;
    
    return Math.max(0, Math.round(remainingGoal / remainingIntervals));
  }, [dailyGoal, totalToday, settings.redistributeEnabled, settings.startTime, settings.endTime, settings.reminderInterval]);

  // Statistics Aggregation
  const dailyStats = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });

    return last7Days.map(day => {
      const amount = logs.filter(log => isSameDay(new Date(log.timestamp), day))
        .reduce((sum, log) => sum + log.amount, 0);
      return {
        label: format(day, "EEE"),
        amount,
        goal: dailyGoal
      };
    });
  }, [logs, dailyGoal]);

  const weeklyStats = useMemo(() => {
    const last4Weeks = eachWeekOfInterval({
      start: subWeeks(new Date(), 3),
      end: new Date(),
    });

    return last4Weeks.map(week => {
      const weekStart = startOfWeek(week);
      const weekEnd = endOfWeek(week);
      const amount = logs.filter(log => {
        const date = new Date(log.timestamp);
        return date >= weekStart && date <= weekEnd;
      }).reduce((sum, log) => sum + log.amount, 0);
      
      return {
        label: `W${format(week, "w")}`,
        amount,
        goal: dailyGoal * 7
      };
    });
  }, [logs, dailyGoal]);

  const monthlyStats = useMemo(() => {
    const currentYear = eachMonthOfInterval({
      start: startOfYear(new Date()),
      end: endOfYear(new Date()),
    });

    return currentYear.map(month => {
      const amount = logs.filter(log => isSameMonth(new Date(log.timestamp), month))
        .reduce((sum, log) => sum + log.amount, 0);
      
      return {
        label: format(month, "MMM"),
        amount,
        goal: dailyGoal * 30 // Rough estimate
      };
    });
  }, [logs, dailyGoal]);

  const yearlyStats = useMemo(() => {
    const last5Years = eachYearOfInterval({
      start: subYears(new Date(), 4),
      end: new Date(),
    });

    return last5Years.map(year => {
      const amount = logs.filter(log => isSameYear(new Date(log.timestamp), year))
        .reduce((sum, log) => sum + log.amount, 0);
      
      return {
        label: format(year, "yyyy"),
        amount,
        goal: dailyGoal * 365
      };
    });
  }, [logs, dailyGoal]);

  return {
    logs,
    todayLogs,
    totalToday,
    progress,
    dailyGoal,
    setDailyGoal,
    settings,
    suggestedIntake,
    lastReminderTime,
    setLastReminderTime,
    addLog,
    removeLog,
    updateSettings,
    notificationPermission,
    requestPermission,
    hasCompletedOnboarding,
    completeOnboarding,
    stats: {
      daily: dailyStats,
      weekly: weeklyStats,
      monthly: monthlyStats,
      yearly: yearlyStats,
    }
  };
};