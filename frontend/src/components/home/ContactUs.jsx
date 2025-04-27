import { useState } from 'react';

const ContactUs = () => {
    const [responseMessage, setResponseMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/api/email/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setResponseMessage('Email sent successfully!');
            setFormData({ name: '', email: '', message: '' });

            setTimeout(() => {
                setResponseMessage('');
            }, 5000);
        } catch (error) {
            console.error('Error:', error);
            setResponseMessage('Failed to send email. Please try again.');
            setTimeout(() => {
                setResponseMessage('');
            }, 5000);
        }
    };

    return (
        <div>
            {/* Contact Us Section */}
            <div
                id="contact"
                className="bg-contact-us-background min-h-screen font-montserrat flex items-center justify-center bg-cover bg-center px-4"
            >
                <div className="flex flex-col md:flex-row bg-white bg-opacity-80 rounded-lg shadow-lg p-8 md:p-16 max-w-4xl w-full">
                    {/* Left side: Contact Form */}
                    <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-dark-grayish-orange font-akshar">
                            Contact Us
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    htmlFor="name"
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    htmlFor="email"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="userEmail"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    htmlFor="message"
                                >
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="4"
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!!responseMessage}
                                className={`w-full text-white font-bold px-3 py-2 rounded-lg ${
                                    responseMessage
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-dark-pastel-orange hover:bg-dark-grayish-orange transition duration-300'
                                }`}
                            >
                                {responseMessage || 'Send Message'}
                            </button>
                        </form>
                    </div>

                    {/* Right side: Contact Information with Icons */}
                    <div className="flex flex-col justify-center text-sm space-y-4 md:text-base md:justify-start ml-8 md:w-1/2 text-center md:text-left mt-12 md:mt-0">
                        <div>
                            <h3 className="text-3xl md:text-4xl font-bold mb-10 text-center text-dark-grayish-orange font-akshar">
                                Get in Touch
                            </h3>
                            <p>
                                <i className="fas fa-phone-alt mr-2"></i>
                                Phone: +123 456 7890
                            </p>
                            <p>
                                <i className="fas fa-envelope mr-2"></i>
                                Email: doggo.fetching@gmail.com
                            </p>
                            <p>
                                <i className="fas fa-map-marker-alt mr-2"></i>
                                Address: 123 Doggo Lane, Dogtown, DOG
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
