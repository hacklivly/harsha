import { io } from 'socket.io-client';
import { WebRTCService } from './webrtc';
import { CallPreferences } from '../types';

// Use environment variable for the backend URL
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export class SocketService {
  private socket = io(SOCKET_URL);
  private webrtc: WebRTCService | null = null;

  constructor(
    private onConnected: () => void,
    private onDisconnected: () => void,
    private onRemoteStream: (stream: MediaStream) => void
  ) {
    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
      this.onConnected();
    });
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
      this.onDisconnected();
    });

    this.socket.on('match_found', async ({ roomId, isInitiator }) => {
      console.log('Match found:', { roomId, isInitiator });
      if (!this.webrtc) return;

      if (isInitiator) {
        const offer = await this.webrtc.createOffer();
        this.socket.emit('signal', { roomId, signal: { type: 'offer', offer } });
      }
    });

    this.socket.on('signal', async (data) => {
      console.log('Received signal:', data.type);
      if (!this.webrtc) return;

      if (data.type === 'offer') {
        const answer = await this.webrtc.handleOffer(data.offer);
        this.socket.emit('signal', { type: 'answer', answer });
      } else if (data.type === 'answer') {
        await this.webrtc.handleAnswer(data.answer);
      } else if (data.type === 'candidate') {
        await this.webrtc.handleIceCandidate(data.candidate);
      }
    });
  }

  async startSearch(localStream: MediaStream, preferences: CallPreferences) {
    console.log('Starting search with preferences:', preferences);
    this.webrtc = new WebRTCService(this.onRemoteStream);
    await this.webrtc.initialize(localStream);
    
    // Handle ICE candidates
    this.webrtc.onIceCandidate((candidate) => {
      console.log('Sending ICE candidate');
      this.socket.emit('signal', { type: 'candidate', candidate });
    });
    
    this.socket.emit('start_search', preferences);
  }

  stopSearch() {
    console.log('Stopping search');
    this.socket.emit('stop_search');
    if (this.webrtc) {
      this.webrtc.close();
      this.webrtc = null;
    }
  }

  disconnect() {
    this.socket.disconnect();
    if (this.webrtc) {
      this.webrtc.close();
      this.webrtc = null;
    }
  }
}