import React, { useEffect, useState } from 'react';
import { VideoCall } from './components/VideoCall';
import { PreferencesModal } from './components/PreferencesModal';
import { useCallStore } from './store/useCallStore';
import { SocketService } from './services/socket';
import { Video } from 'lucide-react';

function App() {
  const [showPreferences, setShowPreferences] = useState(false);
  const { 
    isFinding,
    isConnected,
    preferences,
    localStream,
    setLocalStream,
    setRemoteStream,
    setFinding,
    setConnected
  } = useCallStore();

  const [socketService, setSocketService] = useState<SocketService | null>(null);

  useEffect(() => {
    const service = new SocketService(
      () => console.log('Connected to server'),
      () => setConnected(false),
      (stream) => setRemoteStream(stream)
    );
    setSocketService(service);

    return () => {
      service.disconnect();
    };
  }, []);

  const startSearch = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: preferences.enableCamera,
        audio: preferences.enableMic
      });
      setLocalStream(stream);
      setFinding(true);
      
      if (socketService) {
        await socketService.startSearch(stream, preferences);
      }
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setFinding(false);
    }
  };

  const stopSearch = () => {
    if (socketService) {
      socketService.stopSearch();
    }
    setFinding(false);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {isConnected ? (
        <VideoCall />
      ) : (
        <div className="container mx-auto px-4 h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <Video className="w-16 h-16 text-blue-500" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Random Video Chat
            </h1>
            <p className="text-gray-400 mb-8">
              Meet new people instantly with video chat
            </p>
            
            {showPreferences ? (
              <PreferencesModal />
            ) : (
              <div className="space-y-4">
                <button
                  onClick={isFinding ? stopSearch : startSearch}
                  className="bg-blue-500 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-600"
                >
                  {isFinding ? 'Cancel Search' : 'Start Random Chat'}
                </button>
                <button
                  onClick={() => setShowPreferences(true)}
                  className="block mx-auto text-blue-400 hover:text-blue-300"
                >
                  Set Preferences
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;