import React, { createContext, useContext } from 'react';

import { io, type Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:5000');

const SocketContext = createContext(socket);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
