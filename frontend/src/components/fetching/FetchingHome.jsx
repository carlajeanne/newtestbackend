import React, { useState, useEffect } from 'react';
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
      } else {
        // Stop microphone access
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

  // Show overview modal on mount
  useEffect(() => {
    openModal();
  }, []);

  // Clean up microphone stream when component unmounts
  useEffect(() => {
    return () => {
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

  const video = {
    id: 1,
    title: 'Dog Emotion',
    date: '2022-01-01',
    url: 'https://www.youtube.com/embed/example1',
    shape: 'rectangle',
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
      </div>
    </div>
  );
}