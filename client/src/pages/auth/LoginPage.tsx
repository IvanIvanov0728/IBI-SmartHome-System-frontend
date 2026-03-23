import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import authBg from "@assets/generated_images/abstract_soft_gradient_waves_in_beige_and_white.png";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password, rememberMe });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#f8f9fa]">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <img src={authBg} alt="Background" className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="glass-panel p-8 md:p-10 rounded-[2.5rem] shadow-xl border-white/50 bg-white/60 backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold font-display mx-auto mb-4 shadow-lg shadow-primary/20">
              IBI
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Enter your credentials to access your home</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 ml-1">Email</label>
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com" 
                className="rounded-xl border-gray-200 bg-white/50 focus:bg-white transition-all h-12" 
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                <a href="#" className="text-xs font-medium text-primary hover:underline">Forgot password?</a>
              </div>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="rounded-xl border-gray-200 bg-white/50 focus:bg-white transition-all h-12" 
                required
              />
            </div>

            <div className="flex items-center space-x-2 ml-1">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-600"
              >
                Remember me
              </label>
            </div>

            <Button 
              type="submit"
              className="w-full h-12 rounded-xl text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all mt-2"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup">
                <a className="font-semibold text-primary hover:underline">Sign up</a>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}