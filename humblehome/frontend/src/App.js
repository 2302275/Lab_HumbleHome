import { useEffect, useState, useContext } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Header from "./components/Header";
import Footer from "./components/Footer";
import AdminRoute from "./components/AdminRoute";
import UserRoute from "./components/UserRoute";

import HomePage from "./pages/HomePage";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Cart from "./pages/Cart.jsx";
import Payment from "./pages/Payment.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
// import ListOfReviews from "./pages/ListOfReviews.jsx";
import PasswordResetConfirmation from "./pages/ResetConfimation.jsx";
import VerifyOtp from "./pages/VerifyOtp.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Contact from "./pages/Contact.jsx";

import { SessionTimeoutContext } from "./components/SessionTimeoutContext.jsx";

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export default function App() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showSessionModal, setShowSessionModal] = useState(false);

  const { isInactive } = useContext(SessionTimeoutContext);

  // Add these token refresh functions inside your App component
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      
      if (!refreshToken) {
        return null;
      }
      
      const response = await fetch("/api/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access_token", data.access_token);
        console.log("Access token refreshed successfully");
        return data.access_token;
      } else {
        console.log("Failed to refresh token:", response.status);
        return null;
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  };

  // Wrapper for fetch that handles token refresh
  const authenticatedFetch = async (url, options = {}) => {
    let accessToken = localStorage.getItem("access_token");
    
    // Set up headers with the access token
    const headers = {
      ...options.headers,
      "Authorization": `Bearer ${accessToken}`
    };
    
    // First attempt with current token
    let response = await fetch(url, { ...options, headers });
    
    // If unauthorized (token expired), try refreshing
    if (response.status === 401) {
      console.log("Token expired, attempting refresh...");
      const newToken = await refreshAccessToken();
      
      // If refresh successful, retry original request with new token
      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, headers });
      } else {
        // Clear tokens and redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        setUser(null);
        if (window.location.pathname !== "/login") {
          navigate("/login");
        }
      }
    }
    
    return response;
  };

  const fetchProfile = async () => {
    const access_token = localStorage.getItem("access_token");
    if (!access_token) {
      setLoadingUser(false);
      return;
    }

    try {
      const res = await authenticatedFetch("/api/me");
      const data = await res.json();
      
      if (res.ok) {
        setUser(data.user);
      } else {
        // If it's still not OK after potential token refresh
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        setUser(null);
        alert("Your session has expired. Please log in again.");
        navigate("/login");
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoadingUser(false);
    }
  };

  // Make authenticatedFetch available to child components
  // You can pass this down via props or context if needed
  useEffect(() => {
    // Expose authenticatedFetch to global window object (not ideal, but works without creating a file)
    // window.authenticatedFetch = authenticatedFetch;
    
    fetchProfile();
  }, []);

  useEffect(() => {
    if (user && isInactive) {
      setShowSessionModal(true);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("pending_2fa_user_id");
      setUser(null);
    }
  }, [isInactive, user]);

  const handleLogout = async () => {
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");
    if (accessToken) {
      try {
        await authenticatedFetch("/api/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ refresh_token: refreshToken })
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="w-full flex items-center flex-col bg-page min-h-screen">
        <Header user={user} onLogout={handleLogout} />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetail user={user} authenticatedFetch={authenticatedFetch} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setUser={setUser} fetchProfile={fetchProfile} />} />
          <Route path="/verify-otp" element={<VerifyOtp setUser={setUser} fetchProfile={fetchProfile} />} />
          <Route path="/forgotpassword" element={<ForgotPassword setUser={setUser} fetchProfile={fetchProfile} />} />
          <Route path="/reset-password/confirm" element={<PasswordResetConfirmation />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          <Route path="/admin" element={
            <AdminRoute user={user} loading={loadingUser}>
              <AdminDashboard user={user} setUser={setUser} authenticatedFetch={authenticatedFetch}/>
            </AdminRoute>
          } />

          <Route path="/cart" element={
            <UserRoute user={user} loading={loadingUser}>
              <Cart user={user} authenticatedFetch={authenticatedFetch} />
            </UserRoute>
          } />

          <Route path="/contact" element={
            <UserRoute user={user} loading={loadingUser}>
              <Contact user={user} authenticatedFetch={authenticatedFetch} />
            </UserRoute>
          } />

          <Route path="/profile" element={
            <UserRoute user={user} loading={loadingUser}>
              <Profile user={user} setUser={setUser} authenticatedFetch={authenticatedFetch} />
            </UserRoute>
          } />

          <Route
            path="/hhpanel"
            element={
              <AdminLogin setUser={setUser} fetchProfile={fetchProfile} />
            }
          />
          
          <Route path="/payment" element={
            <UserRoute user={user} loading={loadingUser}>
              <Payment user={user} authenticatedFetch={authenticatedFetch} />
            </UserRoute>
          } />

          <Route path="/hhpanel" element={<AdminLogin setUser={setUser} fetchProfile={fetchProfile} />} />
        </Routes>

        {showSessionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-md shadow-md text-center max-w-sm">
              <h2 className="text-lg font-semibold text-red-600 mb-2">Session Expired</h2>
              <p className="text-sm text-gray-600 mb-4">
                You were logged out for being inactive for 15 minutes. Please log in again.
              </p>
              <button
                onClick={() => {
                  setShowSessionModal(false);
                  navigate("/login");
                }}
                className="bg-orange-500 hover:bg-orange-600 px-6 py-2 text-white rounded-md"
              >
                Log In Again
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
