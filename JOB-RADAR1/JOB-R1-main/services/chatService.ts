
import { io, Socket } from "socket.io-client";

class ChatService {
  private socket: Socket | null = null;
  private currentRoom: string | null = null;

  connect() {
    if (this.socket?.connected) return;
    
    // In this environment, the server is on the same host/port
    this.socket = io({
      transports: ["websocket"]
    });

    this.socket.on("connect", () => {
      console.log("Chat connected to Pulse Server");
    });
  }

  joinRoom(roomId: string) {
    if (!this.socket) this.connect();
    this.currentRoom = roomId;
    this.socket?.emit("join-room", roomId);
  }

  sendMessage(roomId: string, message: string, senderId: string, senderName: string) {
    this.socket?.emit("send-message", {
      roomId,
      message,
      senderId,
      senderName,
      timestamp: new Date().toISOString()
    });
  }

  onMessage(callback: (data: any) => void) {
    this.socket?.on("new-message", callback);
  }

  sendPulse(location: { lat: number, lng: number }) {
    this.socket?.emit("pulse-rebound", location);
  }

  onRemotePulse(callback: (data: any) => void) {
    this.socket?.on("remote-pulse", callback);
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

export const chatService = new ChatService();
