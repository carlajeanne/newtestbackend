import React, { useState, useEffect, useRef } from 'react';
import FetchingOverviewModal from './FetchingOverview';
import FetchingFeature from './FetchingFeature';
import { io } from 'socket.io-client'; // Import Socket.IO client

export default function FetchingHome() {
    const [isOverviewOpen, setIsOverviewOpen] = useState(false);
    const [isFeatureOpen, setIsFeatureOpen] = useState(false);
    const [esp32Status, setEsp32Status] = useState('Checking...');
    const [connectionTime, setConnectionTime] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    
    // Socket.IO reference
    const socketRef = useRef(null);
    
    // Constants
    const API_BASE_URL = 'https://testdockerbackend.azurewebsites.net/api/fetching';
    
    // Initialize Socket.IO connection
    useEffect(() => {
        // Check ESP32 status first via API
        checkEsp32Status();
        
        // Connect to Socket.IO server
        console.log('Initializing Socket.IO connection...');
        const socket = io('https://testdockerbackend.azurewebsites.net', {
            path: '/socket.io', // Default Socket.IO path
            transports: ['websocket', 'polling'], // Try WebSocket first, fall back to polling
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });
        
        socketRef.current = socket;
        
        // Socket.IO event handlers
        socket.on('connect', () => {
            console.log('Socket.IO connected');
            setIsConnected(true);
            setEsp32Status('Connected to server');
            
            // Register as client
            socket.emit('register_client');
        });
        
        socket.on('disconnect', () => {
            console.log('Socket.IO disconnected');
            setIsConnected(false);
            setEsp32Status('Disconnected from server');
        });
        
        socket.on('connect_error', (error) => {
            console.error('Socket.IO connection error:', error);
            setEsp32Status('Connection error');
            setIsConnected(false);
        });
        
        // Custom event handlers
        socket.on('esp32_status', (data) => {
            console.log('ESP32 status update:', data);
            setEsp32Status(data.status);
            setIsConnected(data.connected);
            if (data.connected_for) {
                setConnectionTime(data.connected_for);
            }
        });
        
        socket.on('led_command_status', (data) => {
            console.log('LED command status:', data);
            setEsp32Status(`LED command: ${data.status}`);
        });
        
        // Clean up on unmount
        return () => {
            console.log('Cleaning up Socket.IO connection');
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);
    
    // Set up periodic status checks
    useEffect(() => {
        const statusInterval = setInterval(() => {
            checkEsp32Status();
        }, 10000); // Check every 10 seconds
        
        return () => {
            clearInterval(statusInterval);
        };
    }, []);
    
    // Check ESP32 status using REST API
    const checkEsp32Status = async () => {
        try {
            console.log('Checking ESP32 status via API...');
            const response = await fetch(`${API_BASE_URL}/status`);
            const data = await response.json();
            
            console.log('Status response:', data);
            setEsp32Status(data.status);
            
            if (data.connected_for) {
                setConnectionTime(data.connected_for);
            }
            
            // Update connection state based on status response
            const isActive = data.status.includes('connected') && !data.status.includes('not');
            setIsConnected(isActive);
            
            return isActive;
        } catch (error) {
            console.error('Error checking ESP32 status:', error);
            setEsp32Status('Error checking ESP32 status');
            setIsConnected(false);
            return false;
        }
    };

    // Handle button click to send fetch command
    const handleButtonClick = async () => {
        try {
            setEsp32Status('Sending fetch command...');
            
            const res = await fetch(`${API_BASE_URL}/fetch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await res.json();
            console.log('Fetch response:', data);
            
            // Update status based on response
            setEsp32Status(`Command sent: ${data.status}`);
            
            // If using Socket.IO, could also emit an event
            if (socketRef.current && socketRef.current.connected) {
                socketRef.current.emit('client_led_request');
            }
        } catch (error) {
            console.error('Error sending fetch command:', error);
            setEsp32Status('Error sending command to ESP32');
        }
    };

    // Force reconnection
    const handleReconnect = () => {
        if (socketRef.current) {
            socketRef.current.connect();
            setEsp32Status('Attempting to reconnect...');
        }
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
                className='pb-2'
            ></iframe>

            <div className="flex flex-col items-center gap-4 w-full max-w-md">
                {/* Connection Status Display */}
                <div className={`w-full py-3 px-4 rounded-lg ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-center`}>
                    <p className="font-medium">{esp32Status}</p>
                    {connectionTime && <p className="text-sm">Connected for: {connectionTime}</p>}
                </div>
                
                {/* Control Buttons */}
                <div className="flex flex-col gap-3 w-full">
                    <button 
                        className="text-md font-lg text-white rounded-full bg-dark-grayish-orange px-6 py-3 hover:bg-yellow transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleButtonClick}
                        disabled={!isConnected}>
                        {isConnected ? 'Start Fetching' : 'ESP32 Not Connected'}
                    </button>
                    
                    <div className="flex justify-center gap-4">
                        <button 
                            className="text-sm text-dark-grayish-orange underline"
                            onClick={checkEsp32Status}>
                            Refresh Status
                        </button>
                        
                        <button 
                            className="text-sm text-dark-grayish-orange underline"
                            onClick={handleReconnect}>
                            Reconnect
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}