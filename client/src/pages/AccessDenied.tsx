import React from "react";
import { Link } from "wouter";
import { Shell } from "@/components/layout/Shell";
import { ShieldAlert, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import abstractBg from "@assets/generated_images/abstract_soft_gradient_waves_in_beige_and_white.png";

export default function AccessDenied() {
  return (
    <Shell>
      <div className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/20">
        {/* Background with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={abstractBg} 
            alt="Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 max-w-2xl w-full py-16 px-8 rounded-3xl bg-white/30 backdrop-blur-xl border border-white/50 shadow-xl">
          <div className="mb-8 flex justify-center">
            <div className="p-6 bg-amber-500/10 rounded-full ring-8 ring-amber-500/5">
              <ShieldAlert className="h-20 w-20 text-amber-500 animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-6xl font-display font-black text-gray-900 mb-4 tracking-tight">ACCESS DENIED</h1>
          <h2 className="text-2xl font-display font-bold text-gray-800 mb-6">Security Restriction</h2>
          
          <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-md mx-auto">
            You don't have the administrative privileges required to access this high-security area of your Smart Home System.
          </p>

          <Link href="/">
            <Button size="lg" className="h-14 px-10 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all gap-3 bg-gray-900 text-white hover:bg-black">
              <Home className="h-6 w-6" />
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </Shell>
  );
}