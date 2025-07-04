import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

export default function VerifyOtp({ setUser, fetchProfile }) {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const user_id = location.state?.user_id;

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      navigate("/");
    } else {
      toast.error(data.message);
    }
  };

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
              if (/^\d{0,6}$/.test(value)) setOtp(value);  // Allow only up to 6 digits
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
