import React from "react";
import { motion } from "framer-motion";

interface BottleVisualProps {
  progress: number;
  total: number;
  goal: number;
}

const BottleVisual: React.FC<BottleVisualProps> = ({ progress, total, goal }) => {
  return (
    <div className="relative w-64 h-[400px] flex flex-col items-center">
      {/* Bottle Body */}
      <div className="relative w-48 h-full bg-slate-100 rounded-[40px] border-4 border-slate-200 overflow-hidden shadow-inner">
        {/* Water Liquid */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-500 to-cyan-400"
        >
          {/* Waves Animation */}
          <div className="absolute top-0 left-0 right-0 h-4 -translate-y-1/2 overflow-hidden">
            <motion.div
              animate={{ x: ["-50%", "0%"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="flex w-[200%] h-full"
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1/4 h-full bg-cyan-400 rounded-[50%]"
                />
              ))}
            </motion.div>
          </div>
          
          {/* Bubbles */}
          <div className="absolute inset-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                initial={{ bottom: -20, opacity: 0 }}
                animate={{ 
                  bottom: ["0%", "100%"],
                  opacity: [0, 1, 0],
                  x: [Math.random() * 20, Math.random() * -20, Math.random() * 20]
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2, 
                  repeat: Infinity, 
                  delay: Math.random() * 5 
                }}
                className="absolute w-2 h-2 bg-white/30 rounded-full left-1/2"
              />
            ))}
          </div>
        </motion.div>

        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
        
        {/* Measurement Marks */}
        <div className="absolute inset-y-8 right-4 flex flex-col justify-between items-end opacity-20 pointer-events-none">
          {[100, 75, 50, 25, 0].map((mark) => (
            <div key={mark} className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400">{mark}%</span>
              <div className="w-4 h-[2px] bg-slate-400" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottle Cap */}
      <div className="absolute -top-4 w-16 h-8 bg-slate-300 rounded-lg shadow-md z-10" />
      
      {/* Progress Badge */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -bottom-4 bg-white px-4 py-2 rounded-2xl shadow-lg border border-slate-100 flex flex-col items-center"
      >
        <span className="text-2xl font-black text-cyan-600">{Math.round(progress)}%</span>
        <span className="text-[10px] uppercase tracking-tighter text-slate-400 font-bold">Hydrated</span>
      </motion.div>
    </div>
  );
};

export default BottleVisual;