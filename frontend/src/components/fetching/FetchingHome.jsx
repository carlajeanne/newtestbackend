import React, { useState, useEffect, useRef } from 'react';

export default function AudioStreaming() {
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [isFeatureOpen, setIsFeatureOpen] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [micStream, setMicStream] = useState(null);
  const [micLoading, setMicLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // References for audio processing
  const audioContextRef = useRef(null);
  const processorNodeRef = useRef(null);
  const audioIntervalRef = useRef(null);
  const audioChunksRef = useRef([]);

  const API_BASE_URL = 'https://testdockerbackend.azurewebsites.net/api/fetching';

  const toggleLED = async () => {
    const state = ledOn ? 'off' : 'on';
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/led/${state}`);

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      console.log('LED Response:', data);
      setLedOn(!ledOn);
    } catch (err) {
      console.error('Error toggling LED:', err);
      alert(`Could not toggle LED: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMicrophone = async () => {
    setMicLoading(true);
    
    try {
      if (!micActive) {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicStream(stream);
        setMicActive(true);
        setStatusMessage('Microphone connected successfully');
        
        // Automatically enable audio on the ESP32 when mic is enabled
        await enableDeviceAudio();
        setAudioEnabled(true);
        
        // Initialize audio processing to stream mic data to ESP32
        initAudioProcessing(stream);
      } else {
        // Stop microphone access and audio processing
        stopAudioProcessing();
        
        // Disable audio on device
        await disableDeviceAudio();
        setAudioEnabled(false);
        
        // Stop microphone stream
        if (micStream) {
          micStream.getTracks().forEach(track => track.stop());
          setMicStream(null);
        }
        
        setMicActive(false);
        setStatusMessage('Microphone disconnected');
      }
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setMicLoading(false);
    }
  };
  
  const enableDeviceAudio = async () => {
    setAudioLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/audio/enable`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Speaker Enable Response:', data);
      setStatusMessage('Speaker enabled on ESP32');
      return true;
    } catch (err) {
      console.error('Error enabling speaker:', err);
      setStatusMessage(`Error enabling speaker: ${err.message}`);
      return false;
    } finally {
      setAudioLoading(false);
    }
  };
  
  const disableDeviceAudio = async () => {
    setAudioLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/audio/disable`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Speaker Disable Response:', data);
      setStatusMessage('Speaker disabled on ESP32');
      return true;
    } catch (err) {
      console.error('Error disabling speaker:', err);
      setStatusMessage(`Error disabling speaker: ${err.message}`);
      return false;
    } finally {
      setAudioLoading(false);
    }
  };

  const toggleSpeaker = async () => {
    setAudioLoading(true);
    
    try {
      const newAudioEnabledState = !audioEnabled;
      
      if (newAudioEnabledState) {
        // Enable audio on device
        const success = await enableDeviceAudio();
        if (!success) throw new Error("Failed to enable audio on device");
        
        // If mic is already active, start processing
        if (micActive && micStream) {
          initAudioProcessing(micStream);
        }
      } else {
        // Disable audio on device
        const success = await disableDeviceAudio();
        if (!success) throw new Error("Failed to disable audio on device");
        
        // Stop audio processing
        stopAudioProcessing();
      }
      
      setAudioEnabled(newAudioEnabledState);
      
    } catch (err) {
      console.error('Error toggling speaker:', err);
      alert(`Could not toggle speaker: ${err.message}`);
    } finally {
      setAudioLoading(false);
    }
  };
  
  const initAudioProcessing = (stream) => {
    if (!stream) return;
    
    try {
      // Stop any existing audio processing
      stopAudioProcessing();
      
      // Create audio context and connect microphone
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 44100 // Match ESP32 I2S configuration
      });
      audioContextRef.current = audioContext;
      
      // Create a processor node with appropriate buffer size for low latency
      const bufferSize = 2048;
      let processorNode;
      
      if (audioContext.createScriptProcessor) {
        processorNode = audioContext.createScriptProcessor(bufferSize, 1, 1);
        processorNodeRef.current = processorNode;
        
        // Set up the audio processing callback
        processorNode.onaudioprocess = (e) => {
          if (!audioEnabled) return;
          
          const inputBuffer = e.inputBuffer.getChannelData(0);
          
          // Convert float32 to Int16 for more efficient transmission
          const pcmData = new Int16Array(inputBuffer.length);
          for (let i = 0; i < inputBuffer.length; i++) {
            pcmData[i] = Math.max(-32768, Math.min(32767, inputBuffer[i] * 32767));
          }
          
          // Add to chunks for sending
          audioChunksRef.current.push(pcmData.buffer);
        };
        
        // Connect the microphone to the processor
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(processorNode);
        processorNode.connect(audioContext.destination);
        
        // Set up regular interval to send audio chunks (50ms for low latency)
        audioIntervalRef.current = setInterval(sendAudioChunks, 50);
        
        console.log('Audio processing initialized');
        setStatusMessage('Audio streaming active');
      } else {
        console.error('ScriptProcessorNode is not supported in this browser');
        setStatusMessage('Your browser does not support the required audio features');
      }
    } catch (err) {
      console.error('Error setting up audio processing:', err);
      setStatusMessage(`Audio processing error: ${err.message}`);
    }
  };
  
  const stopAudioProcessing = () => {
    // Clear sending interval
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    
    // Disconnect processor node
    if (processorNodeRef.current) {
      processorNodeRef.current.disconnect();
      processorNodeRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch (err) {
          console.warn('Error closing audio context:', err);
        }
      }
      audioContextRef.current = null;
    }
    
    // Clear audio chunks
    audioChunksRef.current = [];
    
    console.log('Audio processing stopped');
  };

  const sendAudioChunks = async () => {
    if (!audioEnabled || audioChunksRef.current.length === 0) return;
    
    try {
      // Create a copy of the current chunks and clear the original array
      const chunksToSend = [...audioChunksRef.current];
      audioChunksRef.current = [];
      
      // Combine all chunks into a single blob
      const concatenated = new Uint8Array(
        chunksToSend.reduce((acc, chunk) => acc + chunk.byteLength, 0)
      );
      
      let offset = 0;
      chunksToSend.forEach(chunk => {
        concatenated.set(new Uint8Array(chunk), offset);
        offset += chunk.byteLength;
      });
      
      const blob = new Blob([concatenated], { type: 'audio/raw' });
      
      // Send to server
      const response = await fetch(`${API_BASE_URL}/audio/stream`, {
        method: 'POST',
        body: blob
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (err) {
      console.error('Error sending audio chunks:', err);
      // Don't update status message on every failed chunk to avoid spamming UI
    }
  };

  // Show overview modal on mount
  useEffect(() => {
    openModal();
  }, []);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      // Stop audio processing
      stopAudioProcessing();
      
      // Disable audio on device
      if (audioEnabled) {
        disableDeviceAudio().catch(err => {
          console.error('Error disabling audio on unmount:', err);
        });
      }
      
      // Stop microphone stream
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [micStream, audioEnabled]);

  const openModal = () => {
    setIsOverviewOpen(true);
    setIsFeatureOpen(false);
  };

  const openFeatureModal = () => {
    setIsOverviewOpen(false);
    setIsFeatureOpen(true);
  };

  const closeOverviewModal = () => {
    setIsOverviewOpen(false);
  };

  const closeFeatureModal = () => {
    setIsFeatureOpen(false);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-very-bright-pastel-orange p-5">
      {isOverviewOpen && (
        <FetchingOverviewModal
          toggleOverviewModal={closeOverviewModal}
          toggleFeatureModal={openFeatureModal}
        />
      )}
      {isFeatureOpen && (
        <FetchingFeature toggleFeatureModal={closeFeatureModal} />
      )}

      <iframe
        width="70%"
        height="60%"
        src={video.url}
        title={video.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="pb-2"
      ></iframe>

      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        {/* Status indicators */}
        <div className="flex gap-2 w-full justify-center">
          <div
            className={`text-center py-2 px-4 rounded-lg ${
              ledOn
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            <p className="font-medium">
              LED is {ledOn ? 'ON' : 'OFF'}
            </p>
          </div>

          <div 
            className={`px-4 py-2 rounded-md ${
              micActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
            }`}
          >
            Microphone: {micActive ? 'ON' : 'OFF'}
          </div>
          
          <div
            className={`text-center py-2 px-4 rounded-lg ${
              audioEnabled
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            <p className="font-medium">
              Speaker is {audioEnabled ? 'ON' : 'OFF'}
            </p>
          </div>
        </div>
        
        {statusMessage && (
          <div className="mt-2 p-2 bg-blue-50 text-blue-800 rounded-md">
            {statusMessage}
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            className={`text-md font-lg text-white rounded-full px-6 py-3 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
              isLoading
                ? 'bg-gray-400'
                : ledOn
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-dark-grayish-orange hover:bg-yellow'
            }`}
            onClick={toggleLED}
            disabled={isLoading}
          >
            {isLoading
              ? 'Processing...'
              : ledOn
              ? 'TURN OFF'
              : 'TURN ON'}
          </button>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <button
            className={`w-full py-3 px-6 text-white font-semibold rounded-md shadow-md transition-all ${
              micLoading ? 'bg-gray-400 cursor-not-allowed' : 
              micActive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            onClick={toggleMicrophone}
            disabled={micLoading}
          >
            {micLoading ? 'Processing...' : micActive ? 'STOP MICROPHONE' : 'START MICROPHONE'}
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-600">
          When you enable the microphone, audio will automatically be streamed to the ESP32 speaker.
        </p>

      </div>
    </div>
  );
}