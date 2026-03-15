import React, { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { Thermostat } from "@/components/widgets/Thermostat";
import { Calendar, Clock, Droplets, Wind, Zap, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { 
  getClimateSchedule, 
  deleteClimateScheduleEntry, 
  saveClimateScheduleEntry, 
  ClimateSchedule 
} from "@/api/climate";

// --- Configuration Constants for Dropdowns ---
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MODES = ["Heat", "Cool", "Eco", "Auto", "Fan Only"];
// Generates times in 30-minute increments
const TIMES = Array.from({ length: 48 }).map((_, i) => {
  const hour = Math.floor(i / 2);
  const min = i % 2 === 0 ? "00" : "30";
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${min} ${ampm}`;
});
// Generates temperatures from 16°C to 30°C
const TEMPS = Array.from({ length: 15 }).map((_, i) => `${16 + i}°C`);

export default function ClimatePage() {
  const [schedule, setSchedule] = useState<ClimateSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentScheduleItem, setCurrentScheduleItem] = useState<ClimateSchedule | null>(null);

  const handleOpenModal = (item: ClimateSchedule | null = null) => {
    setCurrentScheduleItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentScheduleItem(null);
  };

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        const data = await getClimateSchedule();
        setSchedule(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchScheduleData();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteClimateScheduleEntry(id);
      setSchedule(schedule.filter((item) => item.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unknown error occurred");
    }
  };

  return (
    <Shell>
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900">Climate Control</h1>
        <p className="text-muted-foreground">Perfect temperature, everywhere.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Thermostat */}
        <div className="lg:col-span-5 space-y-6">
          <Thermostat className="h-[500px]" />
          <div className="grid grid-cols-2 gap-4">
             <div className="glass-panel p-4 rounded-2xl flex items-center gap-3">
               <div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><Droplets className="w-5 h-5" /></div>
               <div>
                 <div className="text-sm text-muted-foreground">Humidity</div>
                 <div className="text-xl font-semibold">45%</div>
               </div>
             </div>
             <div className="glass-panel p-4 rounded-2xl flex items-center gap-3">
               <div className="p-3 bg-green-50 text-green-500 rounded-xl"><Wind className="w-5 h-5" /></div>
               <div>
                 <div className="text-sm text-muted-foreground">Air Quality</div>
                 <div className="text-xl font-semibold">Good</div>
               </div>
             </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 rounded-3xl">
             <div className="flex items-center justify-between mb-6">
               <h3 className="font-semibold text-lg font-display">Weekly Schedule</h3>
               <button onClick={() => handleOpenModal()} className="text-sm text-primary font-medium">Add New</button>
             </div>
             
             <div className="space-y-4">
                {loading && <p>Loading schedule...</p>}
                {error && <p className="text-red-500">Error: {error}</p>}
                {schedule.map((item) => (
                 <div key={item.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                   <div className="flex items-center gap-4">
                     <div className="p-2 bg-gray-100 rounded-lg text-gray-500"><Clock className="w-4 h-4" /></div>
                     <div>
                       <div className="font-medium">{item.day}</div>
                       <div className="text-xs text-muted-foreground">{item.time}</div>
                     </div>
                   </div>
                   <div className="flex items-center gap-4">
                     <span className="text-lg font-bold">{item.temp}</span>
                     <span className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600">{item.mode}</span>
                     <button onClick={() => handleOpenModal(item)} className="text-sm text-primary font-medium ml-2">Edit</button>
                     <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500"><X size={16} /></button>
                   </div>
                 </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* --- MODAL WITH DROPDOWNS --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
            <h2 className="text-2xl font-display font-bold mb-6">
              {currentScheduleItem ? "Edit Schedule" : "New Entry"}
            </h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const entry = {
                id: currentScheduleItem?.id || 0,
                day: formData.get("day") as string,
                time: formData.get("time") as string,
                temp: formData.get("temp") as string,
                mode: formData.get("mode") as string,
              };

              try {
                await saveClimateScheduleEntry(entry);

                // Refresh logic
                const updatedData = await getClimateSchedule();
                setSchedule(updatedData);
                handleCloseModal();
              } catch (e) {
                setError("Failed to save entry");
              }
            }}>
              
              <div className="space-y-4 mb-8">
                {/* Day Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                  <select 
                    name="day" 
                    defaultValue={currentScheduleItem?.day || "Monday"}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                  </select>
                </div>

                {/* Time Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <select 
                    name="time" 
                    defaultValue={currentScheduleItem?.time || "8:00 AM"}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Temp Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Temp</label>
                    <select 
                      name="temp" 
                      defaultValue={currentScheduleItem?.temp || "21°C"}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {TEMPS.map(temp => <option key={temp} value={temp}>{temp}</option>)}
                    </select>
                  </div>

                  {/* Mode Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">System Mode</label>
                    <select 
                      name="mode" 
                      defaultValue={currentScheduleItem?.mode || "Heat"}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {MODES.map(mode => <option key={mode} value={mode}>{mode}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-5 py-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                  {currentScheduleItem ? "Update Schedule" : "Create Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}