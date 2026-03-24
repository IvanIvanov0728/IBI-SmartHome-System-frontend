import React, { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { Lock, Unlock, Shield, AlertTriangle, History, Video, Camera } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import porchCam from "@assets/generated_images/security_camera_view_of_front_porch.png";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  getSecurityOverview, 
  updateEntryPointLockStatus, 
  getActivityLog,
  SecurityOverview, 
  ActivityLogEntry 
} from "../api/security";
import { LoadingScreen } from "@/components/ui/loading-screen";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SecurityPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: securityOverview, isLoading, error } = useQuery<SecurityOverview, Error>({
    queryKey: ["securityOverview"],
    queryFn: getSecurityOverview,
  });

  const { data: fullActivityLog } = useQuery<ActivityLogEntry[], Error>({
    queryKey: ["fullActivityLog"],
    queryFn: getActivityLog,
    enabled: true, // we can also enable it only when dialog is open but query cache is fine
  });

  const updateLockMutation = useMutation({
    mutationFn: ({ deviceId, isLocked }: { deviceId: number; isLocked: boolean }) =>
      updateEntryPointLockStatus(deviceId, isLocked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["securityOverview"] });
      toast({ title: "Security device updated." });
    },
    onError: (err) => {
      toast({
        title: "Failed to update device",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Shell>
        <LoadingScreen message="Зареждане на данните за сигурност..." />
      </Shell>
    );
  }

  if (error || !securityOverview) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-destructive">Error loading security data: {error?.message || "No data available"}</p>
        </div>
      </Shell>
    );
  }

  const { entryPoints, cameras, activityLog, isSystemArmed, systemStatusMessage } = securityOverview;

  return (
    <Shell>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Security</h1>
          <p className="text-muted-foreground">System Status: {systemStatusMessage}</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
             <AlertTriangle className="w-4 h-4" /> Panic
           </Button>
           <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
             <Shield className="w-4 h-4" /> Armed
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Camera Feed - Main */}
        <div className="lg:col-span-2 rounded-3xl overflow-hidden relative group aspect-video bg-black shadow-lg">
          {cameras.length > 0 ? (
            <img 
              src={cameras[0].streamUrl || porchCam} // Use first camera's streamUrl or fallback
              alt={cameras[0].name || "Camera Feed"} 
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
              <Camera size={48} />
              <p className="ml-2">No Cameras Configured</p>
            </div>
          )}
          {cameras.length > 0 && cameras[0].isLive && (
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> LIVE • {cameras[0].name}
            </div>
          )}
          {cameras.length > 0 && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button size="icon" variant="secondary" className="rounded-full bg-white/20 backdrop-blur text-white border-none hover:bg-white/40">
                <Video className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Locks Status */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col">
          <h3 className="font-semibold text-lg font-display mb-6">Entry Points</h3>
          <div className="space-y-4 flex-1">
            {entryPoints.length > 0 ? (
              entryPoints.map((ep) => (
                <div key={ep.deviceId} className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-white/60">
                  <div className="flex items-center gap-3">
                    {ep.isLocked ? (
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Lock className="w-4 h-4" /></div>
                    ) : (
                      <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Unlock className="w-4 h-4" /></div>
                    )}
                    <span className="font-medium text-sm">{ep.name}</span>
                  </div>
                  <Switch 
                    checked={ep.isLocked} 
                    onCheckedChange={(checked) => updateLockMutation.mutate({ deviceId: ep.deviceId, isLocked: checked })}
                    disabled={updateLockMutation.isPending}
                  />
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground italic">No entry points configured.</div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="glass-panel p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg font-display">Recent Activity</h3>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-white/50 rounded-xl">
                <History className="w-4 h-4 mr-2" /> View History
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel bg-white/80 backdrop-blur-2xl rounded-[2rem] border-none max-w-2xl max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-2xl font-display font-bold">Activity History</DialogTitle>
              </DialogHeader>
              <ScrollArea className="flex-1 pr-4 -mr-4 mt-4">
                <div className="space-y-2">
                  {fullActivityLog && fullActivityLog.length > 0 ? (
                    fullActivityLog.map((log) => (
                      <div key={log.id} className="flex items-center gap-4 p-4 bg-white/40 hover:bg-white/60 rounded-2xl border border-white/50 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono text-muted-foreground">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex-1 font-medium text-sm text-gray-900">{log.event}</div>
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          log.type === "warning" ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" :
                          log.type === "success" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" :
                          "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                        )} />
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center text-muted-foreground italic">
                      No activity history found.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-1">
          {activityLog.length > 0 ? (
            activityLog.slice(0, 6).map((log) => (
              <div key={log.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <span className="text-xs font-mono text-muted-foreground w-20">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <div className="flex-1 font-medium text-sm">{log.event}</div>
                {log.type === "warning" && <span className="w-2 h-2 rounded-full bg-orange-500" />}
                {log.type === "success" && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                {log.type === "info" && <span className="w-2 h-2 rounded-full bg-blue-500" />}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground italic">No recent activity.</div>
          )}
        </div>
      </div>
    </Shell>
  );
}
