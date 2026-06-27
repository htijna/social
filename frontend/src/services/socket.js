import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.PROD ? '/' : 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  autoConnect: false,
  path: import.meta.env.PROD ? '/_/backend/socket.io' : '/socket.io'
});

export default socket;
