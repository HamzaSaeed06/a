import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    const backendUrl = typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:8005`
      : 'http://192.168.100.5:8005';
    socket = io(backendUrl, { transports: ['websocket', 'polling'] });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}
