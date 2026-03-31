import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import NotFound from "@/pages/not-found";
import AccessDenied from "@/pages/AccessDenied";
import Dashboard from "@/pages/Dashboard";
import LightingPage from "@/pages/LightingPage";
import ClimatePage from "@/pages/ClimatePage";
import SecurityPage from "@/pages/SecurityPage";
import SettingsPage from "@/pages/SettingsPage";
import EnergyPage from "@/pages/EnergyPage";
import AdminPage from "@/pages/AdminPage";
import LoginPage from "@/pages/auth/LoginPage";
import SignUpPage from "@/pages/auth/SignUpPage";

function ProtectedRoute({ component: Component, path }: { component: React.ComponentType, path: string }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Route path={path} component={Component} />;
}

function AdminProtectedRoute({ component: Component, path }: { component: React.ComponentType, path: string }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role?.toLocaleLowerCase() !== "admin") {
    return <Redirect to="/access-denied" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignUpPage} />
      <ProtectedRoute path="/lighting" component={LightingPage} />
      <ProtectedRoute path="/climate" component={ClimatePage} />
      <ProtectedRoute path="/security" component={SecurityPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/energy" component={EnergyPage} />
      <ProtectedRoute path="/access-denied" component={AccessDenied} />
      <AdminProtectedRoute path="/admin" component={AdminPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;