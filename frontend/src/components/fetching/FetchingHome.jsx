import React, { useState, useEffect, useRef } from 'react';
import FetchingOverviewModal from './FetchingOverview';
import FetchingFeature from './FetchingFeature';

export default function FetchingHome() {
    const [isOverviewOpen, setIsOverviewOpen] = useState(false);
    const [isFeatureOpen, setIsFeatureOpen] = useState(false);
    const [esp32Status, setEsp32Status] = useState('Checking ESP32 status...');
    const [isConnected, setIsConnected] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    
    // Constants
    const API_BASE_URL = 'https://testdockerbackend.azurewebsites.net/api/fetching';
    const AUDIO_ENDPOINT = 'http://192.168.1.140/audio'; // Replace with your ESP32's actual IP address

    // Function to check ESP32 status
    const checkEsp32Status = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/status`);
            const data = await res.json();
            console.log('ESP32 status:', data);
            setEsp32Status(data.status);
            setIsConnected(data.status === 'ESP32 connected');
        } catch (error) {
            console.error('Error checking ESP32 status:', error);
            setEsp32Status('Error checking ESP32 status');
            setIsConnected(false);
        }
    };

    // Check status on component mount and periodically
    useEffect(() => {
        checkEsp32Status();
        
        // Check status every 15 seconds
        const intervalId = setInterval(checkEsp32Status, 15000);
        
        return () => clearInterval(intervalId);
    }, []);

    // Start audio recording and streaming to ESP32
    const startAudioStreaming = async () => {
        try {
            setEsp32Status('Starting audio stream...');
            
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Create media recorder
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm',
                audioBitsPerSecond: 16000  // 16kHz sample rate suitable for speech
            });
            
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            
            // Handle data available event
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                    
                    // Send the audio chunk to ESP32
                    sendAudioChunkToESP32(event.data);
                }
            };
            
            // Handle recording stop
            mediaRecorder.onstop = () => {
                console.log('Recording stopped');
                setIsRecording(false);
                stream.getTracks().forEach(track => track.stop());
            };
            
            // Start recording with 100ms chunks for low latency
            mediaRecorder.start(100);
            setIsRecording(true);
            setEsp32Status('Recording and streaming audio to ESP32...');
            
        } catch (error) {
            console.error('Error starting audio stream:', error);
            setEsp32Status('Error accessing microphone');
            setIsRecording(false);
        }
    };
    
    // Stop audio recording
    const stopAudioStreaming = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setEsp32Status('Audio stream stopped');
        }
    };
    
    // Send audio chunk to ESP32
    const sendAudioChunkToESP32 = async (audioChunk) => {
        try {
            const reader = new FileReader();
            reader.readAsArrayBuffer(audioChunk);
            
            reader.onloadend = async () => {
                const arrayBuffer = reader.result;
                
                // Send the audio data to ESP32
                await fetch(AUDIO_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'audio/webm',
                    },
                    body: arrayBuffer
                });
            };
        } catch (error) {
            console.error('Error sending audio to ESP32:', error);
        }
    };

    const handleButtonClick = async () => {
        if (isRecording) {
            stopAudioStreaming();
        } else {
            try {
                // Send fetch command first
                setEsp32Status('Sending fetch command...');
                const res = await fetch(`${API_BASE_URL}/fetch`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await res.json();
                console.log('Fetch response:', data);
                
                // Start audio streaming
                await startAudioStreaming();
                
                // Check status again after a short delay
                setTimeout(checkEsp32Status, 3000);
            } catch (error) {
                console.error('Error:', error);
                setEsp32Status('Error sending command or starting audio');
            }
        }
    };
    
    // Force status refresh
    const refreshStatus = () => {
        setEsp32Status('Refreshing status...');
        checkEsp32Status();
    };

    // Modal control functions
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

    useEffect(() => {
        // Open the initial modal
        openModal();
        
        // Clean up on component unmount
        return () => {
            if (isRecording && mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    const video = {
        id: 1,
        title: 'Dog Emotion',
        date: '2022-01-01',
        url: 'https://www.youtube.com/embed/example1',
        shape: 'rectangle',
    };

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-very-bright-pastel-orange p-5">
            {isOverviewOpen && 
                <FetchingOverviewModal 
                    toggleOverviewModal={closeOverviewModal} 
                    toggleFeatureModal={openFeatureModal} 
                />} 
            {isFeatureOpen && <FetchingFeature toggleFeatureModal={closeFeatureModal} />} 

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
                {/* Status indicator */}
                <div className={`text-center py-2 px-4 rounded-lg ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <p className="font-medium">{esp32Status}</p>
                </div>
                
                {/* Control Buttons */}
                <div className="flex flex-col gap-3 w-full">
                    <button 
                        className={`text-md font-lg text-white rounded-full px-6 py-3 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isRecording 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'bg-dark-grayish-orange hover:bg-yellow'
                        }`}
                        onClick={handleButtonClick}
                        disabled={!isConnected}>
                        {isRecording ? 'Stop' : 'Start'}
                    </button>
                    
                    {/* Refresh status button */}
                    <button 
                        className="text-sm text-gray-600 rounded-full bg-gray-200 px-4 py-2 hover:bg-gray-300 transition duration-300"
                        onClick={refreshStatus}>
                        Refresh Status
                    </button>
                </div>
            </div>
        </div>
    );
}