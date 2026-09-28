import { io } from 'socket.io-client';

let socket = null;

export function connectSocket() {
  const token = localStorage.getItem('aea_token');
  if (!token) return null;
  if (socket?.connected) return socket;

  socket = io('/', {
    path: '/socket.io',
    auth: { token },
    transports: ['websocket', 'polling'],
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
