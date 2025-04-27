import { useState, useEffect } from 'react';

export default function ForgotPassword({ toggleModal, openSignInModal }) {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false); // New state to track if the reset link was sent

    useEffect(() => {
        // Disable scrolling when the modal is open
        document.body.style.overflow = "hidden";

        return () => {
            // Re-enable scrolling when the modal is closed
            document.body.style.overflowY = "auto";
        };
    }, []);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setMessage('A reset link has been sent to your email.');
                setIsSent(true); // Mark as sent to disable the button
            } else {
                const errorData = await response.json();
                setMessage(errorData.message || 'Failed to send reset link. Please try again.');
            }
        } catch (error) {
            setMessage('An error occurred. Please try again.', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="relative p-4 w-full max-w-md max-h-full bg-white rounded-lg shadow">
                {/* Modal header */}
                <div className="flex items-center justify-between p-4 border-b rounded-t">
                    <h3 className="text-xl font-bold text-dark-pastel-orange">
                        Forgot Password
                    </h3>
                    <button
                        onClick={toggleModal}
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-2xl text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        type="button"
                    >
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                {/* Modal body */}
                <div className="p-9 md:p-10">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black text-center">
                                Enter email address
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={email}
                                onChange={handleEmailChange}
                                className="text-sm rounded-lg block w-full p-2.5 dark:bg-gray-100 border dark:border-gray-500 dark:placeholder-gray-400 dark:text-black mb-10"
                                placeholder="name@gmail.com"
                                required
                                disabled={isSent} // Disable input after successful request
                            />
                        </div>

                        {message && (
                            <div className="text-sm text-center mb-4 text-gray-700">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || isSent} // Disable button while loading or after success
                            className={`w-full px-4 py-2 rounded-lg font-medium text-white transition duration-300 ${isSent ? 'bg-green-500' : isLoading ? 'bg-gray-400' : 'bg-dark-pastel-orange hover:bg-yellow'} focus:outline-none focus:ring-4`}
                        >
                            {isSent ? 'Reset Link Sent' : isLoading ? 'Sending Reset Password Email...' : 'Send Reset Password Email'}
                        </button>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-700">
                            Already have an account?{' '}
                            <a href="#" className="text-dark-pastel-orange font-semibold hover:underline dark:text-dark-pastel-orange" onClick={openSignInModal}>
                                Sign In
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
