import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function SignUp({ toggleModal, openSignInModal, openTermsModal }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        realName: '',
        contactNumber: '',
        petName: '',
        petSex: '',
        petBreed: '',
        petAge: '',
    });
    
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage('');
            }, 3000); 
    
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflowY = 'auto';
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        if (name === 'password') {
            validatePassword(value);
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const validatePassword = (password) => {
        if (password.length < 8) {
            setErrorMessage('Password must be at least 8 characters long.');
        } else if (!/[0-9!@#$%^&*]/.test(password)) {
            setErrorMessage('Password must contain at least one number or special character.');
        } else {
            setErrorMessage('');
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (errorMessage) {
            alert('Please fix the errors in the form before submitting.');
            return;
        }
    
        try {
            const response = await fetch('http://localhost:3001/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
    
            if (response.ok) {
                const data = await response.json();
                // Store user_id in localStorage
                localStorage.setItem('user_id', data.user_id);
                navigate('/account');
            } else {
                const errorData = await response.json();
                setErrorMessage(`Registration failed: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error during registration:', error);
            setErrorMessage('An error occurred. Please try again later.');
        }
    };    

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="relative p-4 w-full max-w-md h-[70vh] bg-white rounded-lg shadow overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b rounded-t">
                    <h3 className="text-xl font-bold text-dark-pastel-orange">
                        Create a Doggo Account
                    </h3>
                    <button
                        onClick={toggleModal}
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-2xl text-sm w-8 h-8 inline-flex justify-center items-center"
                        type="button"
                    >
                        <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                <div className="p-4">
                    <form className="space-y-4" onSubmit={handleFormSubmit}>
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                                Your email
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="text-sm rounded-lg block w-full p-2.5 border"
                                placeholder="name@gmail.com"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                                Create password
                            </label>
                            <div className="relative">
                                <input
                                    type={passwordVisible ? 'text' : 'password'}
                                    name="password"
                                    id="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="text-sm rounded-lg block w-full p-2.5 border"
                                    placeholder="••••••••"
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
                            {errorMessage && (
                                <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="realName" className="block mb-2 text-sm font-medium text-gray-900">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="realName"
                                id="realName"
                                value={formData.realName}
                                onChange={handleInputChange}
                                className="text-sm rounded-lg block w-full p-2.5 border"
                                placeholder="Chipi"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="contactNumber" className="block mb-2 text-sm font-medium text-gray-900">
                                Contact Number
                            </label>
                            <input
                                type="tel"
                                name="contactNumber"
                                id="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleInputChange}
                                className="text-sm rounded-lg block w-full p-2.5 border"
                                placeholder="123-456-7890"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="petName" className="block mb-2 text-sm font-medium text-gray-900">
                                Pet Name
                            </label>
                            <input
                                type="text"
                                name="petName"
                                id="petName"
                                value={formData.petName}
                                onChange={handleInputChange}
                                className="text-sm rounded-lg block w-full p-2.5 border"
                                placeholder="Carla"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="petSex" className="block mb-2 text-sm font-medium text-gray-900">
                                Pet Sex
                            </label>
                            <select
                                name="petSex"
                                id="petSex"
                                value={formData.petSex}
                                onChange={handleInputChange}
                                className="text-sm rounded-lg block w-full p-2.5 border"
                                required
                            >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="petBreed" className="block mb-2 text-sm font-medium text-gray-900">
                                Pet Breed
                            </label>
                            <input
                                type="text"
                                name="petBreed"
                                id="petBreed"
                                value={formData.petBreed}
                                onChange={handleInputChange}
                                className="text-sm rounded-lg block w-full p-2.5 border"
                                placeholder="Golden Retriever"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="petAge" className="block mb-2 text-sm font-medium text-gray-900">
                                Pet Age
                            </label>
                            <input
                                type="number"
                                name="petAge"
                                id="petAge"
                                value={formData.petAge}
                                onChange={handleInputChange}
                                className="text-sm rounded-lg block w-full p-2.5 border"
                                placeholder="3"
                                required
                            />
                        </div>
                        <div className="text-sm text-gray-700">
                            By signing up, you agree to our{' '}
                            <a href="#" className="text-dark-pastel-orange hover:underline" onClick={openTermsModal}>
                                Terms and Conditions
                            </a>.
                        </div>
                        <button
                            type="submit"
                            className="w-full text-white bg-dark-pastel-orange hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5"
                        >
                            Sign Up
                        </button>
                        <div className="text-sm font-medium text-gray-700">
                            Already have an account?{' '}
                            <a href="#" className="text-dark-pastel-orange font-semibold hover:underline" onClick={openSignInModal}>
                                Sign In
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
