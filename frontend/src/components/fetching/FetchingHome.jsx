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
  const [audioFormat, setAudioFormat] = useState('raw'); // 'raw' or 'wav'

  // References for audio processing
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamIntervalRef = useRef(null);
  const audioChunksRef = useRef([]);
  const statusCheckIntervalRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const processorNodeRef = useRef(null);

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

  // Start recording and streaming audio using Web Audio API for direct PCM access
  const startDirectAudioStream = async () => {
    try {
      console.log("Starting direct audio processing...");
      setMicLoading(true);
      
      // First, enable audio on the ESP32
      const enableResponse = await fetch(`${API_BASE_URL}/audio/enable`);
      const enableResult = await enableResponse.json();
      console.log("Audio Enable Response:", enableResult);
      
      // Also enable passthrough if needed
      const passthroughResponse = await fetch(`${API_BASE_URL}/audio/passthrough/enable`);
      const passthroughResult = await passthroughResponse.json();
      console.log("Passthrough Enable Response:", passthroughResult);
      
      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: audioConfig.sampleRate,
          channelCount: audioConfig.channelCount
        } 
      });
      
      setMicStream(stream);
      
      // Create audio context with proper sample rate
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: audioConfig.sampleRate
      });
      
      // Create source node from microphone stream
      sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      // Set up audio processing with ScriptProcessor for better compatibility
      // (AudioWorklet would be better but requires more complex setup)
      const bufferSize = 4096;
      processorNodeRef.current = audioContextRef.current.createScriptProcessor(
        bufferSize, 
        audioConfig.channelCount, 
        audioConfig.channelCount
      );
      
      // Create a buffer to accumulate audio data
      let audioBuffer = new Float32Array(0);
      
      // Process audio data
      processorNodeRef.current.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Accumulate audio data
        const newBuffer = new Float32Array(audioBuffer.length + inputData.length);
        newBuffer.set(audioBuffer);
        newBuffer.set(inputData, audioBuffer.length);
        audioBuffer = newBuffer;
        
        // If we have enough data, send it
        if (audioBuffer.length >= audioConfig.sampleRate / 2) { // ~500ms of audio
          // Convert float32 to int16
          const int16Data = new Int16Array(audioBuffer.length);
          for (let i = 0; i < audioBuffer.length; i++) {
            // Convert from [-1.0, 1.0] to [-32768, 32767]
            int16Data[i] = Math.max(-32768, Math.min(32767, Math.floor(audioBuffer[i] * 32767)));
          }
          
          // Send the data
          sendAudioData(int16Data.buffer);
          
          // Reset buffer
          audioBuffer = new Float32Array(0);
        }
      };
      
      // Connect nodes
      sourceNodeRef.current.connect(processorNodeRef.current);
      processorNodeRef.current.connect(audioContextRef.current.destination);
      
      setMicActive(true);
      setAudioEnabled(true);
      console.log("Direct audio processing started");
      setStatusMessage("Audio streaming active (direct mode)");
      
      // Start status polling
      startStatusPolling();
      
    } catch (error) {
      console.error("Error starting direct audio stream:", error);
      setStatusMessage(`Error starting audio: ${error.message}`);
    } finally {
      setMicLoading(false);
    }
  };

  // Start recording and streaming audio using MediaRecorder (original method but improved)
  const startMediaRecorderStream = async () => {
    try {
      console.log("Starting audio recording with MediaRecorder...");
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
      
      // Set up audio context
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: audioConfig.sampleRate
      });
      
      // Create media recorder with specific MIME type for raw PCM
      const options = { mimeType: 'audio/webm;codecs=pcm' };
      try {
        mediaRecorderRef.current = new MediaRecorder(stream, options);
        console.log("Using PCM codec for recording");
      } catch (e) {
        // Fallback if PCM not supported
        mediaRecorderRef.current = new MediaRecorder(stream);
        console.log("Using default codec for recording");
      }
      
      // Set up audio chunk collection
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Set up chunk sending when stopping
      mediaRecorderRef.current.onstop = async () => {
        await sendAudioChunks();
      };
      
      // Start recording with short timeslices to reduce latency
      mediaRecorderRef.current.start(200); // Collect chunks every 200ms
      
      // Store the stream reference
      setMicStream(stream);
      setMicActive(true);
      setAudioEnabled(true);
      console.log("Audio recording started with MediaRecorder");
      setStatusMessage("Audio streaming active (MediaRecorder)");
      
      // Set up streaming interval (send chunks every 400ms)
      streamIntervalRef.current = setInterval(sendAudioChunks, 400);
      
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
      
      // Clean up Web Audio API resources if using direct method
      if (processorNodeRef.current) {
        processorNodeRef.current.disconnect();
        processorNodeRef.current = null;
      }
      
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
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
      // Use the direct audio method for better results
      await startDirectAudioStream();
    }
  };
  
  // Send collected audio chunks to the backend
  const sendAudioChunks = async () => {
    if (audioChunksRef.current.length === 0) return;
    
    try {
      // Combine all chunks into a single blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      audioChunksRef.current = []; // Clear chunks after combining
      
      // Skip if blob is too small (likely silent)
      if (audioBlob.size < 100) {
        console.log("Audio chunk too small, skipping");
        return;
      }
      
      // Convert blob to raw PCM data that ESP32 can process
      const audioArrayBuffer = await audioBlob.arrayBuffer();
      
      // Send the buffer
      await sendAudioData(audioArrayBuffer);
      
    } catch (error) {
      console.error("Error sending audio chunks:", error);
    }
  };
  
  // Send audio data to the server
  const sendAudioData = async (audioBuffer) => {
    try {
      console.log(`Sending ${audioBuffer.byteLength} bytes of audio data`);
      
      const response = await fetch(`${API_BASE_URL}/audio/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'audio/raw'
        },
        body: audioBuffer
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`Sent ${audioBuffer.byteLength} bytes of audio data:`, result);
      
      // Update last audio sent timestamp
      setLastAudioSent(Date.now());
      
    } catch (error) {
      console.error("Error sending audio data:", error);
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

  // Send a test tone with known working format
  const sendTestTone = async () => {
    console.log("Sending test tone...");
    setStatusMessage("Sending test tone...");
    
    try {
      // Enable audio first
      await fetch(`${API_BASE_URL}/audio/enable`);
      await fetch(`${API_BASE_URL}/audio/passthrough/enable`);
      
      // Generate a sine wave test tone (known to work with ESP32)
      const sampleRate = 44100;
      const duration = 2.0;  // 2 seconds
      const frequency = 440;  // A4 note
      const amplitude = 0.7;  // 70% amplitude
      
      const numSamples = Math.floor(duration * sampleRate);
      const samples = new Int16Array(numSamples);
      
      // Generate 16-bit PCM samples
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        samples[i] = Math.round(amplitude * 32767 * Math.sin(2 * Math.PI * frequency * t));
      }
      
      const response = await fetch(`${API_BASE_URL}/audio/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'audio/raw'
        },
        body: samples.buffer
      });
      
      const result = await response.json();
      console.log("Test tone sent:", result);
      setStatusMessage("Test tone sent successfully");
      
    } catch (error) {
      console.error("Error sending test tone:", error);
      setStatusMessage(`Error sending test tone: ${error.message}`);
    }
  };

  // Debug utility function
  const debugAudioSystem = async () => {
    console.log("Running audio system diagnostics...");
    setStatusMessage("Running audio diagnostics...");
    
    try {
      // 1. Access the comprehensive debug endpoint
      const debugResponse = await fetch(`${API_BASE_URL}/debug`);
      const debugInfo = await debugResponse.json();
      console.log("System Debug Info:", debugInfo);
      
      // 2. Check device status
      const statusResponse = await fetch(`${API_BASE_URL}/check-device-status`);
      const deviceStatus = await statusResponse.json();
      console.log("Device Status:", deviceStatus);
      
      // 3. Test enabling audio explicitly
      const enableResponse = await fetch(`${API_BASE_URL}/audio/enable`);
      const enableResult = await enableResponse.json();
      console.log("Audio Enable Response:", enableResult);
      
      // 4. Enable passthrough explicitly
      const passthroughResponse = await fetch(`${API_BASE_URL}/audio/passthrough/enable`);
      const passthroughResult = await passthroughResponse.json();
      console.log("Passthrough Enable Response:", passthroughResult);
      
      // 5. Send a test audio packet with a known working format
      await sendTestTone();
      
      // 6. Check status again to confirm changes
      const statusResponse2 = await fetch(`${API_BASE_URL}/check-device-status`);
      const deviceStatus2 = await statusResponse2.json();
      console.log("Updated Device Status:", deviceStatus2);
      
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

  // Toggle audio format
  const toggleAudioFormat = () => {
    const newFormat = audioFormat === 'raw' ? 'wav' : 'raw';
    setAudioFormat(newFormat);
    console.log(`Changed audio format to: ${newFormat}`);
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
          
          <button
            className="w-full py-3 px-6 text-white font-semibold rounded-md shadow-md transition-all bg-green-600 hover:bg-green-700"
            onClick={sendTestTone}
            disabled={micLoading || micActive}
          >
            Send Test Tone
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
              <div className="flex gap-2 mb-3">
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md text-sm"
                  onClick={debugAudioSystem}
                >
                  Run Audio Diagnostics
                </button>
                
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm"
                  onClick={toggleAudioFormat}
                >
                  Format: {audioFormat}
                </button>
              </div>
              
              <div className="mt-3 text-xs text-gray-600">
                <p>Last audio packet sent: {lastAudioSent ? new Date(lastAudioSent).toLocaleTimeString() : 'None'}</p>
                <p>Audio context: {audioContextRef.current ? audioContextRef.current.state : 'None'}</p>
                <p>Media recorder: {mediaRecorderRef.current ? mediaRecorderRef.current.state : 'None'}</p>
                <p>Audio streaming: {streamIntervalRef.current ? 'Active' : 'Inactive'}</p>
                <p>ESP32 connection: {deviceStatus ? deviceStatus.connectionState : 'Unknown'}</p>
                <p>Audio packets received by device: {deviceStatus ? deviceStatus.audioPacketsReceived : '0'}</p>
              </div>
            </div>
          )}
        </div>

        <p className="mt-4 text-sm text-gray-600">
          When you enable the microphone, audio will automatically be streamed to the ESP32 speaker.
          If you're having trouble, try the test tone or run diagnostics in debug mode.
        </p>
      </div>
    </div>
  );
}