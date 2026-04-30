import React, { useState } from "react";
import { Link } from "wouter";
import { Shell } from "@/components/layout/Shell";
import { NoHouseView } from "@/components/layout/NoHouseView";
import { Thermostat } from "@/components/widgets/Thermostat";
import { LightControl } from "@/components/widgets/LightControl";
import { QuickActions } from "@/components/widgets/QuickActions";
import { Cloud, Droplets, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import livingRoomBg from "@assets/generated_images/modern_minimalist_living_room_interior_with_soft_lighting.png";
import kitchenBg from "@assets/generated_images/modern_kitchen_island_with_minimalist_lighting.png";
import bedroomBg from "@assets/generated_images/minimalist_master_bedroom_with_soft_light.png";
import bathroomBg from "@assets/generated_images/bathroom.png";
import mudroomBg from "@assets/generated_images/mudroom.png";
import officeBg from "@assets/generated_images/office.png";
import outsideBg from "@assets/generated_images/outside.png";
import hallwayBg from "@assets/generated_images/hallway.png";
import { getDashboardData, DashboardData, DashboardLight } from "../api/dashboard";
import { setLight, setBrightness } from "@/api/lighting";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useSignalR, DeviceUpdate } from "@/hooks/use-signalr";
import { useCallback } from "react";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const ROOM_IMAGES = {
  living: livingRoomBg,
  kitchen: kitchenBg,
  bedroom: bedroomBg,
  mudroom: mudroomBg,
  office: officeBg,
  outside: outsideBg,
  hallway: hallwayBg,
  bathroom: bathroomBg,
  default: livingRoomBg
};

