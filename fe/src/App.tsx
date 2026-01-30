import { useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import axios from 'axios';

import './index.css';

interface PongMessage {
  originalMessageId: string;
  clientId: string;
  message: string;
  timestamp: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [logs, setLogs] = useState<PongMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [clientId, setClientId] = useState('');

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const id = `client-${Math.floor(Math.random() * 10000)}`;
    setClientId(id);

    const socket = io(API_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    });

    socket.on('pong', (data: PongMessage) => {
      console.log('Received pong:', data);

      setLogs((prevLogs) => [data, ...prevLogs]);
    });


    return () => {
      socket.disconnect();
    };
  }, []);

  const sendPing = async () => {
    try {

      await axios.post(`${API_URL}/api/ping`, {
        clientId: clientId,
      });

    } catch (error) {
      console.error('Error sending ping:', error);
      alert('Failed to send ping. Is the backend running?');
    }
  };

  return (
    <div>
      <h1>🏓 Ping Pong Challenge</h1>

      <div style={{ marginBottom: '20px' }}>
        <p>Status: <span style={{ color: isConnected ? '#4caf50' : '#f44336' }}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span></p>
        <p>Client ID: <span className="highlight">{clientId}</span></p>
      </div>

      <button onClick={sendPing} disabled={!isConnected}>
        Send Ping 🚀
      </button>

      <div className="log-container">
        <h3>Real-time Logs (Redis Stream Consumer)</h3>
        {logs.length === 0 && <p style={{ color: '#666' }}>Waiting for pongs...</p>}

        {logs.map((log) => (
          <div key={log.originalMessageId} className="log-entry">
            <span style={{ color: '#888' }}>[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
            Client <b>{log.clientId}</b> received{' '}
            <span className="highlight">{log.message.toUpperCase()}</span>
            <br />
            <small style={{ color: '#555' }}>ID: {log.originalMessageId}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;