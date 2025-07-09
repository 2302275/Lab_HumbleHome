import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

export default function PasswordResetConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success state (if coming from the reset form)
  useEffect(() => {
    if (location.state?.fromReset) {
      toast.success("Password reset successfully!");
    }
  }, [location.state]);

  return (
    <div className="py-10 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-xl p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-semibold mb-6">Password Reset Successful</h2>
        
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-green-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        
        <p className="text-gray-700 mb-6">
          Your password has been successfully updated. You can now log in with your new password.
        </p>
        
        <button
          onClick={() => navigate("/login")}
          className="w-full py-2 rounded-md text-white font-semibold transition bg-orange-500 hover:bg-orange-600"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
}