import React, { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { Zap, TrendingDown, Battery, Leaf, DollarSign, Sun, Globe, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Button } from "@/components/ui/button";
import solarBg from "@assets/generated_images/minimalist_solar_panels_on_a_modern_roof.png";
import { getEnergyData, EnergyData } from "@/api/energy";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function EnergyPage() {
  const [energyData, setEnergyData] = useState<EnergyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getEnergyData();
        setEnergyData(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground animate-pulse">Analyzing power grid...</p>
          </div>
        </div>
      </Shell>
    );
  }

  if (error || !energyData) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-4">
             <p className="text-destructive font-medium">Unable to load energy metrics</p>
             <p className="text-muted-foreground text-sm">{error || "Data structure is empty"}</p>
             <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
          </div>
        </div>
      </Shell>
    );
  }

  const weeklyData = energyData.weeklyData || [];
  const hourlyData = energyData.hourlyData || [];
  const roomData = energyData.roomData || [];
  const environmentalImpact = energyData.environmentalImpact || { co2Offset: 0, treesSaved: 0 };
  const batteryStorage = energyData.batteryStorage || { percentage: 0, estimatedTimeRemaining: "N/A" };

  // Calculated values
  const totalWeeklyUsage = weeklyData.reduce((acc, curr) => acc + curr.usage, 0);
  const totalWeeklySolar = weeklyData.reduce((acc, curr) => acc + curr.solar, 0);
  const avgCostPerKwh = 0.15; // Example cost
  const estimatedCostToday = (weeklyData[weeklyData.length - 1]?.usage || 0) * avgCostPerKwh;
  const estimatedMonthlyBill = totalWeeklyUsage * 4 * avgCostPerKwh;

  return (
    <Shell>
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Energy Intelligence</h1>
            <p className="text-muted-foreground">Smart monitoring and optimization insights</p>
          </div>
          <div className="flex gap-3">
            <Button className="rounded-2xl gap-2 bg-primary px-6 h-12 shadow-lg shadow-primary/20">
              <Zap className="w-4 h-4" /> Power optimization
            </Button>
          </div>
        </div>
      </header>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-[2rem] border border-white/40 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-orange-500">
            <div className="p-2 bg-orange-100 rounded-xl"><Zap className="w-5 h-5" /></div>
            <span className="font-bold text-sm text-gray-600">Grid Usage</span>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-display font-bold text-gray-900">{weeklyData[weeklyData.length-1]?.usage || 0} <span className="text-sm font-normal text-muted-foreground">kWh</span></div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-emerald-500" /> 12% vs yesterday
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-[2rem] border border-white/40 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-emerald-500">
            <div className="p-2 bg-emerald-100 rounded-xl"><Sun className="w-5 h-5" /></div>
            <span className="font-bold text-sm text-gray-600">Solar Gain</span>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-display font-bold text-gray-900">{weeklyData[weeklyData.length-1]?.solar || 0} <span className="text-sm font-normal text-muted-foreground">kWh</span></div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Sun className="w-3 h-3 text-orange-400" /> Peak production at 1:42 PM
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-[2rem] border border-white/40 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-blue-500">
            <div className="p-2 bg-blue-100 rounded-xl"><DollarSign className="w-5 h-5" /></div>
            <span className="font-bold text-sm text-gray-600">Estimated Cost</span>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-display font-bold text-gray-900">${estimatedCostToday.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">
              Est. monthly: <span className="font-bold text-gray-700">${estimatedMonthlyBill.toFixed(0)}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-[2rem] border border-white/40 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-purple-500">
            <div className="p-2 bg-purple-100 rounded-xl"><Battery className="w-5 h-5" /></div>
            <span className="font-bold text-sm text-gray-600">Battery</span>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-display font-bold text-gray-900">{batteryStorage.percentage}%</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {batteryStorage.estimatedTimeRemaining} discharge time
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Main Chart Section */}
        <div className="lg:col-span-8 glass-panel p-8 rounded-[2.5rem] border border-white/20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold font-display">Consumption Analytics</h3>
              <p className="text-sm text-muted-foreground">Historical power distribution</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Usage</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Solar</span>
              </div>
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -25, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="usage" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} barSize={36} />
                <Bar dataKey="solar" fill="#34d399" radius={[8, 8, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Smart Insights Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-8 rounded-[2.5rem] bg-indigo-50 border-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-full -mr-16 -mt-16 blur-2xl" />
            <h3 className="text-xl font-bold font-display mb-6 flex items-center gap-2 text-indigo-900">
              <Lightbulb className="w-6 h-6 text-orange-400" /> Smart Tips
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-medium leading-relaxed text-indigo-800/80">
                  Your <span className="underline decoration-orange-400 underline-offset-4 font-bold text-indigo-900">Kitchen</span> usage is 15% higher than usual.
                </p>
                <Button variant="ghost" size="sm" className="bg-white/50 hover:bg-white text-[10px] font-bold uppercase py-0 h-7 rounded-full text-indigo-600">
                  Investigate
                </Button>
              </div>
              <div className="h-px bg-indigo-200/50 w-full" />
              <div className="space-y-2 text-indigo-800/80">
                <p className="text-sm font-medium leading-relaxed">
                  Perfect conditions for <span className="text-emerald-600 font-bold">Solar charging</span>. Expect full battery by 3:00 PM.
                </p>
              </div>
              <div className="h-px bg-indigo-200/50 w-full" />
              <div className="flex items-center gap-4 pt-2">
                <div className="flex-1">
                  <div className="text-xs text-indigo-600 uppercase font-bold tracking-widest mb-1">Weekly Saver</div>
                  <div className="text-2xl font-bold font-display text-emerald-600">-$12.40</div>
                </div>
                <div className="size-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <TrendingDown className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage by Room Slider */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6 px-2">
          <div>
            <h3 className="text-xl font-bold font-display text-gray-900">Consumption by Location</h3>
            <p className="text-xs text-muted-foreground">Energy distribution across your home</p>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground rounded-full hover:bg-gray-100/50">View detailed breakdown</Button>
        </div>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-6 pb-6 px-2">
            {roomData.map((item, i) => (
              <div key={i} className="w-72 p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold font-display text-gray-900 text-lg">{item.room}</span>
                  <div className="p-2 rounded-xl bg-gray-50 text-gray-400 group-hover:text-primary transition-colors">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="text-2xl font-bold font-display text-gray-900">{item.usage}</div>
                    <div className="text-xs font-bold text-muted-foreground">{item.percent}%</div>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ 
                        width: `${item.percent}%`,
                        backgroundColor: item.color.includes('blue') ? '#60a5fa' : 
                                         item.color.includes('orange') ? '#fb923c' :
                                         item.color.includes('purple') ? '#c084fc' :
                                         item.color.includes('green') ? '#4ade80' :
                                         item.color.includes('red') ? '#f87171' : '#94a3b8'
                      }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Real-time Hero Load Chart */}
      <div className="glass-panel p-8 rounded-[2.5rem] border border-white/20 mb-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold font-display">Real-time Network Load</h3>
            <p className="text-sm text-muted-foreground">The "heartbeat" of your home's electricity — monitoring instantaneous power demand</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 rounded-full">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">System Live</span>
          </div>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsageFinal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorUsageFinal)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Decorative Solar Background Section */}
      <section className="relative overflow-hidden rounded-[3rem] h-[320px] group shadow-2xl">
        <img
          src={solarBg}
          alt="Solar Panels"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent p-12 flex flex-col justify-center text-white">
          <div className="max-w-md space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 bg-emerald-500 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/40">
                Peak Sustainability
              </span>
            </div>
            <h2 className="text-5xl font-display font-bold">Solar Harvest</h2>
            <p className="text-white/80 text-xl font-light leading-relaxed">
              Your home generated enough energy today to power <span className="text-emerald-400 font-bold">12 electric vehicles</span> for 50km.
            </p>
            <div className="pt-4">
              <Button className="bg-white text-black hover:bg-white/90 rounded-2xl px-8 h-12 font-bold transition-transform active:scale-95">
                View detailed history
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
