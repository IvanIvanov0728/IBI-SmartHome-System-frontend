import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { queryClient, apiRequest, getQueryFn } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { API_BASE_URL } from "@/lib/api-config";

type User = {
  id: string;
  username: string;
  email: string;
  role?: string;
};

type AuthContextType = {
  user: User | null | undefined;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, any>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, any>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: [`${API_BASE_URL}/api/Auth/status`],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/Auth/status`, { credentials: "include" });
        if (res.status === 401) return null;
        if (!res.ok) throw new Error("Failed to fetch Auth status");
        const data = await res.json();
        
        if (data.isAuthenticated) {
          const roleClaim = data.claims?.find((c: any) => c.type.includes("role"))?.value || "User";
          const emailClaim = data.claims?.find((c: any) => c.type.includes("emailaddress"))?.value || data.username;
          return { id: data.username, username: data.username, email: emailClaim, role: roleClaim };
        }
        return null;
      } catch (e) {
        return null;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      await apiRequest("POST", `${API_BASE_URL}/api/Auth/login`, credentials);
      // After login, we need to fetch status to get user info
      const statusRes = await fetch(`${API_BASE_URL}/api/Auth/status`, { credentials: "include" });
      const data = await statusRes.json();
      const roleClaim = data.claims?.find((c: any) => c.type.includes("role"))?.value || "User";
      const emailClaim = data.claims?.find((c: any) => c.type.includes("emailaddress"))?.value || data.username;
      return { id: data.username, username: data.username, email: emailClaim, role: roleClaim };
    },
    onSuccess: (user) => {
      queryClient.setQueryData([`${API_BASE_URL}/api/Auth/status`], user);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: any) => {
      await apiRequest("POST", `${API_BASE_URL}/api/Auth/register`, credentials);
      const statusRes = await fetch(`${API_BASE_URL}/api/Auth/status`, { credentials: "include" });
      const data = await statusRes.json();
      const roleClaim = data.claims?.find((c: any) => c.type.includes("role"))?.value || "User";
      const emailClaim = data.claims?.find((c: any) => c.type.includes("emailaddress"))?.value || data.username;
      return { id: data.username, username: data.username, email: emailClaim, role: roleClaim };
    },
    onSuccess: (user) => {
      queryClient.setQueryData([`${API_BASE_URL}/api/Auth/status`], user);
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `${API_BASE_URL}/api/Auth/logout`);
    },
    onSuccess: () => {
      queryClient.setQueryData([`${API_BASE_URL}/api/Auth/status`], null);
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
