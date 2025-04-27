const AboutDoggo = () => {
    return (
        <div
            id="about"
            className="text-black bg-about-doggo-background bg-cover bg-center min-h-screen flex flex-col items-center justify-center px-5 py-8 relative font-montserrat"
        >
            {/* Heading */}
            <h2
                className="text-3xl md:text-7xl font-bold text-dark-grayish-orange font-akshar"
            >
                About DOGGO
            </h2>
            
            <div className="flex items-center mt-4">
                {/* Container for the image and text */}
                <div className="flex items-center bg-white bg-opacity-80 rounded-lg p-4 md:p-6 shadow-lg">
                    {/* Image on the left */}
                    <img
                        src="/favicon.png"
                        alt="Dog"
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-lg"
                    />
                    {/* Text on the right */}
                    <div className="ml-4 md:ml-8">
                        <p className="text-base md:text-lg leading-relaxed max-w-3xl md:max-w-5xl">
                            DOGGO (Dog Observation and Gesture Guidance Optimizer) is a cutting-edge system designed to enhance the connection between dog owners and their pets. With real-time emotion detection, interactive features,
                            and a smart fetching device, DOGGO offers a holistic approach to understanding and managing your dog's behavior.
                        </p>
                    </div>
                </div>
            </div>

            {/* Mission, Vision, How it Works, and Technology Section */}
            <div className="flex flex-wrap justify-center space-x-3 mt-10 max-w-screen-2xl w-full">
                
                {/* Mission Section */}
                <div className="bg-white bg-opacity-80 rounded-lg p-4 md:p-6 shadow-lg mt-2 max-w-xs w-full flex-grow">
                    <h3 className="text-lg md:text-4xl font-bold mb-4 text-dark-grayish-orange font-akshar">Mission</h3>
                    <p className="text-sm md:text-base leading-relaxed">
                        Our mission is to provide dog owners with advanced technology that improves communication and care for their pets. We aim to foster a deeper understanding of dogs' emotions and optimize their mental and physical well-being through observation and interaction.
                    </p>
                </div>

                {/* Vision Section */}
                <div className="bg-white bg-opacity-80 rounded-lg p-4 md:p-6 shadow-lg mt-2 max-w-xs w-full flex-grow">
                    <h3 className="text-xl md:text-4xl font-bold mb-4 text-dark-grayish-orange font-akshar">Vision</h3>
                    <p className="text-base md:text-lg leading-relaxed">
                        We envision a future where every dog owner can understand their pet's emotions and behavior in real time, helping to create a harmonious relationship between humans and dogs.
                    </p>
                </div>

                {/* How it Works Section */}
                <div className="bg-white bg-opacity-80 rounded-lg p-4 md:p-6 shadow-lg mt-2 max-w-xs w-full flex-grow">
                    <h3 className="text-lg md:text-4xl font-bold mb-4 text-dark-grayish-orange font-akshar">How it Works</h3>
                    <p className="text-base md:text-lg leading-relaxed">
                        DOGGO uses an advanced emotion detection system that monitors a dog's body language and gestures, translating them into emotional insights. Paired with an interactive fetching machine, the system keeps your dog mentally and physically stimulated.
                    </p>
                </div>

                {/* Technology Behind DOGGO Section */}
                <div className="bg-white bg-opacity-80 rounded-lg p-4 md:p-6 shadow-lg mt-2 max-w-xs w-full flex-grow">
                    <h3 className="text-lg md:text-4xl font-bold mb-4 text-dark-grayish-orange font-akshar">Technology Behind DOGGO</h3>
                    <p className="text-base md:text-lg leading-relaxed">
                        The DOGGO system leverages AI-driven image recognition and behavior analysis to detect a dog's emotional state. Our fetching device, equipped with pressure sensors and DC motors, allows owners to engage with their dogs remotely, keeping them active and happy, even when they're not at home.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutDoggo;
