import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';
import axios from 'axios';

interface PongMessage {
  originalMessageId: string;
  clientId: string;
  message: string;
  timestamp: string;
}

interface SocketContextType {
  isConnected: boolean;
  clientId: string;
  logs: PongMessage[];
  sendPing: () => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<PongMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [clientId, setClientId] = useState('');

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const id = `client-${Math.floor(Math.random() * 100000)}`;
    setClientId(id);

    const socket = io(API_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Context: Connected to WebSocket');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Context: Disconnected from WebSocket');
      setIsConnected(false);
    });

    socket.on('pong', (data: PongMessage) => {
      console.log('Context: Received pong', data);
      setLogs((prevLogs) => [data, ...prevLogs]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendPing = async () => {
    try {
      if (!clientId) return;

      await axios.post(`${API_URL}/api/ping`, {
        clientId: clientId,
      });
    } catch (error) {
      console.error('Error sending ping:', error);
      alert('Failed to send ping. Check backend connection.');
    }
  };

  const value = {
    isConnected,
    clientId,
    logs,
    sendPing,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};