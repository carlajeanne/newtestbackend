import React from 'react';

const FetchingOverviewModal = ({ toggleOverviewModal, toggleFeatureModal }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
            <div className="relative p-6 w-full max-w-[60%] max-h-[85%]  bg-white rounded-lg shadow-lg overflow-auto">
                <div className="flex items-center justify-between p-4 border-b rounded-t border-b-dark-grayish-orange">
                    <h3 className="text-xl font-semibold text-dark-grayish-orange">
                        Doggo Fetching Device
                    </h3>
                    <button
                        onClick={toggleOverviewModal}
                        className="text-black bg-transparent hover:bg-yellow rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                        type="button"
                    >
                        <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                <p className="mt-4 text-xl font-sans font-semibold text-black text-center">Play with your Dog from Afar</p>
                <p className="text-black mb-4">The Doggo Fetching Device is the ultimate gadget for dog owners who want to keep their furry friends active and entertained even when they're not at home. Whether you're at work or running errands, this device ensures your pet can fetch, play, and stay happy.</p>

                <h3 className="mt-4 text-xl font-sans font-semibold text-black text-center">Fetch and Play</h3>
                <p className="text-black mb-4">With this innovative device, your dog can enjoy hours of fun playing fetch independently. Designed with both convenience and your pet's happiness in mind, it provides endless entertainment while giving you peace of mind.</p>

                <h3 className="mt-4 text-xl font-sans font-semibold text-black text-center">DOGGO Makes it FUN</h3>
                <p className="text-black mb-4">This device transforms the way your dog experiences playtime. It’s engaging, safe, and tailored to bring joy to your beloved pet while promoting physical activity and mental stimulation.</p>

                <div className="flex justify-end">
                  <button 
                        className="text-white inline-flex w-full justify-center bg-dark-grayish-orange hover:bg-yellow focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                        onClick={toggleFeatureModal}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FetchingOverviewModal;
