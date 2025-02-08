export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private onRemoteStream: (stream: MediaStream) => void;
  private onIceCandidateCallback: ((candidate: RTCIceCandidate) => void) | null = null;

  constructor(onRemoteStream: (stream: MediaStream) => void) {
    this.onRemoteStream = onRemoteStream;
  }

  onIceCandidate(callback: (candidate: RTCIceCandidate) => void) {
    this.onIceCandidateCallback = callback;
  }

  async initialize(localStream: MediaStream) {
    this.localStream = localStream;
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
          urls: 'turn:a.relay.metered.ca:80',
          username: 'e8e29e648bef1c5b12230974',
          credential: 'kAzyci9PxoDtBk8e',
        },
        {
          urls: 'turn:a.relay.metered.ca:443',
          username: 'e8e29e648bef1c5b12230974',
          credential: 'kAzyci9PxoDtBk8e',
        },
        {
          urls: 'turn:a.relay.metered.ca:443?transport=tcp',
          username: 'e8e29e648bef1c5b12230974',
          credential: 'kAzyci9PxoDtBk8e',
        }
      ]
    });

    // Add local tracks to peer connection
    this.localStream.getTracks().forEach(track => {
      if (this.peerConnection && this.localStream) {
        this.peerConnection.addTrack(track, this.localStream);
      }
    });

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote track');
      this.onRemoteStream(event.streams[0]);
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidateCallback) {
        console.log('New ICE candidate:', event.candidate);
        this.onIceCandidateCallback(event.candidate);
      }
    };

    // Log ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE Connection State:', this.peerConnection?.iceConnectionState);
    };

    // Log ICE gathering state changes
    this.peerConnection.onicegatheringstatechange = () => {
      console.log('ICE Gathering State:', this.peerConnection?.iceGatheringState);
    };

    return this.peerConnection;
  }

  async createOffer() {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  async handleOffer(offer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  async handleAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async handleIceCandidate(candidate: RTCIceCandidateInit) {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');

    await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  close() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }
}