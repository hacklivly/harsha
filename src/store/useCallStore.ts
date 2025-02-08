import { create } from 'zustand';
import { CallState, CallPreferences } from '../types';

interface CallStore extends CallState {
  preferences: CallPreferences;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  setPeerConnection: (connection: RTCPeerConnection | null) => void;
  setPreferences: (preferences: Partial<CallPreferences>) => void;
  setFinding: (finding: boolean) => void;
  setConnected: (connected: boolean) => void;
}

export const useCallStore = create<CallStore>((set) => ({
  isConnected: false,
  isFinding: false,
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  preferences: {
    country: undefined,
    interests: [],
    enableCamera: true,
    enableMic: true,
  },
  setLocalStream: (stream) => set({ localStream: stream }),
  setRemoteStream: (stream) => set({ remoteStream: stream }),
  setPeerConnection: (connection) => set({ peerConnection: connection }),
  setPreferences: (preferences) =>
    set((state) => ({
      preferences: { ...state.preferences, ...preferences },
    })),
  setFinding: (finding) => set({ isFinding: finding }),
  setConnected: (connected) => set({ isConnected: connected }),
}));