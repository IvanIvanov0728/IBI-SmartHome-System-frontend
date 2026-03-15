import React, { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Sun, Moon, Film, LogOut, Plus, Music, BookOpen, Coffee, PartyPopper, Sparkles, X, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { executeScene } from "@/api/scenes";

const initialScenes = [
  { id: 3, label: "Good Morning", icon: Sun, color: "bg-orange-100 text-orange-600", active: false, description: "Blinds up, lights 50%, coffee on" },
  { id: 4, label: "Good Night", icon: Moon, color: "bg-indigo-100 text-indigo-600", active: false, description: "All off, doors locked, temp 68°" },
  { id: 1, label: "Arrive Home", icon: Home, color: "bg-blue-100 text-blue-600", active: false, description: "Welcome back home" },
  { id: 2, label: "Leave Home", icon: LogOut, color: "bg-emerald-100 text-emerald-600", active: false, description: "Security armed, eco mode on" },
  { id: "movie", label: "Movie Time", icon: Film, color: "bg-purple-100 text-purple-600", active: true, description: "Lights dimmed, TV backlight on" },
  { id: "reading", label: "Reading Mode", icon: BookOpen, color: "bg-blue-100 text-blue-600", active: false, description: "Warm light, silence notifications" },
  { id: "music", label: "Music Flow", icon: Music, color: "bg-pink-100 text-pink-600", active: false, description: "Speaker groups synced, volume 40%" },
  { id: "relax", label: "Relaxation", icon: Coffee, color: "bg-stone-100 text-stone-600", active: false, description: "Soft amber light, temp 72°" },
  { id: "party", label: "Party Mode", icon: PartyPopper, color: "bg-yellow-100 text-yellow-600", active: false, description: "Color loop, volume 80%, cool 68°" },
];

export default function ScenesPage() {
  const [scenes, setScenes] = useState(initialScenes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newScene, setNewScene] = useState({ label: "", description: "" });

  const activateScene = async (id: string | number) => {
    // If it's a numeric ID, call the backend
    if (typeof id === 'number') {
      try {
        await executeScene(id);
        console.log(`Scene ${id} executed successfully`);
      } catch (error) {
        console.error(`Failed to execute scene ${id}:`, error);
      }
    }
    
    setScenes(scenes.map(s => s.id === id ? { ...s, active: true } : { ...s, active: false }));
  };

  const handleCreateScene = () => {
    if (!newScene.label) return;
    
    const id = newScene.label.toLowerCase().replace(/\s+/g, '-');
    const colors = [
      "bg-orange-100 text-orange-600",
      "bg-blue-100 text-blue-600",
      "bg-purple-100 text-purple-600",
      "bg-emerald-100 text-emerald-600"
    ];
    
    setScenes([...scenes, {
      id,
      label: newScene.label,
      description: newScene.description,
      icon: Sparkles,
      color: colors[Math.floor(Math.random() * colors.length)],
      active: false
    }]);
    
    setNewScene({ label: "", description: "" });
    setIsDialogOpen(false);
  };

  return (
    <Shell>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Scenes</h1>
          <p className="text-muted-foreground">Automate your environment</p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="rounded-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" /> Create Scene
        </Button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {scenes.map((scene) => (
          <div 
            key={scene.id}
            onClick={() => activateScene(scene.id)}
            className={cn(
              "group relative p-6 rounded-3xl transition-all duration-300 cursor-pointer border",
              scene.active 
                ? "bg-white shadow-lg border-primary/20 ring-1 ring-primary/20" 
                : "bg-white/40 hover:bg-white border-transparent hover:shadow-md"
            )}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105", scene.color)}>
                <scene.icon className="w-7 h-7" />
              </div>
              {scene.active && (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                  Active
                </span>
              )}
            </div>
            
            <h3 className="font-bold text-lg font-display mb-1">{scene.label}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {scene.description}
            </p>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full rounded-xl h-9 text-xs"
                onClick={(e) => { e.stopPropagation(); }}
              >
                Edit
              </Button>
              <Button 
                size="sm" 
                className={cn("w-full rounded-xl h-9 text-xs", scene.active ? "bg-red-50 text-red-600 hover:bg-red-100 border-red-100" : "")}
                onClick={(e) => {
                  e.stopPropagation();
                  activateScene(scene.id);
                }}
              >
                {scene.active ? "Stop" : "Activate"}
              </Button>
            </div>
          </div>
        ))}

        {/* Create New Card */}
        <button 
          onClick={() => setIsDialogOpen(true)}
          className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-6 text-gray-400 hover:text-primary hover:border-primary hover:bg-white/50 transition-all gap-3 min-h-[240px]"
        >
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <Plus className="w-7 h-7" />
          </div>
          <span className="font-medium">Create New Scene</span>
        </button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none bg-white/90 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold">New Scene</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Define a name and description for your new automation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="ml-1 text-sm font-medium">Scene Name</Label>
              <Input
                id="name"
                value={newScene.label}
                onChange={(e) => setNewScene({ ...newScene, label: e.target.value })}
                placeholder="e.g. Dinner Party"
                className="rounded-xl border-gray-100 bg-white/50 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="ml-1 text-sm font-medium">What should happen?</Label>
              <Input
                id="description"
                value={newScene.description}
                onChange={(e) => setNewScene({ ...newScene, description: e.target.value })}
                placeholder="e.g. Lights warm 20%, soft jazz on..."
                className="rounded-xl border-gray-100 bg-white/50 focus:bg-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleCreateScene}
              className="w-full rounded-xl h-12 text-base font-medium shadow-lg shadow-primary/10 transition-all"
            >
              Create Scene
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}