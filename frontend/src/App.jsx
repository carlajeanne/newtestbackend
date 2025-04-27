import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import FetchingPage from "./pages/FetchingPage"
import PetcamPage from "./pages/PetcamPage"
import GalleryPage from "./pages/GalleryPage"
import UserPage from "./pages/UserPage";
import DashboardPage from "./pages/DashboardPage";
import ForgotPassword from '../src/components/auth/ForgotPassword';
import ResetPassword from '../src/components/auth/ResetPassword';

function App() {

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      const verifyToken = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAuthenticated(false);
          return;
        }
    
        try {
          const response = await fetch("https://testdockerbackend.azurewebsites.net/api/auth/verify-token", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
    
          if (response.ok) {
            setIsAuthenticated(true);
          } else {
            const data = await response.json();
            if (data.error === "Token expired" || data.error === "Invalid token") {
              setIsAuthenticated(false);
              localStorage.removeItem("token");
              localStorage.removeItem("user_id");
            }
          }
        } catch (error) {
          console.error("Token verification failed:", error);
        }
      };
    
      verifyToken();
    }, []); 
    
    return (
        <div className='font-montserrat'>
            <Router>
                <Routes>
                    <Route path="/" element={isAuthenticated ? <Navigate to="/fetching-page" /> : <LandingPage />} />
                    <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/fetching-page" /> : <ForgotPassword />} />
                    <Route path="/reset-password" element={isAuthenticated ? <Navigate to="/fetching-page" /> : <ResetPassword />} />


                <Route element={<ProtectedRoute />}>
                    <Route path="/fetching-page" element={<FetchingPage />} />
                    <Route path="/petcam-page" element={<PetcamPage />} />
                    <Route path="/gallery-page" element={<GalleryPage />} />
                    <Route path="/account" element={<UserPage />} />
                    <Route path="/dashboard-page" element={<DashboardPage />} />
                </Route>
                </Routes>
            </Router>
        </div>
    )
}

export default App
