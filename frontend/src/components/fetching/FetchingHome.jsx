import React, { useState, useEffect, useRef } from 'react';
import FetchingOverviewModal from './FetchingOverview';
import FetchingFeature from './FetchingFeature';

export default function FetchingHome() {
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [isFeatureOpen, setIsFeatureOpen] = useState(false);
  const [ledOn, setLedOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [micStream, setMicStream] = useState(null);
  const [micLoading, setMicLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  
  // Video configuration
  const video = {
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with your actual video URL
    title: "Fetching Demo" // Replace with your actual video title
  };
  
  // References for audio processing
  const audioContextRef = useRef(null);
  const mediaRecorderRef = useRef(null);
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
        console.log('Microphone access granted');
        
        // Initialize audio processing if speaker is enabled
        if (audioEnabled) {
          initAudioProcessing(stream);
        }
      } else {
        // Stop microphone access and audio processing
        stopAudioProcessing();
        
        if (micStream) {
          micStream.getTracks().forEach(track => track.stop());
          setMicStream(null);
        }
        setMicActive(false);
        console.log('Microphone turned off');
      }
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert(`Could not access microphone: ${err.message}`);
    } finally {
      setMicLoading(false);
    }
  };
  
  const toggleSpeaker = async () => {
    setAudioLoading(true);
    
    try {
      const endpoint = !audioEnabled ? 'audio/enable' : 'audio/disable';
      const res = await fetch(`${API_BASE_URL}/${endpoint}`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Speaker Response:', data);
      
      const newAudioEnabledState = !audioEnabled;
      setAudioEnabled(newAudioEnabledState);
      
      // If mic is active and we're enabling audio, start processing
      if (micActive && newAudioEnabledState) {
        initAudioProcessing(micStream);
      } 
      // If we're disabling audio, stop processing
      else if (!newAudioEnabledState) {
        stopAudioProcessing();
      }
      
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
      // Create audio context and connect microphone
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      
      // Create a processor node for audio processing
      const bufferSize = 4096;
      let processorNode;
      
      if (audioContext.createScriptProcessor) {
        processorNode = audioContext.createScriptProcessor(bufferSize, 1, 1);
      } else {
        console.error('ScriptProcessorNode is not supported in this browser');
        return;
      }
      
      // Set up the audio processing callback
      processorNode.onaudioprocess = (e) => {
        const inputBuffer = e.inputBuffer.getChannelData(0);
        
        // Convert float32 to Int16 for more efficient transmission
        const pcmData = new Int16Array(inputBuffer.length);
        for (let i = 0; i < inputBuffer.length; i++) {
          pcmData[i] = inputBuffer[i] * 0x7FFF;
        }
        
        // Add to chunks for sending
        audioChunksRef.current.push(pcmData.buffer);
      };
      
      // Connect everything
      source.connect(processorNode);
      processorNode.connect(audioContext.destination);
      
      // Store references
      audioContextRef.current = audioContext;
      processorNodeRef.current = processorNode;
      
      // Set up an interval to send audio chunks to the server
      audioIntervalRef.current = setInterval(sendAudioChunks, 100); // Send every 100ms
      
      console.log('Audio processing initialized');
    } catch (err) {
      console.error('Error setting up audio processing:', err);
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
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }
    
    // Clear audio chunks
    audioChunksRef.current = [];
    
    console.log('Audio processing stopped');
  };
  
  const sendAudioChunks = async () => {
    if (audioChunksRef.current.length === 0) return;
    
    try {
      // Combine all chunks into a single blob
      const blob = new Blob([new Uint8Array(audioChunksRef.current.flat())], { type: 'audio/raw' });
      
      // Send to server
      const response = await fetch(`${API_BASE_URL}/audio/stream`, {
        method: 'POST',
        body: blob
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Clear chunks after sending
      audioChunksRef.current = [];
    } catch (err) {
      console.error('Error sending audio chunks:', err);
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
      
      // Stop microphone stream
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [micStream]);

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
            className={`text-center py-2 px-4 rounded-lg ${
              micActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            <p className="font-medium">
              Mic is {micActive ? 'ON' : 'OFF'}
            </p>
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
            className={`text-md font-lg text-white rounded-full px-6 py-3 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
              micLoading
                ? 'bg-gray-400'
                : micActive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            onClick={toggleMicrophone}
            disabled={micLoading}
          >
            {micLoading
              ? 'Processing...'
              : micActive
              ? 'CLOSE MIC'
              : 'OPEN MIC'}
          </button>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <button
            className={`text-md font-lg text-white rounded-full px-6 py-3 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
              audioLoading
                ? 'bg-gray-400'
                : audioEnabled
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
            onClick={toggleSpeaker}
            disabled={audioLoading || !micActive}
          >
            {audioLoading
              ? 'Processing...'
              : audioEnabled
              ? 'DISABLE SPEAKER'
              : 'ENABLE SPEAKER'}
          </button>
        </div>
      </div>
    </div>
  );
}