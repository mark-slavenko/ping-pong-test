import './index.css';
import { useSocket } from './context/SocketContext';

function App() {
  const { isConnected, clientId, logs, sendPing } = useSocket();

  return (
    <div>
      <h1>🏓 Ping Pong Challenge</h1>

      <div style={{ marginBottom: '20px' }}>
        <p>Status: <span style={{ color: isConnected ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span></p>
        <p>Client ID: <span className="highlight">{clientId}</span></p>
      </div>

      <button onClick={sendPing} disabled={!isConnected}>
        Send Ping 🚀
      </button>

      <div className="log-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px' }}>
          <h3>Real-time Logs</h3>
          <small>{logs.length} messages</small>
        </div>

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