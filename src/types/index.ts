export interface User {
  id: string;
  country?: string;
  interests: string[];
  hasCamera: boolean;
  hasMic: boolean;
}

export interface CallState {
  isConnected: boolean;
  isFinding: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
}

export interface CallPreferences {
  country?: string;
  interests: string[];
  enableCamera: boolean;
  enableMic: boolean;
}