import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/outline';
import { Eye, EyeOff } from 'lucide-react';

export default function SignIn({ toggleModal, openSignUpModal, openForgotPassModal }) {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [email, setEmail] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError('');
            }, 3000); 
    
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        const savedEmail = localStorage.getItem('savedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    useEffect(() => {
      // Disable scrolling when the modal is open
      document.body.style.overflow = "hidden";
  
      return () => {
        // Re-enable scrolling when the modal is closed
        document.body.style.overflowY = "auto";
      };
    }, []);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const password = e.target.password.value;
    
        try {
            // Send login request to backend
            const response = await fetch('https://testdockerbackend.azurewebsites.net/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
    
            // Check if the response is successful
            if (!response.ok) {
                const errorMessage = await response.json();
                setError(errorMessage.error || "Login failed.");
                throw new Error(errorMessage.error || "Login failed.");
            }
    
            const data = await response.json();
            console.log("Login Response:", data);
    
            if (data.refresh_token) {
                // Save the token and user ID in local storage
                localStorage.setItem('token', data.refresh_token);
                localStorage.setItem('user_id', data.id);  // Save user ID
    
                // Save the email if "Remember me" is checked
                if (rememberMe) {
                    localStorage.setItem('savedEmail', email);
                } else {
                    localStorage.removeItem('savedEmail');
                }
    
                // Redirect to the fetching page after login
                navigate('/fetching-page');
            } else {
                setError("Something went wrong. No token received.");
            }
        } catch (error) {
            setError(error.message);
        }
    };
    
    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="relative p-4 w-full max-w-md max-h-full bg-white rounded-lg shadow">
                {/* Modal header */}
                <div className="flex items-center justify-between p-4 border-b rounded-t">
                    <h3 className="text-xl font-bold text-dark-pastel-orange">
                        Sign in to DOGGO
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
                <div className="p-4">
                    {error && (
                        <div className="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                            <ExclamationCircleIcon className="w-5 h-5 mr-2 text-red-700" />
                            <span>{error}</span>
                        </div>
                    )}
                    <form className="space-y-4" onSubmit={handleFormSubmit}>
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">
                                Your email
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                className="text-sm rounded-lg block w-full p-2.5 border"
                                placeholder="name@gmail.com"
                                required
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">
                                Your password
                            </label>
                            <div className="relative">
                                <input
                                    type={passwordVisible ? 'text' : 'password'}
                                    name="password"
                                    id="password"
                                    placeholder="••••••••"
                                    className="text-sm rounded-lg block w-full p-2.5 border"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-600"
                                >
                                    {passwordVisible ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="remember"
                                        type="checkbox"
                                        className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-600 dark:border-gray-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-[#DDDDD]-800"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                </div>
                                <label htmlFor="remember" className="ms-2 text-sm font-medium text-black-300 dark:text-black-300">
                                    Remember me
                                </label>
                            </div>
                            <a href="#" className="text-sm text-dark-pastel-orange hover:underline dark:text-dark-pastel-orange" onClick={openForgotPassModal}>
                                Forgot Password?
                            </a>
                        </div>
                        <button
                            type="submit"
                            className="w-full text-white bg-dark-pastel-orange hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5"   
                        >
                            Sign In
                        </button>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-700">
                            Don't have an account?{' '}
                            <a href="#" className="text-dark-pastel-orange font-semibold hover:underline dark:text-dark-pastel-orange" onClick={openSignUpModal}>
                                Sign Up
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}