import React, { useState, useEffect } from 'react';
import FetchingOverviewModal from './FetchingOverview';
import FetchingFeature from './FetchingFeature';

export default function FetchingHome() {
    const [isOverviewOpen, setIsOverviewOpen] = useState(false);
    const [isFeatureOpen, setIsFeatureOpen] = useState(false);
    const [esp32Status, setEsp32Status] = useState('Checking ESP32 status...');
    const [isConnected, setIsConnected] = useState(false);
    
    // Constants
    const API_BASE_URL = 'https://testdockerbackend.azurewebsites.net/api/fetching';

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

    const handleButtonClick = async () => {
        try {
            setEsp32Status('Sending fetch command...');
            const res = await fetch(`${API_BASE_URL}/fetch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            console.log('Fetch response:', data);
            setEsp32Status(`Command sent: ${data.status}`);
            
            // Check status again after a short delay
            setTimeout(checkEsp32Status, 3000);
        } catch (error) {
            console.error('Error sending fetch command:', error);
            setEsp32Status('Error sending command to ESP32');
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
                {/* Status indicator */}
                <div className={`text-center py-2 px-4 rounded-lg ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <p className="font-medium">{esp32Status}</p>
                </div>
                
                {/* Control Buttons */}
                <div className="flex flex-col gap-3 w-full">
                    <button 
                        className="text-md font-lg text-white rounded-full bg-dark-grayish-orange px-6 py-3 hover:bg-yellow transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleButtonClick}
                        disabled={!isConnected}>
                        Start Fetching
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