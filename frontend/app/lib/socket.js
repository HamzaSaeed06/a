import { io } from 'socket.io-client';

let socket = null;

// Backend URL ek jagah define karo
export const BACKEND_URL = typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.hostname}:8005`
  : 'http://localhost:8005';

export function getSocket() {
  if (!socket) {
    socket = io(BACKEND_URL, { 
      transports: ['polling', 'websocket'] 
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) { 
    socket.disconnect(); 
    socket = null; 
  }
}