import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';

type WebSocketContextType = {
  connected: boolean;
  sendMessage: (message: any) => void;
  messages: any[];
  addMessageListener: (callback: (message: any) => void) => () => void;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  // Remove auth dependency
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const messageListeners = useRef<((message: any) => void)[]>([]);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  // Simplified WebSocket connection without auth dependency
  const connect = useCallback(() => {
    if (socket) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
      
      // Removed auth for now
    };

    newSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setMessages(prev => [...prev, message]);
        
        // Notify all listeners
        messageListeners.current.forEach(listener => listener(message));
      } catch (error) {
        console.error('Failed to parse WebSocket message', error);
      }
    };

    newSocket.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
      setSocket(null);
      
      // Reconnect after delay
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error', error);
    };

    setSocket(newSocket);

    // Clean up on unmount
    return () => {
      newSocket.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, [socket]);
  
  // Add listener for messages
  const addMessageListener = useCallback((callback: (message: any) => void) => {
    messageListeners.current.push(callback);
    
    // Return function to remove listener
    return () => {
      messageListeners.current = messageListeners.current.filter(
        listener => listener !== callback
      );
    };
  }, []);

  // Connect when initialized
  useEffect(() => {
    if (!socket) {
      connect();
    }
    
    return () => {
      if (socket) {
        socket.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [socket, connect]);

  // Send message to the server
  const sendMessage = useCallback((message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected');
    }
  }, [socket]);

  return (
    <WebSocketContext.Provider value={{ connected, sendMessage, messages, addMessageListener }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  
  return context;
};
