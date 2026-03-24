import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from "@/lib/api-config";

export type DeviceUpdate = {
  deviceId: number;
  type: 'Temperature' | 'Motion' | 'Light';
  value: any;
  humidity?: number;
  roomName?: string;
};

type MessageHandler = (data: DeviceUpdate) => void;

class SignalRService {
  private connection: signalR.HubConnection;
  private handlers: Set<MessageHandler> = new Set();
  private static instance: SignalRService;

  private constructor() {
    const hubUrl = API_BASE_URL + '/smartHomeHub';
    
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        withCredentials: true
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on("DeviceUpdated", (data: DeviceUpdate) => {
      this.handlers.forEach(handler => handler(data));
    });

    this.start();
  }

  public static getInstance(): SignalRService {
    if (!SignalRService.instance) {
      SignalRService.instance = new SignalRService();
    }
    return SignalRService.instance;
  }

  private async start() {
    try {
      if (this.connection.state === signalR.HubConnectionState.Disconnected) {
        await this.connection.start();
        console.log("SignalR Connected.");
      }
    } catch (err) {
      console.error("SignalR Connection Error: ", err);
      setTimeout(() => this.start(), 5000);
    }
  }

  public subscribe(handler: MessageHandler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }
}

export function useSignalR(onUpdate?: MessageHandler) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const service = SignalRService.getInstance();
    
    const unsubscribe = service.subscribe((data) => {
      if (onUpdate) onUpdate(data);
    });

    return () => {
      unsubscribe();
    };
  }, [onUpdate]);

  return { isConnected };
}
