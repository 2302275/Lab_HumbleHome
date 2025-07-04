import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

export default function VerifyOtp({ setUser, fetchProfile }) {
  const [otp, setOtp] = useState("");
  const [authorized, setAuthorized] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const user_id = location.state?.user_id || sessionStorage.getItem("pending_2fa_user_id");

  const token = localStorage.getItem("token");
  const hasPending2FA = Boolean(user_id);

  useEffect(() => {
    if (!hasPending2FA && !token) {
      toast.error("Access denied. Please log in first.");
      navigate("/login");
    }

    if (!hasPending2FA && token) {
      setAuthorized(false); // Show alternate "Access Denied" view
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user_id) {
      toast.error("Session expired. Please log in again.");
      return;
    }

    const response = await fetch("http://localhost:5000/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, otp }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      setUser(data.user);
      await fetchProfile();
      toast.success("2FA successful!");
      sessionStorage.removeItem("pending_2fa_user_id");
      navigate("/");
    } else {
      toast.error(data.message);
    }
  };

  if (!authorized) {
    return (
      <div className="py-10 flex items-center justify-center px-4">
        <div className="bg-white w-full max-w-xl p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-semibold mb-4 text-red-600">Access Denied</h2>
          <p className="text-sm text-gray-600">
            This page is only for verifying a recent login attempt. You’re already logged in.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-semibold"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-xl p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Enter OTP</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            minLength={6}
            value={otp}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d{0,6}$/.test(value)) setOtp(value);
            }}
            placeholder="Enter 6-digit code"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            className="w-full py-2 rounded-md text-white font-semibold transition bg-orange-500 hover:bg-orange-600"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}
