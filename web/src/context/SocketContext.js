import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const token = localStorage.getItem('darb_token');

  useEffect(() => {
    if (!token) {
      if (socket) { socket.disconnect(); setSocket(null); }
      return;
    }

    const newSocket = io('/', { transports: ['websocket', 'polling'] });
    newSocket.on('connect', () => {
      try {
        const user = JSON.parse(localStorage.getItem('darb_user'));
        if (user && user._id) newSocket.emit('authenticate', user._id);
      } catch {}
    });
    setSocket(newSocket);

    return () => { newSocket.disconnect(); };
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
