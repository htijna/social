import { io } from 'socket.io-client';
import { BACKEND_URL } from './api';

const socket = io(BACKEND_URL, {
  autoConnect: false
});

export default socket;
