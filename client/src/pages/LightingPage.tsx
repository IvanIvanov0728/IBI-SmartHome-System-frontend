import React, { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { LightControl } from "@/components/widgets/LightControl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLightsData, LightData, setLight, setBrightness } from "@/api/lighting";

export default function LightingPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LightData | null>(null);
  const [lights, setLights] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getLightsData();
        // Use the logical OR (|| []) to ensure lights is NEVER null
        setData(result);
        setLights(result?.lights || []); 
      } catch (error) {
        console.error("Lighting fetch error:", error);
        setLights([]); // Reset to empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleLight = async (id: number) => {
    const light = lights.find((l) => l.id === id);
    if (!light) return;
    const newState = !light.isOn;

    setLights((prev) => prev.map((l) => (l.id === id ? { ...l, isOn: newState } : l)));

    try {
      await setLight(id, newState);
    } catch (error) {
      setLights((prev) => prev.map((l) => (l.id === id ? { ...l, isOn: !newState } : l)));
    }
  };

  const handleBrightnessChange = async (id: number, value: number) => {
    setLights((prev) => prev.map((l) => (l.id === id ? { ...l, brightness: value } : l)));
    try {
      await setBrightness(id, value);
    } catch (error) {
      console.error(error);
    }
  };

  const groupedRooms = React.useMemo(() => {
    if (!data?.rooms) return {};
    return data.rooms.reduce((acc: any, room: any) => {
      if (!acc[room.floor]) acc[room.floor] = [];
      acc[room.floor].push(room);
      return acc;
    }, {});
  }, [data]);

  if (loading) return <div>Loading...</div>;

  return (
    <Shell>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Lighting Control</h1>
          <p className="text-muted-foreground">Manage your home's ambience</p>
        </div>
        <Button className="rounded-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Add Device
        </Button>
      </header>

      {/* PRIMARY TABS (FLOORS) */}
      <Tabs defaultValue="All" className="space-y-6">
        <TabsList className="bg-transparent p-0 gap-2 border-b border-gray-200 w-full justify-start h-auto rounded-none flex-wrap">
          <TabsTrigger 
            value="All" 
            className="data-[state=active]:border-primary border-b-2 border-transparent rounded-none bg-transparent px-4 pb-3"
          >
            All Floors
          </TabsTrigger>
          {Object.keys(groupedRooms).map((floor) => (
            <TabsTrigger 
              key={floor} 
              value={floor}
              className="data-[state=active]:border-primary border-b-2 border-transparent rounded-none bg-transparent px-4 pb-3"
            >
              {floor} Floor
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ALL FLOORS CONTENT */}
        <TabsContent value="All">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Notice the ?. before .map */}
            {lights?.map((light) => (
              <LightControl
                key={light.id}
                {...light}
                onToggle={() => toggleLight(light.id)}
                onBrightnessChange={(val: number) => handleBrightnessChange(light.id, val)}
              />
            ))}
          </div>
        </TabsContent>

        {/* SPECIFIC FLOOR CONTENT WITH NESTED ROOM TABS */}
        {Object.entries(groupedRooms).map(([floor, rooms]: any) => (
          <TabsContent key={floor} value={floor} className="space-y-6 outline-none">
            
            <Tabs defaultValue="all-rooms" className="w-full">
              {/* SECONDARY TAB BAR (ROOMS) */}
              <TabsList className="bg-gray-100/50 p-1 mb-6 inline-flex h-10 items-center justify-center rounded-lg text-muted-foreground">
                <TabsTrigger value="all-rooms" className="rounded-md px-4">All Rooms</TabsTrigger>
                {rooms.map((room: any) => (
                  <TabsTrigger key={room.id} value={room.id.toString()} className="rounded-md px-4">
                    {room.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* NESTED CONTENT: ALL ROOMS ON THIS FLOOR */}
              <TabsContent value="all-rooms" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lights
                    .filter((l) => rooms.some((r: any) => r.id === l.roomId))
                    .map((light) => (
                      <LightControl
                        key={light.id}
                        {...light}
                        onToggle={() => toggleLight(light.id)}
                        onBrightnessChange={(val: number) => handleBrightnessChange(light.id, val)}
                      />
                    ))}
                </div>
              </TabsContent>

              {/* NESTED CONTENT: SPECIFIC ROOM */}
              {rooms.map((room: any) => (
                <TabsContent key={room.id} value={room.id.toString()} className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lights?.filter((l) => l.roomId === room.id).length > 0 ? (
                      lights
                        .filter((l) => l.roomId === room.id)
                        .map((light) => (
                          <LightControl key={light.id} {...light} />
                        ))
                    ) : (
                      <p className="col-span-full text-center text-muted-foreground py-10">
                        No lights found in this room.
                      </p>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>
        ))}
      </Tabs>
    </Shell>
  );
}