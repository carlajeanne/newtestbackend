import React, { useState, useEffect, useRef } from 'react';
import FetchingOverviewModal from './FetchingOverview';
import FetchingFeature from './FetchingFeature';

export default function FetchingHome() {
    const [isOverviewOpen, setIsOverviewOpen] = useState(false);
    const [isFeatureOpen, setIsFeatureOpen] = useState(false);
    const [esp32Status, setEsp32Status] = useState('Checking...');
    const [connectionTime, setConnectionTime] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);
    const reconnectTimerRef = useRef(null);

    // WebSocket connection setup
    const connectWebSocket = () => {
        // Close existing connection if any
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.close();
        }

        // Create a new WebSocket connection
        // Replace with your actual WebSocket URL
        const wsUrl = 'wss://testdockerbackend.azurewebsites.net/ws/esp32';
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('WebSocket connection established');
            setIsConnected(true);
            setEsp32Status('Connected to ESP32');
            
            // Clear any existing reconnect timer
            if (reconnectTimerRef.current) {
                clearInterval(reconnectTimerRef.current);
                reconnectTimerRef.current = null;
            }
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Received message:', data);
                
                // Handle different message types
                if (data.type === 'register_confirm') {
                    setEsp32Status('ESP32 registered successfully');
                } else if (data.type === 'heartbeat_ack') {
                    setEsp32Status('ESP32 connection active');
                } else if (data.type === 'led_ack') {
                    console.log('LED command acknowledged');
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed');
            setIsConnected(false);
            setEsp32Status('Disconnected from ESP32');
            
            // Attempt to reconnect
            if (!reconnectTimerRef.current) {
                reconnectTimerRef.current = setInterval(() => {
                    console.log('Attempting to reconnect...');
                    connectWebSocket();
                }, 5000); // Try to reconnect every 5 seconds
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            setEsp32Status('Error connecting to ESP32');
        };
    };

    // Check ESP32 status using the REST API
    const checkEsp32Status = async () => {
        try {
            const response = await fetch('https://testdockerbackend.azurewebsites.net/api/fetching/status');
            const data = await response.json();
            
            setEsp32Status(data.status);
            if (data.connected_for) {
                setConnectionTime(data.connected_for);
            }
            
            // Update connection state based on status response
            setIsConnected(data.status.includes('connected') && !data.status.includes('not'));
        } catch (error) {
            console.error('Error checking ESP32 status:', error);
            setEsp32Status('Error checking ESP32 status');
            setIsConnected(false);
        }
    };

    // Handle button click to send fetch command
    const handleButtonClick = async () => {
        try {
            const res = await fetch('https://testdockerbackend.azurewebsites.net/api/fetching/fetch', {
                method: 'POST',
            });
            const data = await res.json();
            console.log(data);
            
            // Update status based on response
            setEsp32Status(`Command sent: ${data.status}`);
        } catch (error) {
            console.error('Error sending fetch command:', error);
            setEsp32Status('Error sending command to ESP32');
        }
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
        
        // Initial status check
        checkEsp32Status();
        
        // Set up periodic status checks
        const statusInterval = setInterval(checkEsp32Status, 10000); // Check every 10 seconds
        
        // Connect to WebSocket
        connectWebSocket();
        
        // Clean up on unmount
        return () => {
            clearInterval(statusInterval);
            
            if (reconnectTimerRef.current) {
                clearInterval(reconnectTimerRef.current);
            }
            
            if (socketRef.current) {
                socketRef.current.close();
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
                className='pb-2'
            ></iframe>

            <div className="flex flex-col items-center gap-4 w-full">
                {/* Status indicator */}
                <div className={`py-2 px-4 rounded-lg ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <p className="font-medium">{esp32Status}</p>
                    {connectionTime && <p className="text-sm">Connected for: {connectionTime}</p>}
                </div>
                
                <button 
                    className="text-md font-lg text-white rounded-full bg-dark-grayish-orange px-6 py-3 hover:bg-yellow transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleButtonClick}
                    disabled={!isConnected}>
                    {isConnected ? 'Start Fetching' : 'ESP32 Not Connected'}
                </button>
                
                <button 
                    className="text-sm text-dark-grayish-orange underline"
                    onClick={checkEsp32Status}>
                    Refresh Status
                </button>
            </div>
        </div>
    );
}