import React, { useState, useEffect } from 'react';
import FetchingOverviewModal from './FetchingOverview';
import FetchingFeature from './FetchingFeature';

export default function FetchingHome() {
    const handleButtonClick = async () => {
        const res = await fetch('https://testdockerbackend.azurewebsites.net/api/fetching/led', {
          method: 'POST',
        });
        const data = await res.json();
        console.log(data);
    };

    const [isOverviewOpen, setIsOverviewOpen] = useState(false);
    const [isFeatureOpen, setIsFeatureOpen] = useState(false);

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
                height="70%"
                src={video.url}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className='pb-2'
            ></iframe>

            <button 
                className="text-md font-lg text-white rounded-full bg-dark-grayish-orange px-3 py-2 hover:bg-yellow transition duration-300">
                onClick={handleButtonClick}
                Start Fetching
            </button>
        </div>
    );
}
