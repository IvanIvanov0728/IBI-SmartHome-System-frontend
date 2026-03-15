import React from "react";
import { cn } from "@/lib/utils";
import { Sun, Moon, Film, LogOut, Zap } from "lucide-react";
import { executeScene, getScenes, Scene } from "@/api/scenes";
import { useQuery } from "@tanstack/react-query";

interface QuickActionsProps {
  className?: string;
}

const getSceneConfig = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("morning") || lower.includes("wake")) 
    return { icon: Sun, color: "bg-orange-100 text-orange-600" };
  if (lower.includes("night") || lower.includes("sleep")) 
    return { icon: Moon, color: "bg-indigo-100 text-indigo-600" };
  if (lower.includes("movie") || lower.includes("film")) 
    return { icon: Film, color: "bg-purple-100 text-purple-600" };
  if (lower.includes("away") || lower.includes("leave")) 
    return { icon: LogOut, color: "bg-emerald-100 text-emerald-600" };
  
  return { icon: Zap, color: "bg-blue-100 text-blue-600" };
};

export function QuickActions({ className }: QuickActionsProps) {
  const { data: scenes, isLoading } = useQuery<Scene[]>({
    queryKey: ["/api/scenes"],
    queryFn: getScenes,
  });

  const handleClick = async (sceneId: number) => {
    try {
      await executeScene(sceneId);
      console.log(`Scene ${sceneId} executed successfully!`);
    } catch (error) {
      console.error("Error executing scene:", error);
    }
  };

  if (isLoading) return <div className="text-muted-foreground text-sm italic">Loading scenes...</div>;

  if (!scenes || scenes.length === 0) {
    return <div className="text-muted-foreground text-sm italic">No scenes configured.</div>;
  }

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-4", className)}>
      {scenes.slice(0, 4).map((scene) => {
        const config = getSceneConfig(scene.name);
        return (
          <button
            key={scene.id}
            onClick={() => handleClick(scene.id)}
            className="group flex flex-col items-center justify-center gap-3 p-4 rounded-2xl glass-card hover:bg-white transition-all duration-300 active:scale-95">
            
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110", config.color)}>
              <config.icon className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate w-full text-center">
              {scene.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
