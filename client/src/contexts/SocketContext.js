import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const newSocket = io('http://localhost:5001', {
        transports: ['websocket'],
        autoConnect: true
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        toast.error('Connection error. Please refresh the page.');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated]);

  const joinDraft = (draftId) => {
    if (socket && connected) {
      socket.emit('join-draft', draftId);
      console.log('Joined draft:', draftId);
    }
  };

  const leaveDraft = (draftId) => {
    if (socket && connected) {
      socket.emit('leave-draft', draftId);
      console.log('Left draft:', draftId);
    }
  };

  const onDraftStarted = (callback) => {
    if (socket) {
      socket.on('draft-started', callback);
    }
  };

  const onPickMade = (callback) => {
    if (socket) {
      socket.on('pick-made', callback);
    }
  };

  const onAutoPickMade = (callback) => {
    if (socket) {
      socket.on('auto-pick-made', callback);
    }
  };

  const onDraftPaused = (callback) => {
    if (socket) {
      socket.on('draft-paused', callback);
    }
  };

  const onDraftCancelled = (callback) => {
    if (socket) {
      socket.on('draft-cancelled', callback);
    }
  };

  const removeAllListeners = () => {
    if (socket) {
      socket.removeAllListeners();
    }
  };

  const value = {
    socket,
    connected,
    joinDraft,
    leaveDraft,
    onDraftStarted,
    onPickMade,
    onAutoPickMade,
    onDraftPaused,
    onDraftCancelled,
    removeAllListeners
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 