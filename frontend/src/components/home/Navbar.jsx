import { useState } from 'react'
import SignUp from '../auth/SignUp';
import SignIn from '../auth/SignIn';
import ForgotPassword from '../auth/ForgotPassword';
import ResetPassword from '../auth/ResetPassword';
import TermsOfUse from '../auth/TermsOfUse';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);
  const [isResetPass, setResetPassOpen] = useState(false);
  const [isTermsOpen, setTermsOpen] = useState(false);

  const toggleResetPassModal = () => {
    setResetPassOpen(!isResetPass);
    setIsSignInOpen(false);
    setIsSignUpOpen(false);
    setIsForgotPassOpen(false);
    setTermsOpen(false);
  };

  const toggleSignInModal = () => {
      setIsSignInOpen(!isSignInOpen);
      setIsSignUpOpen(false);
      setIsForgotPassOpen(false);
      setResetPassOpen(false);
      setTermsOpen(false);
  };

  const toggleSignUpModal = () => {
      setIsSignUpOpen(!isSignUpOpen);
      setIsSignInOpen(false);
      setIsForgotPassOpen(false);
      setResetPassOpen(false);
      setTermsOpen(false);
  };

  const toggleForgotPassModal = () => {
      setIsForgotPassOpen(!isForgotPassOpen);
      setIsSignInOpen(false);
      setIsSignUpOpen(false);
      setResetPassOpen(false);
      setTermsOpen(false);
  };

  const toggleTermsModal = () => {
      setTermsOpen(!isTermsOpen);
      setIsForgotPassOpen(false);
      setIsSignInOpen(false);
      setIsSignUpOpen(false);
      setResetPassOpen(false);
  };

  const openSignUpModal = () => {
      setIsSignUpOpen(true);
      setIsSignInOpen(false);
      setIsForgotPassOpen(false);
      setResetPassOpen(false);
      setTermsOpen(false);
  };

  const openSignInModal = () => {
      setIsSignInOpen(true);
      setIsSignUpOpen(false);
      setIsForgotPassOpen(false);
      setResetPassOpen(false);
      setTermsOpen(false);
  };

  const openForgotPassModal = () => {
      setIsForgotPassOpen(true);
      setIsSignInOpen(false);
      setIsSignUpOpen(false);
      setResetPassOpen(false);
      setTermsOpen(false);
  };

  const openResetPassModal = () => {
      setResetPassOpen(true);
      setIsSignInOpen(false);
      setIsSignUpOpen(false);
      setIsForgotPassOpen(false);
      setTermsOpen(false);
  };

  const openTermsModal = () => {
      setTermsOpen(true);
      setResetPassOpen(false);
      setIsSignInOpen(false);
      setIsSignUpOpen(false);
      setIsForgotPassOpen(false);
  };

  const handleScrollTo = (id, e) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      setIsOpen(false);
    } else {
      console.error(`Element with id ${id} not found.`);
    }
  };

  return (
    <nav className="fixed w-full flex items-center justify-between px-5 sm:px-20 bg-white shadow-md z-50">
      <div className="flex items-center h-14 max-w-full">
        <img src="/favicon.png" alt="Website Logo" className="w-11 h-11" />
        <p className="pl-5 text-3xl text-dark-pastel-orange font-extrabold">DOGGO</p>
      </div>

      {/* Desktop Menu */}
      <ul className="hidden sm:flex flex-row items-center space-x-10 ">
        <li>
          <a href="#" className="font-medium hover:text-dark-grayish-orange hover:transition duration-300" onClick={(e) => handleScrollTo('home', e)}>
            Home
          </a>
        </li>
        <li>
          <a href="#" className="font-medium hover:text-dark-grayish-orange hover:transition duration-300" onClick={(e) => handleScrollTo('about', e)}>
            About Us
          </a>
        </li>
        <li>
          <a href="#" className="font-medium hover:text-dark-grayish-orange hover:transition duration-300" onClick={(e) => handleScrollTo('contact', e)}>
            Contact Us
          </a>
        </li>
        <li>
          <button 
            className="font-medium text-white rounded-full bg-dark-pastel-orange px-3 py-2 hover:bg-dark-grayish-orange transition duration-300" 
            onClick={toggleSignInModal}
          >
            Get Started
          </button>
        </li>
      </ul>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden flex items-center p-2 rounded-md focus:outline-none hover:text-dark-grayish-orange hover:transition duration-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <ul className="absolute top-14 left-0 w-full bg-white rounded-lg py-4 flex flex-col space-y-4 items-center md:hidden">
          <li>
            <a href="#" className="text-sm font-medium hover:text-dark-grayish-orange hover:transition duration-300" onClick={(e) => handleScrollTo('home', e)}>
              Home
            </a>
          </li>
          <li>
            <a href="#" className="text-sm font-medium hover:text-dark-grayish-orange hover:transition duration-300" onClick={(e) => handleScrollTo('about', e)}>
              About Us
            </a>
          </li>
          <li>
            <a href="#" className="text-sm font-medium hover:text-dark-grayish-orange hover:transition duration-300" onClick={(e) => handleScrollTo('contact', e)}>
              Contact Us
            </a>
          </li>
          <li>
            <button 
              className="text-sm font-medium text-white rounded-full bg-dark-pastel-orange px-3 py-2 hover:bg-dark-grayish-orange transition duration-300"
              onClick={toggleSignInModal}
            >
              Get Started
            </button>
          </li>
        </ul>
      )}

      {isSignInOpen && <SignIn toggleModal={toggleSignInModal} openSignUpModal={openSignUpModal} openForgotPassModal={openForgotPassModal} />}
      {isSignUpOpen && <SignUp toggleModal={toggleSignUpModal} openSignInModal={openSignInModal} openTermsModal={openTermsModal} />}
      {isForgotPassOpen && <ForgotPassword toggleModal={toggleForgotPassModal} openSignInModal={openSignInModal} openResetPassModal={openResetPassModal}/>}
      {isTermsOpen && <TermsOfUse toggleModal={toggleTermsModal} openSignUpModal={openSignUpModal}/>}
      {isResetPass && <ResetPassword toggleModal={toggleResetPassModal} toggleSignInModal={toggleSignInModal} />}
</nav>
  );
}

export default Navbar