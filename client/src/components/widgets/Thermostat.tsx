import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, Fan, Snowflake, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { setTargetTemperature, getClimateData, ClimateData } from "../../api/climate";

interface ThermostatProps {
  className?: string;
}

export function Thermostat({ className }: ThermostatProps) {
  const [temp, setTemp] = useState(0);
  const [mode, setMode] = useState<"cool" | "heat" | "fan">("cool");
  const [data, setData] = useState<ClimateData | null>(null);
  const [loading, setLoading] = useState(true);
  const MIN_TEMP = 16;
  const MAX_TEMP = 32;
  const RANGE = MAX_TEMP - MIN_TEMP;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getClimateData();
        setData(result);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (data?.targetTemperature) {
      setTemp(data.targetTemperature);
    }
  }, [data]);


  const updateTemperature = async (newTemp: number) => {
    const Temp = Math.max(MIN_TEMP, Math.min(MAX_TEMP, newTemp));
    setTemp(Temp);
    await setTargetTemperature(Temp)
  };

  const increment = () => updateTemperature(temp + 1);
  const decrement = () => updateTemperature(temp - 1);
  const progress = ((temp - MIN_TEMP) / RANGE) * 283;

  // Determine colors based on mode
  const modeColors = {
    cool: "from-blue-50 to-blue-100 text-blue-600 border-blue-200",
    heat: "from-orange-50 to-orange-100 text-orange-600 border-orange-200",
    fan: "from-gray-50 to-gray-100 text-gray-600 border-gray-200",
  };

  const ringColors = {
    cool: "stroke-blue-500",
    heat: "stroke-orange-500",
    fan: "stroke-gray-400",
  };

  return (
    <div
      className={cn(
        "glass-panel p-6 rounded-3xl flex flex-col items-center justify-between min-h-[320px]",
        className,
      )}
    >
      <div className="w-full flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg font-display">Climate</h3>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-full">
          <button
            onClick={() => setMode("cool")}
            className={cn(
              "p-2 rounded-full transition-all",
              mode === "cool"
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-400 hover:text-gray-600",
            )}
          >
            <Snowflake className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMode("heat")}
            className={cn(
              "p-2 rounded-full transition-all",
              mode === "heat"
                ? "bg-white shadow-sm text-orange-600"
                : "text-gray-400 hover:text-gray-600",
            )}
          >
            <Flame className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMode("fan")}
            className={cn(
              "p-2 rounded-full transition-all",
              mode === "fan"
                ? "bg-white shadow-sm text-gray-600"
                : "text-gray-400 hover:text-gray-600",
            )}
          >
            <Fan className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative w-48 h-48 flex items-center justify-center my-4">
        {/* Decorative Ring Background */}
        <svg
          className="absolute w-full h-full -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#f0f0f0"
            strokeWidth="6"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            className={ringColors[mode]}
            strokeWidth="6"
            strokeDasharray="283"
            strokeDashoffset={283 - progress}
            strokeLinecap="round"
            initial={{ strokeDashoffset: 283 }}
            animate={{ strokeDashoffset: 283 - progress }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
          />
        </svg>

        {/* Center Content */}
        <div className="relative z-10 flex flex-col items-center">
          <span className="text-sm text-muted-foreground uppercase tracking-widest text-[10px] font-medium mb-1">
            Target
          </span>
          <div className="text-5xl font-display font-medium tracking-tighter tabular-nums">
            {/* {temp}° */}
            {temp ?? "--"}°C
          </div>
          <span className="text-sm text-muted-foreground mt-1">
            Indoor: {data?.currentTemperature ?? "--"}°C
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6 w-full justify-center mt-4">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-gray-200 hover:bg-gray-50 hover:border-gray-300"
          onClick={decrement}
        >
          <Minus className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-gray-200 hover:bg-gray-50 hover:border-gray-300"
          onClick={increment}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
