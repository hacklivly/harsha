import React, { useEffect, useRef } from 'react';
import { Camera, CameraOff, Mic, MicOff, PhoneOff } from 'lucide-react';
import { useCallStore } from '../store/useCallStore';

export const VideoCall: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const { 
    localStream, 
    remoteStream,
    preferences,
    setPreferences,
    isConnected
  } = useCallStore();

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleCamera = () => {
    setPreferences({ enableCamera: !preferences.enableCamera });
    localStream?.getVideoTracks().forEach(track => {
      track.enabled = !preferences.enableCamera;
    });
  };

  const toggleMic = () => {
    setPreferences({ enableMic: !preferences.enableMic });
    localStream?.getAudioTracks().forEach(track => {
      track.enabled = !preferences.enableMic;
    });
  };

  return (
    <div className="relative w-full h-full">
      {/* Remote Video (Full Screen) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Local Video (Picture-in-Picture) */}
      <div className="absolute bottom-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
        <button
          onClick={toggleCamera}
          className="p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-lg"
        >
          {preferences.enableCamera ? (
            <Camera className="w-6 h-6 text-white" />
          ) : (
            <CameraOff className="w-6 h-6 text-red-500" />
          )}
        </button>
        <button
          onClick={toggleMic}
          className="p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-lg"
        >
          {preferences.enableMic ? (
            <Mic className="w-6 h-6 text-white" />
          ) : (
            <MicOff className="w-6 h-6 text-red-500" />
          )}
        </button>
        {isConnected && (
          <button
            onClick={() => {/* Handle end call */}}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
        )}
      </div>
    </div>
  );
};