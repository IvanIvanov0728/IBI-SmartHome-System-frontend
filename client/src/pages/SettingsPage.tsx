import React, { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { User, Bell, Smartphone, Wifi, Moon, Shield, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { getUserProfile, updateUserProfile, getUserSettings, updateUserSettings, UserProfile, UserSettings } from "@/api/settings";
import { useTheme } from "@/hooks/use-theme";

export default function SettingsPage() {
  const { logoutMutation } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [profileForm, setProfileForm] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: userProfile, isLoading: isLoadingProfile, error: errorProfile } = useQuery<UserProfile, Error>({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
  });

  useEffect(() => {
    if (userProfile) setProfileForm(userProfile);
  }, [userProfile]);

  const { data: userSettings, isLoading: isLoadingSettings, error: errorSettings } = useQuery<UserSettings, Error>({
    queryKey: ["userSettings"],
    queryFn: getUserSettings,
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast({ title: "Profile updated!" });
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: updateUserSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
      toast({ title: "Settings saved!" });
    }
  });

  const updateUserProfileMutation = useMutation({
    mutationFn: (profile: UserProfile) => updateUserProfile(profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast({ title: "Profile updated successfully!" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to update profile", description: err.message, variant: "destructive" });
    },
  });

  const updateUserSettingsMutation = useMutation({
    mutationFn: (settings: UserSettings) => updateUserSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
      toast({ title: "Settings updated successfully!" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to update settings", description: err.message, variant: "destructive" });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileForm) {
      updateProfileMutation.mutate(profileForm, {
        onSuccess: () => {
          setIsEditModalOpen(false);
        }
      });
    }
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (userProfile) {
      updateUserProfileMutation.mutate(userProfile);
    }
  };

  const handleNotificationChange = (checked: boolean) => {
    if (userSettings) {
      updateUserSettingsMutation.mutate({ ...userSettings, receiveNotifications: checked });
    }
  };

  const handleDarkModeChange = (checked: boolean) => {
    toast({ title: "Dark mode is currently unavailable." });
  };

  if (isLoadingProfile || isLoadingSettings) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Shell>
    );
  }

  if (errorProfile || errorSettings || !userProfile || !userSettings) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-destructive">Error loading settings: {errorProfile?.message || errorSettings?.message || "No data"}</p>
        </div>
      </Shell>
    );
  }

  if (isLoadingProfile || isLoadingSettings || !userSettings || !profileForm) {
    return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <Shell>
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900">Settings</h1>
        <p className="text-muted-foreground">Customize your experience</p>
      </header>

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Profile Section */}
        <section className="glass-panel p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center text-3xl font-bold text-primary shadow-inner">
              {userProfile.userName[0]?.toUpperCase()}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-1">{userProfile.userName}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <User className="w-4 h-4" /> {userProfile.userRole}
                </span>
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Bell className="w-4 h-4" /> {userProfile.email}
                </span>
              </div>
            </div>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl px-6">Edit Profile</Button>
              </DialogTrigger>
              <DialogContent className="glass-panel bg-white/80 backdrop-blur-2xl rounded-[2rem] border-none">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display font-bold">Edit Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleProfileSubmit} className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Display Name</Label>
                    <Input 
                      id="username"
                      value={profileForm?.userName || ""} 
                      onChange={(e) => setProfileForm(prev => prev ? {...prev, userName: e.target.value} : null)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email"
                      value={profileForm?.email || ""} 
                      onChange={(e) => setProfileForm(prev => prev ? {...prev, email: e.target.value} : null)}
                      className="rounded-xl"
                    />
                  </div>
                  <DialogFooter className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full rounded-xl h-12"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        {/* General Settings */}
        <section className="glass-panel rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-lg font-display">General</h3>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Bell className="w-5 h-5" /></div>
                <div>
                  <div className="font-medium">Notifications</div>
                  <div className="text-xs text-muted-foreground">Manage alerts & push notifications</div>
                </div>
              </div>
              <Switch 
                checked={userSettings.receiveNotifications} 
                onCheckedChange={handleNotificationChange}
                disabled={updateUserSettingsMutation.isPending}
              />
            </div>
            
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Moon className="w-5 h-5" /></div>
                <div>
                  <div className="font-medium">Dark Mode</div>
                  <div className="text-xs text-muted-foreground">Adjust system appearance</div>
                </div>
              </div>
              <Switch 
                checked={false} 
                onCheckedChange={handleDarkModeChange}
                disabled={true}
              />
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Smartphone className="w-5 h-5" /></div>
                <div>
                  <div className="font-medium">Connected Devices</div>
                  <div className="text-xs text-muted-foreground">12 Active Devices</div> {/* This should be dynamic */}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
          </div>
        </section>

        {/* System Settings */}
        <section className="glass-panel rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-lg font-display">System</h3>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Wifi className="w-5 h-5" /></div>
                <div>
                  <div className="font-medium">Network</div>
                  <div className="text-xs text-muted-foreground">Lumina_Home_5G</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-medium">Excellent</span>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </div>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Shield className="w-5 h-5" /></div>
                <div>
                  <div className="font-medium">Privacy & Security</div>
                  <div className="text-xs text-muted-foreground">2FA Enabled</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
          </div>
        </section>

        <div className="pt-4 flex flex-col gap-4">
          <Button variant="ghost" className="justify-start text-muted-foreground hover:text-foreground">
            <HelpCircle className="w-4 h-4 mr-2" /> Help & Support
          </Button>
          <Button variant="ghost" className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-4 h-4 mr-2" /> Log Out
          </Button>
        </div>
      </div>
    </Shell>
  );
}
