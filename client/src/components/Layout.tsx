import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileText, 
  History, 
  Activity, 
  ShieldCheck,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documentation", label: "API Reference", icon: FileText },
  { href: "/history", label: "Request History", icon: History },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation - Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-white/5 fixed inset-y-0 z-50">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center shadow-lg shadow-primary/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">VoiceGuard<span className="text-primary">.ai</span></h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? "bg-primary/10 text-primary font-medium shadow-sm border border-primary/20" 
                    : "text-muted-foreground hover:text-white hover:bg-white/5"}
                `}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-white"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <div className="glass-card rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>System Status</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono text-emerald-400 font-medium">OPERATIONAL</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation Header */}
      <div className="md:hidden flex items-center justify-between p-4 glass-panel sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">VoiceGuard</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-20 px-4"
          >
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium border
                    ${location === item.href 
                      ? "bg-primary/10 border-primary/20 text-primary" 
                      : "border-transparent text-muted-foreground hover:bg-white/5"}
                  `}
                >
                  <item.icon className="w-6 h-6" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 lg:p-12 max-w-[1600px]">
        {children}
      </main>
    </div>
  );
}
