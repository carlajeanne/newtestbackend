import { useState } from "react";
import SignIn from "../auth/SignIn";
import SignUp from "../auth/SignUp";
import ForgotPassword from "../auth/ForgotPassword";
import ResetPassword from "../auth/ResetPassword";
import TermsOfUse from "../auth/TermsOfUse";

const Home = () => {
    const [isSignInOpen, setIsSignInOpen] = useState(false);
    const [isSignUpOpen, setIsSignUpOpen] = useState(false);
    const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);
    const [isResetPass, setResetPassOpen] = useState(false);
    const [isTermsOpen, setTermsOpen] = useState(false);
    const [isVerificationOpen, setVerificationOpen] = useState(false);

    const toggleVerificationModal = () => {
        setVerificationOpen(!isVerificationOpen);
        setIsSignInOpen(false);
        setIsSignUpOpen(false);
        setIsForgotPassOpen(false);
        setResetPassOpen(false);
        setTermsOpen(false);
    };

    const toggleResetPassModal = () => {
        setResetPassOpen(!isResetPass);
        setIsSignInOpen(false);
        setIsSignUpOpen(false);
        setIsForgotPassOpen(false);
        setTermsOpen(false);
        setVerificationOpen(false);
    };

    const toggleSignInModal = () => {
        setIsSignInOpen(!isSignInOpen);
        setIsSignUpOpen(false);
        setIsForgotPassOpen(false);
        setResetPassOpen(false);
        setTermsOpen(false);
        setVerificationOpen(false);
    };

    const toggleSignUpModal = () => {
        setIsSignUpOpen(!isSignUpOpen);
        setIsSignInOpen(false);
        setIsForgotPassOpen(false);
        setResetPassOpen(false);
        setTermsOpen(false);
        setVerificationOpen(false);
    };

    const toggleForgotPassModal = () => {
        setIsForgotPassOpen(!isForgotPassOpen);
        setIsSignInOpen(false);
        setIsSignUpOpen(false);
        setResetPassOpen(false);
        setTermsOpen(false);
        setVerificationOpen(false);
    };

    const toggleTermsModal = () => {
        setTermsOpen(!isTermsOpen);
        setIsForgotPassOpen(false);
        setIsSignInOpen(false);
        setIsSignUpOpen(false);
        setResetPassOpen(false);
        setVerificationOpen(false);
    };

    const openSignUpModal = () => {
        setIsSignUpOpen(true);
        setIsSignInOpen(false);
        setIsForgotPassOpen(false);
        setResetPassOpen(false);
        setTermsOpen(false);
        setVerificationOpen(false);
    };

    const openSignInModal = () => {
        setIsSignInOpen(true);
        setIsSignUpOpen(false);
        setIsForgotPassOpen(false);
        setResetPassOpen(false);
        setTermsOpen(false);
        setVerificationOpen(false);
    };

    const openForgotPassModal = () => {
        setIsForgotPassOpen(true);
        setIsSignInOpen(false);
        setIsSignUpOpen(false);
        setResetPassOpen(false);
        setTermsOpen(false);
        setVerificationOpen(false);
    };

    const openResetPassModal = () => {
        setResetPassOpen(true);
        setIsSignInOpen(false);
        setIsSignUpOpen(false);
        setIsForgotPassOpen(false);
        setTermsOpen(false);
        setVerificationOpen(false);
    };

    const openTermsModal = () => {
        setTermsOpen(true);
        setResetPassOpen(false);
        setIsSignInOpen(false);
        setIsSignUpOpen(false);
        setIsForgotPassOpen(false);
        setVerificationOpen(false);
    };

    const openVerificationModal = () => {
        setVerificationOpen(true);
        setIsSignInOpen(false);
        setIsSignUpOpen(false);
        setIsForgotPassOpen(false);
        setResetPassOpen(false);
        setTermsOpen(false);
    };

    return (
        <div id="home"
            className='text-black bg-landing-page-background bg-cover bg-center min-h-screen flex justify-between items-center px-20 py-8 font-montserrat'
        >
            {/* Left side with text and button */}
            <div className="flex flex-col justify-center items-start w-1/2">
                <h1 className="text-black md:text-15xl text-5xl italic font-bold p-4">
                    DOGGO
                </h1>
                
                <p className="text-black sm:text-xl text-[1rem] italic font-semibold p-2 mt-2">
                    Understand Your Dog's Emotions <br />
                    with Smart Play & Real-Time Monitoring
                </p>

                <div className="mt-5">
                    <button 
                        className="flex flex-shrink-0 justify-center text-white items-center gap-2 w-60 lg:h-14 rounded-full bg-dark-pastel-orange md:text-xl font-bold hover:bg-dark-grayish-orange hover:transition duration-300 py-4 border-4"
                        onClick={toggleSignInModal} 
                    >
                        Get Started
                    </button>
                </div>
            </div>

            {isSignInOpen && <SignIn toggleModal={toggleSignInModal} openSignUpModal={openSignUpModal} openForgotPassModal={openForgotPassModal} />}
            {isSignUpOpen && <SignUp toggleModal={toggleSignUpModal} openSignInModal={openSignInModal} openTermsModal={openTermsModal} />}
            {isForgotPassOpen && <ForgotPassword toggleModal={toggleForgotPassModal} openSignInModal={openSignInModal} openResetPassModal={openResetPassModal} openVerificationModal={openVerificationModal}/>}
            {isTermsOpen && <TermsOfUse toggleModal={toggleTermsModal} openSignUpModal={openSignUpModal}/>}
            {isResetPass && <ResetPassword toggleModal={toggleResetPassModal} toggleSignInModal={toggleSignInModal} />}
            {isVerificationOpen && <VerificationCard toggleModal={toggleVerificationModal} openSignInModal={openSignInModal} openResetPassModal={openResetPassModal} />}
        </div>
    );
}

export default Home