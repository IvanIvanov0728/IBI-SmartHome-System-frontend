import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Lightbulb, 
  Thermometer, 
  Shield, 
  Settings, 
  Zap,
  Menu,
  X,
  Sparkles,
  LogOut,
  UserCog
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";

interface ShellProps {
  children: React.ReactNode;
}

const navItemsNoFilter = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Lightbulb, label: "Lighting", href: "/lighting" },
  { icon: Thermometer, label: "Climate", href: "/climate" },
  { icon: Zap, label: "Energy", href: "/energy" },
  { icon: Shield, label: "Security", href: "/security" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: UserCog, label: "Admin", href: "/admin" },
];

export function Shell({ children }: ShellProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

  const navItems = navItemsNoFilter.filter((item) => {
    // If the item is the Admin tab, check if user is an Admin
    if (item.label === "Admin") {
      return user?.role === "Admin";
    }
    // Show all other tabs to everyone
    return true;
  });

  const NavContent = () => (
    <div className="flex flex-col h-full py-6">
      <div className="px-6 mb-8 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold font-display">
          IBI
        </div>
        <span className="text-xl font-bold font-display tracking-tight">IBI SMART HOME</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <a 
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-white hover:text-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                <span className={cn("font-medium", isActive ? "font-semibold" : "")}>{item.label}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 mt-auto space-y-4">
        {user && (
          <div className="p-4 rounded-2xl bg-white/50 border border-white/60 shadow-sm backdrop-blur-sm flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                {/* Use ?. and || to provide a fallback if username is undefined */}
                {(user?.username || user?.email || "U")[0].toUpperCase()}
              </div>
              <div className="truncate">
                {/* Safely split the name or email */}
                <p className="text-xs font-bold truncate">
                  {(user?.username || user?.email || "User").split('@')[0]}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">Home Owner</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-white/50 border border-white/60 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">System Online</span>
          </div>
          <div className="text-xs text-muted-foreground/60">
            v2.4.0 • Connected
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex text-foreground font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 bg-muted/30 border-r border-border/50 fixed h-full z-30">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-border/50 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold font-display">
            L
          </div>
          <span className="text-lg font-bold font-display">Lumina</span>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-muted/30 w-72 border-r border-border/50">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-h-screen pt-20 lg:pt-0 p-4 lg:p-8 overflow-x-hidden">
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}