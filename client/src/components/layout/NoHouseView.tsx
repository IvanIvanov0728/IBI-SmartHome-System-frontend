import React from "react";
import { Shell } from "./Shell";
import { Home, Clock, ShieldCheck } from "lucide-react";
import { 
  Empty, 
  EmptyHeader, 
  EmptyTitle, 
  EmptyDescription, 
  EmptyMedia,
  EmptyContent
} from "@/components/ui/empty";

export function NoHouseView() {
  return (
    <Shell>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Empty className="glass-panel border-none shadow-xl bg-white/40 backdrop-blur-xl max-w-2xl p-12 rounded-[2.5rem]">
          <EmptyMedia variant="icon" className="size-20 bg-primary/10 text-primary rounded-2xl mb-6">
            <Home className="size-10" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle className="text-3xl font-display font-bold text-gray-900 mb-4">
              Welcome to SmartHome OS
            </EmptyTitle>
            <EmptyDescription className="text-lg text-muted-foreground leading-relaxed">
              Your account is active, but your home environment hasn't been configured yet. 
              Our administrators are working to set up your rooms and devices.
            </EmptyDescription>
          </EmptyHeader>
          
          <EmptyContent className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-none">
            <div className="flex items-start gap-4 p-5 bg-white/50 rounded-2xl border border-white/60">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Clock className="size-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm text-gray-900">Pending Setup</div>
                <div className="text-xs text-muted-foreground">We'll notify you as soon as your house is ready.</div>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-5 bg-white/50 rounded-2xl border border-white/60">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <ShieldCheck className="size-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm text-gray-900">Secure Access</div>
                <div className="text-xs text-muted-foreground">Your account is protected and waiting for assignment.</div>
              </div>
            </div>
          </EmptyContent>
        </Empty>
      </div>
    </Shell>
  );
}
