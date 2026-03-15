import React from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Lamp, Moon, Sun } from "lucide-react";

interface LightControlProps {
  name: string;
  isOn: boolean;
  brightness: number;
  onToggle: (val: boolean) => void;
  onBrightnessChange: (val: number[]) => void;
  className?: string;
}

export function LightControl({ 
  name,
  isOn, 
  brightness, 
  onToggle, 
  onBrightnessChange,
  className 
}: LightControlProps) {
  return (
    <div className={cn("glass-card p-5 rounded-2xl transition-all duration-300", 
      isOn ? "bg-white/80 border-white/60 shadow-md" : "opacity-80",
      className
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300",
            isOn ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-400"
          )}>
            <Lamp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-medium font-display leading-none mb-1">{name}</h4>

            <span className="text-xs text-muted-foreground">{isOn ? `${brightness}% Brightness` : "Off"}</span>
          </div>
        </div>
        <Switch checked={isOn} onCheckedChange={onToggle} />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <Moon className="w-3 h-3" />
          <Sun className="w-3 h-3" />
        </div>
        <Slider 
          value={[brightness]} 
          max={100} 
          step={1} 
          onValueChange={onBrightnessChange}
          disabled={!isOn}
          className={cn("transition-opacity", !isOn && "opacity-50 pointer-events-none")}
        />
      </div>
    </div>
  );
}