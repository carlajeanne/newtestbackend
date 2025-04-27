import React, { useState } from 'react';

export default function FetchingFeature({ toggleFeatureModal }) {
    const [collapsedFeature, setCollapsedFeature] = useState(null);

    const toggleCollapse = (featureId) => {
        setCollapsedFeature(prevId => (prevId === featureId ? null : featureId));
    };

    const features = [
        {
            id: 'Pet Friendly',
            title: 'Pet Friendly',
            content: 'Our device is designed with your pet\'s safety and comfort in mind. Every feature ensures a secure and enjoyable experience for your furry friend, prioritizing their well-being during playtime.'
        },
        {
            id: 'Interactive',
            title: 'Interactive',
            content: 'Engage your dog in a whole new way! The fetching device offers interactive features that keep your pet mentally stimulated and physically active, fostering a bond even when you\'re not around.'
        },
        {
            id: 'Reliable Performance',
            title: 'Reliable Performance',
            content: 'Crafted for durability and ease of use, this device guarantees a seamless experience for you and your pet. It\'s made to deliver consistent and dependable playtime, ensuring your dog is entertained and happy.'
        }
    ];

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
            <div className="relative p-6 w-full max-w-[80%] max-h-[85%] bg-white rounded-lg shadow-lg overflow-auto">
                <div className="flex items-center justify-between p-4 border-b rounded-t border-b-dark-grayish-orange">
                    <h3 className="text-xl font-semibold text-dark-grayish-orange">
                        Doggo Fetching Device
                    </h3>
                    <button
                        onClick={toggleFeatureModal}
                        className="text-black bg-transparent hover:bg-[#F1D04B] rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                        type="button"
                    >
                        <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                <div className="p-4 md:p-5">
                    <p className="text-dark-grayish-orange mb-4">Explore our Fetching Device:</p>
                    <ul className="space-y-4 mb-4">
                        {features.map((feature) => (
                            <li key={feature.id}>
                                <input 
                                    type="radio" 
                                    id={feature.id} 
                                    name="features" 
                                    value={feature.id} 
                                    className="hidden peer" 
                                    required 
                                />
                                <label 
                                    htmlFor={feature.id} 
                                    className="inline-flex items-center justify-between w-full p-5 text-dark-grayish-orange bg-gray-200 border border-dark-grayish-orange rounded-lg cursor-pointer peer-checked:bg-dark-grayish-orange peer-checked:text-white"
                                    onClick={() => toggleCollapse(feature.id)}
                                >
                                    <div className="block">
                                        <div className="w-full text-lg font-semibold">{feature.title}</div>
                                        <div className="w-full text-black">{feature.content.slice(0, 50)}...</div>
                                    </div>
                                    <svg className="w-4 h-4 ms-3 rtl:rotate-180 text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                                    </svg>
                                </label>
                                {collapsedFeature === feature.id && (
                                    <div className="p-4 text-black">
                                        <p>{feature.content}</p>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                    <button 
                        className="text-white inline-flex w-full justify-center bg-dark-grayish-orange hover:bg-yellow focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                        onClick={toggleFeatureModal}
                    >
                        Start Fetching
                    </button>
                </div>
            </div>
        </div>
    );
}
