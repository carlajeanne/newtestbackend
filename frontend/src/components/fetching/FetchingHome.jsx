import React, { useState, useEffect, useRef } from 'react';
import FetchingOverviewModal from './FetchingOverview';
import FetchingFeature from './FetchingFeature';

export default function FetchingPage() {
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [isFeatureOpen, setIsFeatureOpen] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [micStream, setMicStream] = useState(null);
  const [micLoading, setMicLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [deviceStatus, setDeviceStatus] = useState(null);
  const [lastAudioSent, setLastAudioSent] = useState(0);
  const [debugMode, setDebugMode] = useState(false);

  // References for audio processing
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamIntervalRef = useRef(null);
  const audioChunksRef = useRef([]);
  const statusCheckIntervalRef = useRef(null);

  const video = {
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: "Fetching Demo"
  };
  const [ledOn, setLedOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = 'https://testdockerbackend.azurewebsites.net/api/fetching';

  // Audio recording configuration
  const audioConfig = {
    sampleRate: 44100,    // Match ESP32's sample rate (44.1kHz)
    channelCount: 1,      // Mono audio
    bitsPerSample: 16     // 16-bit audio
  };

  // Function to check device status
  const checkDeviceStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/check-device-status`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      
      const data = await res.json();
      setDeviceStatus(data);
      
      // Update status message with more detailed information
      if (data.connectionState === 'Connected') {
        setStatusMessage(`ESP32 connected. Audio packets received: ${data.audioPacketsReceived}. Last audio: ${data.timeSinceLastAudio}ms ago.`);
      } else {
        setStatusMessage(`ESP32 ${data.connectionState}. Check device connection.`);
      }
      
      return data;
    } catch (err) {
      console.error('Error checking device status:', err);
      setStatusMessage(`Error getting device status: ${err.message}`);
      return null;
    }
  };

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

  // Start recording and streaming audio
  const startAudioStream = async () => {
    try {
      console.log("Starting audio recording...");
      setMicLoading(true);
      
      // First, enable audio on the ESP32
      const enableResponse = await fetch(`${API_BASE_URL}/audio/enable`);
      const enableResult = await enableResponse.json();
      console.log("Audio Enable Response:", enableResult);
      
      // Also enable passthrough if needed
      const passthroughResponse = await fetch(`${API_BASE_URL}/audio/passthrough/enable`);
      const passthroughResult = await passthroughResponse.json();
      console.log("Passthrough Enable Response:", passthroughResult);
      
      // Check device status to confirm
      const statusData = await checkDeviceStatus();
      
      // If audio not enabled despite our request, alert user
      if (statusData && !statusData.audioEnabled) {
        console.error("WARNING: Device reports audio is still disabled!");
        setStatusMessage("Warning: Device reports audio is still disabled!");
      }
      
      // Get audio stream from user's microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: audioConfig.sampleRate,
          channelCount: audioConfig.channelCount
        } 
      });
      
      // Set up audio processing
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: audioConfig.sampleRate
      });
      
      // Create media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      // Set up audio chunk collection
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Start recording
      mediaRecorderRef.current.start(100); // Collect chunks every 100ms
      
      // Store the stream reference
      setMicStream(stream);
      setMicActive(true);
      setAudioEnabled(true);
      console.log("Audio recording started");
      setStatusMessage("Audio streaming active");
      
      // Set up streaming interval (send chunks every 500ms)
      streamIntervalRef.current = setInterval(sendAudioChunks, 500);
      
      // Start status polling
      startStatusPolling();
      
    } catch (error) {
      console.error("Error starting audio stream:", error);
      setStatusMessage(`Error starting audio: ${error.message}`);
    } finally {
      setMicLoading(false);
    }
  };

  // Stop recording and streaming audio
  const stopAudioStream = async () => {
    if (!micActive) return;
    
    console.log("Stopping audio recording...");
    setMicLoading(true);
    
    try {
      // Clear streaming interval
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }
      
      // Stop media recorder if it exists
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }
      
      // Close audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      // Stop microphone stream
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
        setMicStream(null);
      }
      
      // Disable audio on ESP32
      const disableResponse = await fetch(`${API_BASE_URL}/audio/disable`);
      const disableResult = await disableResponse.json();
      console.log("Audio Disable Response:", disableResult);
      
      // Stop status polling
      stopStatusPolling();
      
      // Reset state
      setMicActive(false);
      setAudioEnabled(false);
      audioChunksRef.current = [];
      console.log("Audio recording stopped");
      setStatusMessage("Audio streaming stopped");
      
    } catch (error) {
      console.error("Error stopping audio stream:", error);
      setStatusMessage(`Error stopping audio: ${error.message}`);
    } finally {
      setMicLoading(false);
    }
  };

  const toggleMicrophone = async () => {
    if (micActive) {
      await stopAudioStream();
    } else {
      await startAudioStream();
    }
  };
  
  // Send collected audio chunks to the backend
  const sendAudioChunks = async () => {
    if (audioChunksRef.current.length === 0) return;
    
    try {
      // Combine all chunks into a single blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      audioChunksRef.current = []; // Clear chunks after combining
      
      // Skip if blob is too small (likely silent)
      if (audioBlob.size < 100) {
        console.log("Audio chunk too small, skipping");
        return;
      }
      
      // Convert blob to raw PCM data that ESP32 can process
      const audioArrayBuffer = await audioBlob.arrayBuffer();
      
      // Send to backend
      const response = await fetch(`${API_BASE_URL}/audio/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'audio/raw'
        },
        body: audioArrayBuffer
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`Sent ${audioBlob.size} bytes of audio data:`, result);
      
      // Update last audio sent timestamp
      setLastAudioSent(Date.now());
      
    } catch (error) {
      console.error("Error sending audio chunks:", error);
    }
  };

  const startStatusPolling = () => {
    // Clear any existing interval
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
    }
    
    // Check status immediately
    checkDeviceStatus();
    
    // Set up polling every 3 seconds
    statusCheckIntervalRef.current = setInterval(checkDeviceStatus, 3000);
  };
  
  const stopStatusPolling = () => {
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
      statusCheckIntervalRef.current = null;
    }
  };

  // Debug utility function
  const debugAudioSystem = async () => {
    console.log("Running audio system diagnostics...");
    setStatusMessage("Running audio diagnostics...");
    
    try {
      // 1. Check device status
      const statusResponse = await fetch(`${API_BASE_URL}/check-device-status`);
      const deviceStatus = await statusResponse.json();
      console.log("Device Status:", deviceStatus);
      
      // 2. Play test tone (using LED as test endpoint)
      const testToneResponse = await fetch(`${API_BASE_URL}/led/on`);
      console.log("Test tone triggered");
      setLedOn(true);
      
      // 3. Enable audio explicitly
      const enableResponse = await fetch(`${API_BASE_URL}/audio/enable`);
      const enableResult = await enableResponse.json();
      console.log("Audio Enable Response:", enableResult);
      
      // 4. Enable passthrough explicitly
      const passthroughResponse = await fetch(`${API_BASE_URL}/audio/passthrough/enable`);
      const passthroughResult = await passthroughResponse.json();
      console.log("Passthrough Enable Response:", passthroughResult);
      
      // 5. Check status again to confirm changes
      const statusResponse2 = await fetch(`${API_BASE_URL}/check-device-status`);
      const deviceStatus2 = await statusResponse2.json();
      console.log("Updated Device Status:", deviceStatus2);
      
      // 6. Send a test audio packet
      const testAudio = new ArrayBuffer(1024);
      const view = new Int16Array(testAudio);
      
      // Create a simple sine wave as test audio
      for (let i = 0; i < view.length; i++) {
        view[i] = Math.sin(i * 0.1) * 10000; // Simple sine wave
      }
      
      const response = await fetch(`${API_BASE_URL}/audio/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'audio/raw'
        },
        body: testAudio
      });
      
      const result = await response.json();
      console.log("Test audio packet result:", result);
      setStatusMessage("Diagnostics complete. Check console for results.");
      
    } catch (error) {
      console.error("Diagnostics error:", error);
      setStatusMessage(`Diagnostics error: ${error.message}`);
    }
  };

  // Show overview modal on mount
  useEffect(() => {
    openModal();
    
    // Initial device status check
    checkDeviceStatus();
  }, []);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      // Stop all audio streaming and processing
      if (micActive) {
        stopAudioStream().catch(err => {
          console.error('Error stopping audio on unmount:', err);
        });
      }
      
      // Stop polling
      stopStatusPolling();
    };
  }, [micActive]);

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

  // Format status display with device info
  const getDetailedStatus = () => {
    if (!deviceStatus) return statusMessage;
    
    if (deviceStatus.connectionState === 'Connected') {
      const timeSinceAudio = deviceStatus.timeSinceLastAudio || 0;
      const packetsReceived = deviceStatus.audioPacketsReceived || 0;
      
      if (timeSinceAudio > 10000 && micActive) {
        return `Warning: ESP32 not receiving audio (${timeSinceAudio/1000}s since last packet)`;
      } else if (packetsReceived > 0) {
        return `ESP32 connected. Audio flowing (${packetsReceived} packets received)`;
      } else {
        return `ESP32 ready. Waiting for audio data.`;
      }
    } else {
      return `ESP32 ${deviceStatus.connectionState || 'Unknown'}. Check device connection.`;
    }
  };

  // Toggle debug mode
  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
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
        
        {/* Status message with device info */}
        <div className="mt-2 p-2 bg-blue-50 text-blue-800 rounded-md w-full text-center">
          {getDetailedStatus()}
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
            disabled={isLoading || micLoading}
          >
            {isLoading
              ? 'Processing...'
              : ledOn
              ? 'TURN OFF LED'
              : 'TURN ON LED'}
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

        {/* Debug Section */}
        <div className="mt-4 w-full">
          <button 
            className="text-sm text-gray-500 hover:text-gray-700"
            onClick={toggleDebugMode}
          >
            {debugMode ? 'Hide Debug Options' : 'Show Debug Options'}
          </button>
          
          {debugMode && (
            <div className="mt-2 p-4 bg-gray-100 rounded-md">
              <h3 className="font-medium mb-2">Debug Tools</h3>
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md text-sm"
                onClick={debugAudioSystem}
              >
                Run Audio Diagnostics
              </button>
              
              <div className="mt-3 text-xs text-gray-600">
                <p>Last audio packet sent: {lastAudioSent ? new Date(lastAudioSent).toLocaleTimeString() : 'None'}</p>
                <p>Audio context: {audioContextRef.current ? audioContextRef.current.state : 'None'}</p>
                <p>Media recorder: {mediaRecorderRef.current ? mediaRecorderRef.current.state : 'None'}</p>
                <p>Audio streaming: {streamIntervalRef.current ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          )}
        </div>

        <p className="mt-4 text-sm text-gray-600">
          When you enable the microphone, audio will automatically be streamed to the ESP32 speaker.
        </p>
      </div>
    </div>
  );
}