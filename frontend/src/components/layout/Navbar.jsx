import { useState } from 'react';
import { CircleUser, LogOut, Settings, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false); 
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
    const navigate = useNavigate();
    const location = useLocation();

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const isActive = (path) => location.pathname === path; 

    const handleNavigation = (path) => {
        setIsOpen(false);
        navigate(path);
    };

    const handleSignOutClick = () => {
        // Clear all auth-related items from localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_id");
    
        // Force re-render of other components listening to storage events
        window.dispatchEvent(new Event("storage"));
        
        // Use replace to prevent going back to protected routes
        navigate("/", { replace: true });
      };

    return (
        <nav className="fixed w-full flex items-center justify-between px-5 lg:px-20 bg-white shadow-md z-50">
            {/* Logo Section */}
            <div className="flex items-center h-14 max-w-full">
                    <div className="flex items-center h-14 max-w-full">
                        <img src="/favicon.png" alt="Website Logo" className="w-11 h-11" />
                        <p className="pl-5 text-3xl text-dark-pastel-orange font-extrabold">DOGGO</p>
                    </div>
                
            </div>

            {/* Desktop Menu */}
            <ul className="hidden text-gray-600 md:flex md:flex-row lg:mr-10 items-center space-x-10">
                <li>
                    <button
                        className={`font-medium hover:text-dark-grayish-orange transition duration-300 ${
                            isActive("/petcam-page") ? "text-dark-pastel-orange font-semibold" : ""
                        }`}
                        onClick={() => handleNavigation("/petcam-page")}
                    >
                        Pet Cam
                    </button>
                </li>
                <li>
                    <button
                        className={`font-medium hover:text-dark-grayish-orange transition duration-300 ${
                            isActive("/dashboard-page") ? "text-dark-pastel-orange font-semibold" : ""
                        }`}
                        onClick={() => handleNavigation("/dashboard-page")}
                    >
                        Dashboard
                    </button>
                </li>
                <li>
                    <button
                        className={`font-medium hover:text-dark-grayish-orange transition duration-300 ${
                            isActive("/fetching-page") ? "text-dark-pastel-orange font-semibold" : ""
                        }`}
                        onClick={() => handleNavigation("/fetching-page")}
                    >
                        Fetching Device
                    </button>
                </li>
                <li>
                    <button
                        className={`font-medium hover:text-dark-grayish-orange transition duration-300 ${
                            isActive("/gallery-page") ? "text-dark-pastel-orange font-semibold" : ""
                        }`}
                        onClick={() => handleNavigation("/gallery-page")}
                    >
                        Gallery
                    </button>
                </li>
                <li className="relative">
                    <button onClick={toggleDropdown} className={`font-medium hover:text-dark-grayish-orange transition duration-300 ${
                            isActive("/account") ? "text-dark-pastel-orange font-semibold" : ""
                        }`}>
                        <CircleUser aria-hidden="true" />
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute z-100 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 top-12 right-0">
                            <ul className="py-2 text-sm text-gray-600 text-md font-medium">
                                <li>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNavigation("/account");
                                        }}
                                        className="flex px-4 py-2 hover:text-yellow"
                                    >
                                        <User className="h-5 w-5 mr-2" /> Account
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="flex px-4 py-2 hover:text-yellow"
                                    >
                                        <Settings className="h-5 w-5 mr-2" /> Settings
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleSignOutClick();
                                        }}
                                        className="flex px-4 py-2 hover:text-yellow"
                                    >
                                        <LogOut className="h-5 w-5 mr-2" /> Sign out
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </li>
            </ul>

            {/* Mobile Menu Button */}
            <button
                className="md:hidden flex items-center p-2 rounded-md focus:outline-none hover:text-yellow transition duration-300"
                onClick={() => setIsOpen(!isOpen)}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Mobile Menu */}
            {isOpen && (
                <ul className="absolute top-10 left-0 w-full bg-white rounded-lg py-4 flex flex-col space-y-4 items-center md:hidden shadow-md">
                    <li>
                        <button
                            className={`font-medium hover:text-yellow transition duration-300 ${
                                isActive("/petcam-page") ? "text-black font-semibold" : ""
                            }`}
                            onClick={() => handleNavigation("/petcam-page")}
                        >
                            Pet Cam
                        </button>
                    </li>
                    <li>
                        <button
                            className={`font-medium hover:text-yellow transition duration-300 ${
                                isActive("/dashboard-page") ? "text-black font-semibold" : ""
                            }`}
                            onClick={() => handleNavigation("/dashboard-page")}
                        >
                            Dashboard
                        </button>
                    </li>
                    <li>
                        <button
                            className={`font-medium hover:text-yellow transition duration-300 ${
                                isActive("/fetching-page") ? "text-black font-semibold" : ""
                            }`}
                            onClick={() => handleNavigation("/fetching-page")}
                        >
                            Fetching Device
                        </button>
                    </li>
                    <li>
                        <button
                            className={`font-medium hover:text-yellow transition duration-300 ${
                                isActive("/gallery-page") ? "text-black font-semibold" : ""
                            }`}
                            onClick={() => handleNavigation("/gallery-page")}
                        >
                            Gallery
                        </button>
                        
                    
                    </li>
                    <hr className="border-t border-black w-3/4" />
                    <li>
                        <button
                            className={`font-medium hover:text-yellow transition duration-300 ${
                                isActive("/account") ? "text-black font-semibold" : ""
                            }`}
                            onClick={() => handleNavigation("/account")}
                        >
                            My Account
                        </button>
                    
                    </li>
                    <li>
                        <button
                            className={`font-medium hover:text-yellow transition duration-300 ${
                                isActive("/gallery-page") ? "text-black font-semibold" : ""
                            }`}
                        >
                            Settings
                        </button>
                    
                    </li>
                    <li>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                handleSignOutClick();
                            }}
                            className="flex px-4 py-2 text-red-600 hover:text-yellow"
                        >
                            Sign Out
                        </button>
                    
                    </li>
                </ul>
            )}
        </nav>
    );
}
