import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  delay?: number;
}

export function StatsCard({ title, value, icon, trend, trendUp, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-panel rounded-2xl p-6 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300 transform group-hover:scale-110">
        <div className="w-24 h-24 bg-gradient-to-br from-primary to-transparent rounded-full blur-2xl" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-muted-foreground">
            {icon}
          </div>
          {trend && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full border ${
              trendUp 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}>
              {trend}
            </span>
          )}
        </div>
        
        <div>
          <h3 className="text-3xl font-bold text-white tracking-tight mb-1 font-mono">
            {value}
          </h3>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
        </div>
      </div>
    </motion.div>
  );
}
