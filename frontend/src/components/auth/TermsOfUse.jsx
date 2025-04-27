import { useEffect } from "react";

const TermsOfUse = ({ openSignUpModal }) => {
  useEffect(() => {
    // Disable scrolling when the modal is open
    document.body.style.overflow = "hidden";

    return () => {
      // Re-enable scrolling when the modal is closed
      document.body.style.overflowY = "auto";
    };
  }, []);

  return (
    <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex justify-center items-center overflow-auto">
        <div className="relative px-4 max-h-full rounded-lg shadow overflow-y-auto">
          <div className="w-2/3 mx-auto my-4 p-6 bg-very-bright-gray rounded-lg shadow-md">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-black ">
                DOGGO Terms of Use
                  <p className="text-gray-700 text-lg mt-2 mb-4">
                    Effective Date: [Insert Date]
                  </p>
                </h3>
                <button
                    onClick={openSignUpModal}
                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    type="button"
                >
                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                    </svg>
                    <span className="sr-only">Close modal</span>
                </button>
            </div>

            <div className="space-y-4">
          
              <h2 className="text-xl font-semibold mt-6">1. Use of Services</h2>
              <p className="text-gray-700">
                - You must be at least 18 years old or have parental/guardian consent...<br />
                - You agree to use the DOGGO website and device only for lawful purposes...
              </p>

              <h2 className="text-xl font-semibold">2. Intellectual Property</h2>
              <p className="text-gray-700">
                All content, features, and functionality available on the DOGGO website are the exclusive property of DOGGO.
              </p>

              <h2 className="text-xl font-semibold mb-2">3. User Accounts</h2>
              <p className="text-gray-700">
                When you create an account, you must provide accurate information. You are responsible for any activity under your account.
              </p>

              <h2 className="text-xl font-semibold">4. Device Use</h2>
              <p className="text-gray-700">
                The DOGGO device should be used in a safe environment, ensuring the safety of your pet and others.
              </p>

              <h2 className="text-xl font-semibold">5. Prohibited Activities</h2>
              <p className="text-gray-700">
                You agree not to engage in prohibited activities, including violating laws, uploading harmful content, or attempting to interfere with the website or device.
              </p>

              <h2 className="text-xl font-semibold">6. Disclaimer</h2>
              <p className="text-gray-700">
                DOGGO is provided “as is” without any warranties. We do not guarantee uninterrupted or error-free access.
              </p>
            </div>
          </div>
      </div>
    </div>
  );
};

export default TermsOfUse;