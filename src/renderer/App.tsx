import React, { useState, useEffect } from 'react';
import './App.css';

const { ipcRenderer } = window.require('electron');

const App: React.FC = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    // Listen for messages from the main process
    ipcRenderer.on('message-from-main', (event: any, data: string) => {
      setResponse(data);
    });

    // Clean up the event listener when the component unmounts
    return () => {
      ipcRenderer.removeAllListeners('message-from-main');
    };
  }, []);

  const handleSendMessage = () => {
    // Send a message to the main process
    ipcRenderer.send('message-from-renderer', message);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Waxly</h1>
      </header>
      <main className="app-main">
        <div className="message-box">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button onClick={handleSendMessage}>Send to Main</button>
        </div>
        {response && (
          <div className="response">
            <p>Response from main process:</p>
            <p>{response}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
