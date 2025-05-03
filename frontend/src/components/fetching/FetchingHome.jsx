import React, { useState, useEffect, useRef } from 'react';
import FetchingOverviewModal from './FetchingOverview';
import FetchingFeature from './FetchingFeature';

export default function FetchingHome() {
    const [isOverviewOpen, setIsOverviewOpen] = useState(false);
    const [isFeatureOpen, setIsFeatureOpen] = useState(false);
    
    // Constants
    const API_BASE_URL = 'https://testdockerbackend.azurewebsites.net/api/fetching';

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
                {/* Control Buttons */}
                <div className="flex flex-col gap-3 w-full">
                    <button 
                        className="text-md font-lg text-white rounded-full bg-dark-grayish-orange px-6 py-3 hover:bg-yellow transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleButtonClick}>
                        Start Fetching
                    </button>
                    
                </div>
            </div>
        </div>
    );
}