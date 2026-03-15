import React, { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { 
  Users, 
  Home, 
  Plus, 
  Search, 
  Activity, 
  Layers, 
  Box, 
  CheckCircle2,
  Info,
  AlertCircle,
  Loader2,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Settings2,
  Trash2,
  Power,
  Edit2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { AdminAnalytics, searchUsers, UserSearchResult, updateRoom, deleteRoom, updateDevice, deleteDevice } from "@/api/admin";
import { EmptyMedia } from "@/components/ui/empty";
import * as adminApi from "@/api/admin";

const API_BASE_URL = 'https://localhost:7244';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("users");
  const { toast } = useToast();

  // --- Search State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<adminApi.UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<adminApi.UserSearchResult | null>(null);

  // --- Form States ---
  const [newHouseName, setNewHouseName] = useState("");
  const [newHouseAddress, setNewHouseAddress] = useState("");
  const [newHouseLat, setNewHouseLat] = useState("");
  const [newHouseLong, setNewHouseLong] = useState("");
  const [selectedHouseId, setSelectedHouseId] = useState<string>("");
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomFloor, setNewRoomFloor] = useState("");
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newDeviceType, setNewDeviceType] = useState("Lamp");
  const [newDeviceMqtt, setNewDeviceMqtt] = useState("");

  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [editRoomName, setEditRoomName] = useState("");
  const [editRoomFloor, setEditRoomFloor] = useState("");

  const [editingDeviceId, setEditingDeviceId] = useState<number | null>(null);
  const [editDeviceName, setEditDeviceName] = useState("");
  const [editDeviceType, setEditDeviceType] = useState("");
  const [editDeviceMqtt, setEditDeviceMqtt] = useState("");

  // --- Rule States ---
  const [newRuleName, setNewRuleName] = useState("");
  const [triggerDeviceId, setTriggerDeviceId] = useState("");
  const [triggerType, setTriggerType] = useState("");
  const [actionDeviceId, setActionDeviceId] = useState("");
  const [actionType, setActionType] = useState("");

  // --- Queries ---
  const { data: hierarchy } = useQuery<any[]>({
    queryKey: [`${API_BASE_URL}/api/admin/hierarchy`],
  });

  const { data: logs } = useQuery<any[]>({
    queryKey: [`${API_BASE_URL}/api/admin/logs`],
    refetchInterval: 5000, 
  });

  const { data: rules } = useQuery<any[]>({
    queryKey: [`${API_BASE_URL}/api/admin/rules`],
  });

  // --- Search Effect ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        try {
          const results = await adminApi.searchUsers(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // --- Mutations ---
  const createHouseMutation = useMutation({
    mutationFn: adminApi.createHouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${API_BASE_URL}/api/admin/hierarchy`] });
      toast({ title: "Success", description: "House created and assigned successfully" });
      setNewHouseName(""); setNewHouseAddress(""); setNewHouseLat(""); setNewHouseLong(""); setSelectedUser(null); setSearchQuery("");
    }
  });

  // --- Rule Mutations ---
  const createRuleMutation = useMutation({
    mutationFn: (newRule: any) => adminApi.createRule(newRule), // Ensure this exists in admin.ts
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${API_BASE_URL}/api/admin/rules`] });
      toast({ title: "Success", description: "Automation rule created." });
      setNewRuleName(""); setTriggerDeviceId(""); setActionDeviceId("");
    }
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${API_BASE_URL}/api/admin/rules`] });
      toast({ title: "Deleted", description: "Rule removed successfully." });
    }
  });

  // --- Hierarchy Mutations ---
  const addRoomMutation = useMutation({
    mutationFn: (data: { name: string; floor: string; houseId: number }) => adminApi.addRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${API_BASE_URL}/api/admin/hierarchy`] });
      toast({ title: "Success", description: "Room added." });
      setNewRoomName(""); setNewRoomFloor("");
    }
  });

  const addDeviceMutation = useMutation({
    mutationFn: (data: { name: string; type: string; roomId: number; mqttTopic: string }) => adminApi.addDevice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${API_BASE_URL}/api/admin/hierarchy`] });
      toast({ title: "Success", description: "Device added." });
      setNewDeviceName(""); setNewDeviceMqtt("");
    }
  });

  // --- Update/Delete Mutations (Required by your Dialogs) ---
  const updateRoomMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => adminApi.updateRoom(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`${API_BASE_URL}/api/admin/hierarchy`] })
  });

  const deleteRoomMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteRoom(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`${API_BASE_URL}/api/admin/hierarchy`] })
  });

  const updateDeviceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => adminApi.updateDevice(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`${API_BASE_URL}/api/admin/hierarchy`] })
  });

  const deleteDeviceMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteDevice(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`${API_BASE_URL}/api/admin/hierarchy`] })
  });

  // --- Handlers ---
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Error", description: "Geolocation not supported by browser", variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNewHouseLat(pos.coords.latitude.toString());
        setNewHouseLong(pos.coords.longitude.toString());
        toast({ title: "Location Updated", description: `Coords: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` });
      },
      (err) => {
        toast({ title: "Location Error", description: err.message, variant: "destructive" });
      }
    );
  };

  const handleCreateHouse = () => {
    if (!selectedUser || !newHouseName || !newHouseAddress) {
      toast({ title: "Required", description: "Please fill all fields.", variant: "destructive" });
      return;
    }
    createHouseMutation.mutate({ 
      name: newHouseName, 
      address: newHouseAddress, 
      userId: selectedUser.id,
      latitude: newHouseLat ? parseFloat(newHouseLat) : undefined,
      longitude: newHouseLong ? parseFloat(newHouseLong) : undefined
    });
  };

  const handleSaveRule = () => {
    if (!newRuleName || !triggerDeviceId || !actionDeviceId) {
      toast({ title: "Incomplete", description: "Please define trigger and action.", variant: "destructive" });
      return;
    }
    createRuleMutation.mutate({
      name: newRuleName,
      triggerDeviceId: parseInt(triggerDeviceId),
      triggerType,
      actionDeviceId: parseInt(actionDeviceId),
      actionType,
      actionValue: "Triggered"
    });
  };

  const allDevices = hierarchy?.flatMap((h: any) => h.rooms.flatMap((r: any) => r.devices)) || [];
  return (
    <Shell>
      <header className="mb-8">
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">Admin Control Center</h1>
        <p className="text-muted-foreground text-lg">Manage users, build houses, and monitor system activity.</p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-white/50 backdrop-blur-md p-1 rounded-2xl border border-white/60 shadow-sm inline-flex flex-wrap h-auto">
          <TabsTrigger value="users" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Users className="w-4 h-4 mr-2" /> User Management
          </TabsTrigger>
          <TabsTrigger value="blueprint" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Layers className="w-4 h-4 mr-2" /> Blueprint Builder
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Activity className="w-4 h-4 mr-2" /> Activity Audit
          </TabsTrigger>
          <TabsTrigger value="automations" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Settings2 className="w-4 h-4 mr-2" /> Rule Engine
          </TabsTrigger>
        </TabsList>

        {/* --- USER MANAGEMENT --- */}
        <TabsContent value="users">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass-panel border-none shadow-lg bg-white/40 backdrop-blur-xl md:col-span-1">
              <CardHeader><CardTitle>Assign New House</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 relative">
                  <Label>Search User</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-9 bg-white/50" placeholder="Type name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />}
                  </div>
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white/90 backdrop-blur-lg border border-white/60 rounded-xl shadow-xl overflow-hidden">
                      {searchResults.map((user) => (
                        <button key={user.id} className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors flex flex-col" onClick={() => { setSelectedUser(user); setSearchQuery(user.email); setSearchResults([]); }}>
                          <span className="font-semibold text-sm">{user.username}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedUser && (
                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/20 mt-2">
                      <span className="text-xs font-bold">{selectedUser.email}</span>
                      <button className="text-[10px] text-destructive hover:underline" onClick={() => setSelectedUser(null)}>Cancel</button>
                    </div>
                  )}
                </div>
                <div className="space-y-2"><Label>House Name</Label><Input className="bg-white/50" placeholder="Smith Residence" value={newHouseName} onChange={(e) => setNewHouseName(e.target.value)} /></div>
                <div className="space-y-2"><Label>Address</Label><Input className="bg-white/50" placeholder="Street, City, Zip" value={newHouseAddress} onChange={(e) => setNewHouseAddress(e.target.value)} /></div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Latitude</Label>
                    <Input type="number" step="any" className="bg-white/50" placeholder="42.70" value={newHouseLat} onChange={(e) => setNewHouseLat(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Longitude</Label>
                    <Input type="number" step="any" className="bg-white/50" placeholder="23.32" value={newHouseLong} onChange={(e) => setNewHouseLong(e.target.value)} />
                  </div>
                </div>

                <Button variant="outline" className="w-full rounded-xl gap-2 text-xs" onClick={handleGetCurrentLocation}>
                  <Box className="w-3 h-3" /> Get Current Location
                </Button>

                <Button className="w-full rounded-xl mt-2" onClick={handleCreateHouse} disabled={createHouseMutation.isPending}>Create House</Button>
              </CardContent>
            </Card>
            <Card className="glass-panel border-none shadow-lg bg-white/40 backdrop-blur-xl md:col-span-2">
              <CardHeader><CardTitle>Active Deployments</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {hierarchy?.map((house: any) => (
                  <div key={house.id} className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-white/60">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 text-primary rounded-xl"><Home className="w-6 h-6" /></div>
                      <div><div className="font-bold text-gray-900">{house.name}</div><div className="text-sm text-muted-foreground">{house.userEmail}</div></div>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => { setSelectedHouseId(house.id.toString()); setActiveTab("blueprint"); }}>Manage</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- BLUEPRINT BUILDER --- */}
        <TabsContent value="blueprint">
           <Card className="glass-panel border-none shadow-lg bg-white/40 backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>System Blueprint</CardTitle>
                  <CardDescription>
                    {selectedHouseId 
                      ? `Managing ${hierarchy?.find(h => h.id.toString() === selectedHouseId)?.name}` 
                      : "Select a house from User Management to begin building."}
                  </CardDescription>
                </div>
                {selectedHouseId && (
                  <Button variant="outline" size="sm" onClick={() => setSelectedHouseId("")}>
                    View All Houses
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className={cn(
                  "grid gap-8",
                  selectedHouseId ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"
                )}>
                {hierarchy?.filter((house: any) => !selectedHouseId || house.id.toString() === selectedHouseId).map((house: any) => (
                  <div key={house.id} className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                          <Home className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-xl">{house.name}</h3>
                          <p className="text-xs text-muted-foreground">{house.userEmail}</p>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="rounded-xl gap-2">
                            <Plus className="w-4 h-4" /> Add Room
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-panel bg-white/80 backdrop-blur-2xl rounded-[2rem]">
                          <DialogHeader><DialogTitle>Add Room to {house.name}</DialogTitle></DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2"><Label>Room Name</Label><Input value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} placeholder="e.g. Kitchen" /></div>
                            <div className="space-y-2">
                              <Label>Floor</Label>
                              <Select value={newRoomFloor} onValueChange={setNewRoomFloor}>
                                <SelectTrigger><SelectValue placeholder="Select Floor" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Basement">Basement</SelectItem>
                                  <SelectItem value="Ground Floor">Ground Floor</SelectItem>
                                  <SelectItem value="1st Floor">1st Floor</SelectItem>
                                  <SelectItem value="2nd Floor">2nd Floor</SelectItem>
                                  <SelectItem value="3rd Floor">3rd Floor</SelectItem>
                                  <SelectItem value="Attic">Attic</SelectItem>
                                  <SelectItem value="Outside">Outside</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter><Button className="w-full" onClick={() => addRoomMutation.mutate({ name: newRoomName, floor: newRoomFloor, houseId: house.id })}>Create Room</Button></DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className={cn(
                      "grid gap-6",
                      selectedHouseId ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                    )}>
                      {house.rooms.map((room: any) => (
                        <div key={room.id} className="p-6 bg-white/30 rounded-3xl border border-white/50 space-y-4 shadow-sm hover:shadow-md transition-shadow group/room">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <span className="font-bold text-lg flex items-center gap-2">
                                <Box className="w-5 h-5 text-blue-500" /> {room.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                                {room.floor}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover/room:opacity-100 transition-opacity">
                              <Dialog open={editingRoomId === room.id} onOpenChange={(open) => {
                                if (open) {
                                  setEditingRoomId(room.id);
                                  setEditRoomName(room.name);
                                  setEditRoomFloor(room.floor);
                                } else {
                                  setEditingRoomId(null);
                                }
                              }}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="size-8 rounded-full hover:bg-white"><Edit2 className="w-3.5 h-3.5" /></Button>
                                </DialogTrigger>
                                <DialogContent className="glass-panel bg-white/80 backdrop-blur-2xl rounded-[2rem]">
                                  <DialogHeader><DialogTitle>Edit Room: {room.name}</DialogTitle></DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2"><Label>Room Name</Label><Input value={editRoomName} onChange={(e) => setEditRoomName(e.target.value)} /></div>
                                    <div className="space-y-2">
                                      <Label>Floor</Label>
                                      <Select value={editRoomFloor} onValueChange={setEditRoomFloor}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Basement">Basement</SelectItem>
                                          <SelectItem value="Ground Floor">Ground Floor</SelectItem>
                                          <SelectItem value="1st Floor">1st Floor</SelectItem>
                                          <SelectItem value="2nd Floor">2nd Floor</SelectItem>
                                          <SelectItem value="3rd Floor">3rd Floor</SelectItem>
                                          <SelectItem value="Attic">Attic</SelectItem>
                                          <SelectItem value="Outside">Outside</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="destructive" className="mr-auto" onClick={() => { if(confirm("Delete this room?")) deleteRoomMutation.mutate(room.id); }}>Delete</Button>
                                    <Button onClick={() => updateRoomMutation.mutate({ id: room.id, data: { name: editRoomName, floor: editRoomFloor, houseId: house.id }})}>Save Changes</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <Dialog>
                                <DialogTrigger asChild><Button variant="outline" size="icon" className="size-9 rounded-full bg-white/50"><Plus className="w-4 h-4" /></Button></DialogTrigger>
                                <DialogContent className="glass-panel bg-white/80 backdrop-blur-2xl rounded-[2rem]">
                                  <DialogHeader><DialogTitle>Add Device to {room.name}</DialogTitle></DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2"><Label>Device Name</Label><Input value={newDeviceName} onChange={(e) => setNewDeviceName(e.target.value)} placeholder="e.g. Main Light" /></div>
                                    <div className="space-y-2">
                                      <Label>Type</Label>
                                      <Select value={newDeviceType} onValueChange={setNewDeviceType}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent><SelectItem value="Lamp">Lamp</SelectItem><SelectItem value="TemperatureSensor">Thermostat</SelectItem><SelectItem value="MotionSensor">Motion Sensor</SelectItem></SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>MQTT Topic</Label>
                                      <Input value={newDeviceMqtt} onChange={(e) => setNewDeviceMqtt(e.target.value)} placeholder="e.g. smart/livingroom/lamp" />
                                    </div>
                                  </div>
                                  <DialogFooter><Button className="w-full" onClick={() => addDeviceMutation.mutate({ name: newDeviceName, type: newDeviceType, roomId: room.id, mqttTopic: newDeviceMqtt })}>Add Device</Button></DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {room.devices.map((device: any) => (
                              <div key={device.id} className="flex items-center justify-between text-sm p-3 bg-white/50 rounded-xl border border-white/60 group/device">
                                <span className="font-medium">{device.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold uppercase text-gray-500">
                                    {device.type}
                                  </span>
                                  <div className="opacity-0 group-hover/device:opacity-100 transition-opacity flex items-center gap-1">
                                    <Dialog open={editingDeviceId === device.id} onOpenChange={(open) => {
                                      if (open) {
                                        setEditingDeviceId(device.id);
                                        setEditDeviceName(device.name);
                                        setEditDeviceType(device.type);
                                        setEditDeviceMqtt(device.mqttTopic || "");
                                      } else {
                                        setEditingDeviceId(null);
                                      }
                                    }}>
                                      <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="size-6 rounded-full hover:bg-white"><Edit2 className="w-2.5 h-3.5" /></Button>
                                      </DialogTrigger>
                                      <DialogContent className="glass-panel bg-white/80 backdrop-blur-2xl rounded-[2rem]">
                                        <DialogHeader><DialogTitle>Edit Device: {device.name}</DialogTitle></DialogHeader>
                                        <div className="space-y-4 py-4">
                                          <div className="space-y-2"><Label>Device Name</Label><Input value={editDeviceName} onChange={(e) => setEditDeviceName(e.target.value)} /></div>
                                          <div className="space-y-2">
                                            <Label>Type</Label>
                                            <Select value={editDeviceType} onValueChange={setEditDeviceType}>
                                              <SelectTrigger><SelectValue /></SelectTrigger>
                                              <SelectContent><SelectItem value="Lamp">Lamp</SelectItem><SelectItem value="TemperatureSensor">Thermostat</SelectItem><SelectItem value="MotionSensor">Motion Sensor</SelectItem></SelectContent>
                                            </Select>
                                          </div>
                                          <div className="space-y-2">
                                            <Label>MQTT Topic</Label>
                                            <Input value={editDeviceMqtt} onChange={(e) => setEditDeviceMqtt(e.target.value)} />
                                          </div>
                                        </div>
                                        <DialogFooter>
                                          <Button variant="destructive" className="mr-auto" onClick={() => { if(confirm("Delete this device?")) deleteDeviceMutation.mutate(device.id); }}>Delete</Button>
                                          <Button onClick={() => updateDeviceMutation.mutate({ id: device.id, data: { name: editDeviceName, type: editDeviceType, roomId: room.id, mqttTopic: editDeviceMqtt }})}>Save Changes</Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {room.devices.length === 0 && (
                              <p className="text-xs text-muted-foreground italic text-center py-4">No devices in this room.</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {selectedHouseId && hierarchy?.filter((house: any) => house.id.toString() === selectedHouseId).length === 0 && (
                  <div className="col-span-full py-20 text-center text-muted-foreground italic">
                    House not found or still loading...
                  </div>
                )}
                {!selectedHouseId && (!hierarchy || hierarchy.length === 0) && (
                  <div className="col-span-full py-20 text-center text-muted-foreground italic">
                    No active deployments found. Create a house in User Management first.
                  </div>
                )}
              </div></CardContent>
           </Card>
        </TabsContent>

        {/* --- ACTIVITY LOG --- */}
        <TabsContent value="activity">
           <Card className="glass-panel border-none shadow-lg bg-white/40 backdrop-blur-xl">
              <CardHeader><CardTitle>Global Activity Log</CardTitle></CardHeader>
              <CardContent><div className="space-y-2">
                {logs?.map((log: any) => (
                  <div key={log.id} className="flex items-center gap-4 p-3 hover:bg-white/40 transition-colors rounded-xl border-b border-white/20 last:border-0">
                    <div className={`p-2 rounded-lg ${log.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}><Info className="w-4 h-4" /></div>
                    <div className="flex-1"><div className="font-semibold text-sm text-gray-900">{log.event}</div><div className="text-xs text-muted-foreground">{log.houseName} • {log.userEmail}</div></div>
                    <div className="text-xs text-muted-foreground font-mono">{new Date(log.timestamp).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div></CardContent>
           </Card>
        </TabsContent>

        {/* --- AUTOMATIONS / RULE ENGINE --- */}
        <TabsContent value="automations">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="glass-panel border-none shadow-lg bg-white/40 backdrop-blur-xl lg:col-span-1">
              <CardHeader><CardTitle>Rule Builder</CardTitle><CardDescription>Define "If-This-Then-That" logic.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Rule Name</Label><Input value={newRuleName} onChange={e => setNewRuleName(e.target.value)} placeholder="e.g. Morning Routine" /></div>
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
                  <div className="text-[10px] font-bold text-primary uppercase">Trigger (IF)</div>
                  <Select value={triggerDeviceId} onValueChange={setTriggerDeviceId}><SelectTrigger><SelectValue placeholder="Select Source" /></SelectTrigger><SelectContent>
                    {allDevices.map((d: any) => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                  </SelectContent></Select>
                  <Select value={triggerType} onValueChange={setTriggerType}><SelectTrigger><SelectValue placeholder="Condition" /></SelectTrigger><SelectContent>
                    <SelectItem value="MotionDetected">Motion Detected</SelectItem><SelectItem value="TempAbove">Temp Above</SelectItem><SelectItem value="StateChange">Any Change</SelectItem>
                  </SelectContent></Select>
                </div>
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-4">
                  <div className="text-[10px] font-bold text-emerald-600 uppercase">Action (THEN)</div>
                  <Select value={actionDeviceId} onValueChange={setActionDeviceId}><SelectTrigger><SelectValue placeholder="Select Target" /></SelectTrigger><SelectContent>
                    {allDevices.map((d: any) => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                  </SelectContent></Select>
                  <Select value={actionType} onValueChange={setActionType}><SelectTrigger><SelectValue placeholder="Perform" /></SelectTrigger><SelectContent>
                    <SelectItem value="TurnOn">Turn ON</SelectItem><SelectItem value="TurnOff">Turn OFF</SelectItem>
                  </SelectContent></Select>
                </div>
                <Button className="w-full" onClick={handleSaveRule} disabled={createRuleMutation.isPending}><Plus className="w-4 h-4 mr-2" />Save Rule</Button>
              </CardContent>
            </Card>
            <Card className="glass-panel border-none shadow-lg bg-white/40 backdrop-blur-xl lg:col-span-2">
              <CardHeader><CardTitle>Active Rules</CardTitle></CardHeader>
              <CardContent><div className="space-y-4">
                {rules?.map((rule: any) => (
                  <div key={rule.id} className="flex items-center justify-between p-5 bg-white/60 rounded-[1.5rem] border border-white/80 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="size-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center"><Power className="w-6 h-6" /></div>
                      <div><div className="font-bold text-gray-900">{rule.name}</div><div className="text-xs text-muted-foreground">IF <span className="text-primary">{rule.triggerDeviceName}</span> triggered THEN <span className="text-emerald-600">{rule.actionType} {rule.actionDeviceName}</span></div></div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteRuleMutation.mutate(rule.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
                {(!rules || rules.length === 0) && <div className="text-center py-20 text-muted-foreground italic">No automation rules created yet.</div>}
              </div></CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </Shell>
  );
}