const getRoomImage = (roomName = "") => {
  const name = roomName.toLowerCase();
  if (name.includes("kitchen")) return ROOM_IMAGES.kitchen;
  if (name.includes("bedroom") || name.includes("sleeping") || name.includes("guest")) return ROOM_IMAGES.bedroom;
  if (name.includes("bathroom") || name.includes("restroom")) return ROOM_IMAGES.bathroom;
  if (name.includes("office") || name.includes("study")) return ROOM_IMAGES.office;
  if (name.includes("outdoor") || name.includes("garden") || name.includes("yard")) return ROOM_IMAGES.outside;
  if (name.includes("hallway") || name.includes("corridor")) return ROOM_IMAGES.hallway;
  if (name.includes("mudroom") || name.includes("laundry") || name.includes("garage") || name.includes("attic") || name.includes("basement")) return ROOM_IMAGES.mudroom;
  if (name.includes("living") || name.includes("lounge") || name.includes("dining")) return ROOM_IMAGES.living;
  return ROOM_IMAGES.default;
};

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const queryClient = useQueryClient();
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    queryFn: getDashboardData,
    enabled: !!user,
  });

  const handleSignalRUpdate = useCallback((update: DeviceUpdate) => {
    queryClient.setQueryData<DashboardData>(["/api/dashboard"], (old) => {
      if (!old) return old;
      
      const newData = { ...old };

      if (update.type === "Temperature") {
        newData.weatherOutTemperature = update.value;
        if (update.humidity) newData.weatherOutHumidity = update.humidity;
      }

      if (update.type === "Motion") {
        newData.rooms = old.rooms.map(room => ({
          ...room,
          devices: room.devices.map(dev => 
            dev.id === update.deviceId ? { ...dev, isMotionDetected: update.value } : dev
          )
        }));
      }

      if (update.type === "Light") {
        newData.lights = old.lights.map(l => 
          l.id === update.deviceId ? { ...l, isOn: update.value } : l
        );
      }

      return newData;
    });
  }, [queryClient]);

  useSignalR(handleSignalRUpdate);

  if (isLoading) {
    return (
      <Shell>
        <LoadingScreen message="Зареждане на таблото..." />
      </Shell>
    );
  }

  if (!data || data.rooms.length === 0) {
    return <NoHouseView />;
  }

  const ROOMS = data.rooms;
  const activeRoom = ROOMS[activeRoomIndex];
  if (!activeRoom) return null;

  const nextRoom = () => setActiveRoomIndex((prev) => (prev + 1) % ROOMS.length);
  const prevRoom = () => setActiveRoomIndex((prev) => (prev - 1 + ROOMS.length) % ROOMS.length);

  const toggleLight = async (id: number) => {
    const light = data.lights.find((l) => l.id === id);
    if (!light) return;

    const newState = !light.isOn;

    // Optimistic update
    queryClient.setQueryData<DashboardData>(["/api/dashboard"], (old) => {
      if (!old) return old;
      return {
        ...old,
        lights: old.lights.map(l => l.id === id ? { ...l, isOn: newState } : l)
      };
    });

    try {
      await setLight(id, newState);
    } catch (error) {
      console.error("Toggle failed:", error);
      // Revert on failure
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    }
  };

  const handleBrightnessChange = async (id: number, value: number) => {
    const numericValue = Number(value);
    queryClient.setQueryData<DashboardData>(["/api/dashboard"], (old) => {
      if (!old) return old;
      return {
        ...old,
        lights: old.lights.map(l => l.id === id ? { ...l, brightness: numericValue } : l)
      };
    });

    try {
      await setBrightness(id, numericValue);
    } catch (error) {
      console.error("Brightness update failed:", error);
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    }
  };

  const filteredLights = data.lights.filter(
    (l) => Number(l.roomId) === Number(activeRoom.id)
  );

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <Shell>
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
            Welcome, {user?.username.split('@')[0] || 'User'}
          </h1>
          <p className="text-muted-foreground text-lg">{today}</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
            <Cloud className="w-5 h-5 text-gray-400" />
            <span className="font-medium">{data.weatherOutTemperature ?? "--"}°C</span>
            <span className="text-muted-foreground text-sm">{data.weatherOutDescription}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 mr-2">
            <Droplets className="w-5 h-5 text-blue-400" />
            <span className="font-medium">{data.weatherOutHumidity ?? "--"}%</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full text-muted-foreground hover:text-destructive transition-colors"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <section className="mb-10 relative overflow-hidden rounded-[2rem] aspect-[21/9] md:aspect-[24/9] group shadow-lg bg-gray-100">
        <img
          key={activeRoom.id}
          src={getRoomImage(activeRoom.name)}
          alt={activeRoom.name}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 animate-in fade-in zoom-in-95 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent p-8 flex flex-col justify-end text-white">
          <div className="max-w-md space-y-2 relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-md text-xs font-medium uppercase tracking-wider">
                Active Room
              </span>
            </div>
            <h2 className="text-3xl font-display font-bold">{activeRoom.name}</h2>
            <p className="text-white/80 font-light">{activeRoom.devices.length} devices active in this room</p>
          </div>
        </div>

        <div className="absolute inset-y-0 left-4 flex items-center">
          <button onClick={prevRoom} className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
        <div className="absolute inset-y-0 right-4 flex items-center">
          <button onClick={nextRoom} className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="absolute bottom-6 right-8 flex gap-2">
          {ROOMS.map((_, i) => (
            <div key={i} className={cn("h-1.5 rounded-full transition-all duration-300", i === activeRoomIndex ? "w-8 bg-white" : "w-2 bg-white/40")} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <section>
            <h3 className="text-xl font-display font-semibold mb-4">Quick Scenes</h3>
            <QuickActions />
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-display font-semibold">Lighting: {activeRoom.name}</h3>
              <Link href="/lighting">
                <button className="text-sm font-medium text-primary hover:underline">View All</button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLights.length > 0 ? (
                filteredLights.map((light) => (
                  <LightControl
                    key={light.id}
                    {...light}
                    onToggle={() => toggleLight(light.id)}
                    onBrightnessChange={(val: number) => handleBrightnessChange(light.id, val)}
                  />
                ))
              ) : (
                <div className="col-span-3 p-8 text-center glass-panel rounded-2xl text-muted-foreground italic">
                  No lights connected in this room.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Thermostat className="w-full" />
        </div>
      </div>
    </Shell>
  );
}
