import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, Home } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function AccessDenied() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Card className="w-full max-w-lg mx-4 border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full">
              <ShieldAlert className="h-16 w-16 text-amber-500" />
            </div>
          </div>
          
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">Access Denied</h1>
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-6">Unauthorized Control</h2>
          
          <p className="text-slate-600 dark:text-slate-400 mb-10 max-w-sm mx-auto">
            You don't have the administrative privileges required to access this part of the Smart Home System.
          </p>

          <Link href="/">
            <Button className="gap-2 h-12 px-8 text-lg font-medium shadow-lg hover:scale-105 transition-transform" variant="outline">
              <Home className="h-5 w-5" />
              Return Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}