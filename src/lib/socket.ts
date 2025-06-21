import { User } from "@/models/User";

export class SocketClient {
  private socket: WebSocket | null = null;
  private token: string;
  private serverUrl: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number = 2000; // Start with 2 seconds
  private messageQueue: any[] = [];
  private eventHandlers: Map<string, Array<(data: any) => void>> = new Map();

  constructor(token: string, serverUrl?: string) {
    this.token = token;
    this.serverUrl = serverUrl || this.getSocketUrl();
  }

  private getSocketUrl(): string {
    // Default to localhost with port 3002 in development or parse from environment
    const baseUrl = process.env.SOCKET_URL || 
      `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:3002`;
    return `${baseUrl}/ws`;
  }

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    try {
      const url = new URL(this.serverUrl);
      url.searchParams.append('token', this.token);
      
      this.socket = new WebSocket(url.toString());
      
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private handleOpen() {
    console.log('WebSocket connection established');
    this.reconnectAttempts = 0;
    this.reconnectTimeout = 2000; // Reset reconnect timeout
    
    // Send any queued messages
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.sendRaw(message);
    }
    
    this.emit('connected', null);
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      const eventType = data.type;
      const payload = data.payload;
      
      this.emit(eventType, payload);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent) {
    if (!event.wasClean) {
      console.warn(`WebSocket connection closed unexpectedly: ${event.code}`);
      this.attemptReconnect();
    } else {
      console.log('WebSocket connection closed cleanly');
    }
    
    this.emit('disconnect', { code: event.code, reason: event.reason });
  }

  private handleError(error: Event) {
    console.error('Socket error:', error ? error : 'Unknown socket error');
    this.emit('error', error);
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Maximum reconnection attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const timeout = this.reconnectTimeout * Math.pow(1.5, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${timeout / 1000} seconds...`);
    
    setTimeout(() => {
      this.connect();
    }, timeout);
  }

  send(eventType: string, payload: any) {
    const message = JSON.stringify({
      type: eventType,
      payload
    });
    
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.messageQueue.push(message);
      return false;
    }
    
    return this.sendRaw(message);
  }

  private sendRaw(message: string): boolean {
    try {
      this.socket?.send(message);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  on(eventType: string, callback: (data: any) => void) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    
    this.eventHandlers.get(eventType)?.push(callback);
  }

  off(eventType: string, callback?: (data: any) => void) {
    if (!callback) {
      // Remove all handlers for this event
      this.eventHandlers.delete(eventType);
      return;
    }
    
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(callback);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(eventType: string, data: any) {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${eventType} event handler:`, error);
        }
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'User disconnected');
      this.socket = null;
    }
  }
}

export default SocketClient; 